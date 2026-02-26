import { Request, Response } from 'express';
import { GetSessoesUseCase } from '../use-cases/get-sessoes.use-case';
import { GetSessaoAssentosUseCase } from '../use-cases/get-sessao-assentos.use-case';
import { GetSessaoByIdUseCase } from '../use-cases/get-sessao-by-id.use-case';
import { GetSalaAssentosUseCase } from '../use-cases/get-sala-assentos.use-case';

const getSessoesUseCase = new GetSessoesUseCase();
const getSessaoAssentosUseCase = new GetSessaoAssentosUseCase(
    new GetSessaoByIdUseCase(),
    new GetSalaAssentosUseCase()
);


/**
 * @swagger
 * /sessoes:
 *   get:
 *     summary: Lista as sessões disponíveis
 *     tags: [Sessões]
 *     parameters:
 *       - in: query
 *         name: filme_id
 *         schema:
 *           type: integer
 *         description: ID do filme para filtrar as sessões
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *         description: Data para filtrar as sessões (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de sessões retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SessaoListItem'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const getSessoes = async (req: Request, res: Response) => {
    try {
        const { filme_id, data } = req.query;
        const result = await getSessoesUseCase.execute({
            filmeId: filme_id ? Number(filme_id) : undefined,
            data: data as string
        });
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao listar sessões' });
    }
};


/**
 * @swagger
 * /sessoes/{id}/assentos:
 *   get:
 *     summary: Lista os assentos de uma sessão com disponibilidade
 *     tags: [Sessões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da sessão
 *     responses:
 *       200:
 *         description: Assentos da sessão retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessaoAssentos'
 *       404:
 *         description: Sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const getAssentosBySessao = async (req: Request, res: Response) => {
    try {
        const result = await getSessaoAssentosUseCase.execute(Number(req.params.id));
        return res.json(result);
    } catch (error: any) {
        return res.status(404).json({ erro: error.message });
    }
};