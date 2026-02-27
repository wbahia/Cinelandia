import { Request, Response } from 'express';
import { CreateReservaUseCase } from '../use-cases/create-reserva.use-case';
import { GetAssentosByIdsUseCase } from '../use-cases/get-assentos-by-ids.use-case';
import { GetSessaoByIdUseCase } from '../use-cases/get-sessao-by-id.use-case';
import { GetReservaByIdUseCase } from '../use-cases/get-reserva-by-id.use-case';
import { CancelReservaUseCase } from '../use-cases/cancel-reserva.use-case';

const getReservaByIdUseCase = new GetReservaByIdUseCase();
const cancelReservaUseCase = new CancelReservaUseCase();

const createReservaUseCase = new CreateReservaUseCase(
  new GetAssentosByIdsUseCase(),
  new GetSessaoByIdUseCase()
);

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Cria uma nova reserva de assentos
 *     tags: [Reservas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservaInput'
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Erro de negócio (assento ocupado ou já vendido)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroMessage'
 */
export const postReserva = async (req: Request, res: Response) => {
  try {
    const result = await createReservaUseCase.execute(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
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
 *     responses:
 *       200:
 *         description: Dados da reserva e ingressos
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
 */
export const getReserva = async (req: Request, res: Response) => {
    try {
        const result = await getReservaByIdUseCase.execute(Number(req.params.id));
        return res.json(result);
    } catch (error: any) {
        return res.status(404).json({ error: error.message });
    }
};

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Cancela uma reserva e libera os assentos
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reserva cancelada e assentos liberados
 *       400:
 *         description: Erro ao cancelar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const deleteReserva = async (req: Request, res: Response) => {
    try {
        await cancelReservaUseCase.execute(Number(req.params.id));
        return res.json({ message: 'Reserva cancelada e assentos liberados' });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};