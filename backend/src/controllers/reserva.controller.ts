import { Request, Response } from 'express';
import { CreateReservaUseCase } from '../use-cases/create-reserva.use-case';
import { GetAssentosByIdsUseCase } from '../use-cases/get-assentos-by-ids.use-case';
import { GetSessaoByIdUseCase } from '../use-cases/get-sessao-by-id.use-case';
import { GetReservaByIdUseCase } from '../use-cases/get-reserva-by-id.use-case';
import { CancelReservaUseCase } from '../use-cases/cancel-reserva.use-case';
import { prisma } from '../lib/prisma';

const getReservaByIdUseCase = new GetReservaByIdUseCase();
const cancelReservaUseCase  = new CancelReservaUseCase();
const createReservaUseCase  = new CreateReservaUseCase(
  new GetAssentosByIdsUseCase(),
  new GetSessaoByIdUseCase()
);

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Cria uma nova reserva de assentos
 *     description: >
 *       Realiza a reserva de um ou mais assentos para uma sessão. O processo utiliza
 *       locks no Redis (TTL 60s) para evitar double-booking em cenários concorrentes,
 *       seguido de transação no banco com double-check de disponibilidade.
 *     tags: [Reservas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservaInput'
 *           example:
 *             cliente_id: 1
 *             sessao_id: 10
 *             assentos_ids: [42, 43]
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Dados inválidos ou erro de negócio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *       409:
 *         description: Um ou mais assentos já reservados ou em processo de reserva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Os seguintes assentos já foram vendidos - A1, A2
 *               assentos_indisponiveis: [42, 43]
 *       422:
 *         description: Sessão não encontrada ou encerrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Sessao nao encontrada ou encerrada
 */
export const postReserva = async (req: Request, res: Response) => {
  try {
    const { cliente_id, sessao_id, assentos_ids } = req.body;

    // Validação explícita do body
    if (!cliente_id || !sessao_id || !Array.isArray(assentos_ids) || assentos_ids.length === 0) {
      return res.status(400).json({
        erro: 'Campos obrigatórios ausentes: cliente_id, sessao_id e assentos_ids (array não vazio)',
        recebido: { cliente_id, sessao_id, assentos_ids }
      });
    }

    const reserva = await createReservaUseCase.execute({
      clienteId: Number(cliente_id),
      sessaoId:  Number(sessao_id),
      assentosIds: assentos_ids.map(Number),
    });

    const full = await prisma.reserva.findUnique({
      where: { id: reserva.id },
      include: {
        sessao: { include: { filme: true, sala: true } },
        assentos: { include: { assento: true } }
      }
    });

    if (!full) return res.status(500).json({ erro: 'Erro ao recuperar reserva criada' });

    return res.status(201).json({
      reserva_id:     full.id,
      status:         full.status,
      total_assentos: full.totalAssentos,
      valor_unitario: Number(full.sessao.valorUnitario),
      valor_total:    Number(full.valorTotal),
      assentos: full.assentos.map(ra => ({
        fileira: ra.assento.fileira,
        numero:  ra.assento.numero,
      })),
      sessao: {
        filme:    full.sessao.filme.titulo,
        data_hora: full.sessao.dataHora,
        sala:     `Sala ${full.sessao.sala.numero} - ${full.sessao.sala.tipo}`,
      }
    });

  } catch (error: any) {
    const msg: string = error.message ?? '';
    console.error('[POST /reservas] erro:', msg);

    if (msg.startsWith('ASSENTO_OCUPADO')) {
      return res.status(409).json({ erro: msg.replace('ASSENTO_OCUPADO: ', '') });
    }
    if (msg.startsWith('ASSENTOS_INDISPONIVEIS')) {
      return res.status(409).json({
        erro: msg.replace('ASSENTOS_INDISPONIVEIS: ', ''),
        assentos_indisponiveis: [],
      });
    }
    if (msg === 'SESSAO_NAO_ENCONTRADA') {
      return res.status(422).json({ erro: 'Sessao nao encontrada ou encerrada' });
    }

    return res.status(400).json({ erro: msg });
  }
};

/**
 * @swagger
 * /reservas/{id}:
 *   get:
 *     summary: Consulta detalhes de uma reserva
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 100
 *     responses:
 *       200:
 *         description: Dados da reserva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Reserva não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Reserva nao encontrada
 */
export const getReserva = async (req: Request, res: Response) => {
  try {
    // O use case já retorna o shape final mapeado — basta repassar diretamente
    const reserva = await getReservaByIdUseCase.execute(Number(req.params.id));
    return res.json(reserva);
  } catch (error: any) {
    if (error.message === 'RESERVA_NAO_ENCONTRADA')
      return res.status(404).json({ erro: 'Reserva nao encontrada' });
    return res.status(500).json({ erro: error.message });
  }
};

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Cancela uma reserva e libera os assentos
 *     description: >
 *       Cancela a reserva, remove os vínculos de ReservaAssento e atualiza o status
 *       para CANCELADA. Após o cancelamento, os assentos liberados são transmitidos
 *       via WebSocket para todos os clientes que estão visualizando a sessão.
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 100
 *     responses:
 *       200:
 *         description: Reserva cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reserva_id:
 *                   type: integer
 *                   example: 100
 *                 status:
 *                   type: string
 *                   example: CANCELADA
 *       404:
 *         description: Reserva não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Reserva nao encontrada
 *       422:
 *         description: Reserva já cancelada ou não pode ser cancelada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Reserva ja cancelada ou nao pode ser cancelada
 */
export const deleteReserva = async (req: Request, res: Response) => {
  try {
    const reserva = await cancelReservaUseCase.execute(Number(req.params.id));
    return res.json({ reserva_id: reserva.id, status: 'CANCELADA' });
  } catch (error: any) {
    const msg: string = error.message ?? '';
    if (msg === 'RESERVA_NAO_ENCONTRADA')  return res.status(404).json({ erro: 'Reserva nao encontrada' });
    if (msg === 'RESERVA_JA_CANCELADA')    return res.status(422).json({ erro: 'Reserva ja cancelada ou nao pode ser cancelada' });
    return res.status(400).json({ erro: msg });
  }
};