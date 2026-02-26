import { Request, Response } from 'express';
import { GetFilmesUseCase } from '../use-cases/get-filmes.use-case';

const getFilmesUseCase = new GetFilmesUseCase();

/**
 * @openapi
 * /filmes:
 *   get:
 *     summary: Lista todos os filmes
 *     description: Retorna a lista de filmes em cartaz.
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 */
export const getFilmes = async (req: Request, res: Response) => {
    try {
        const filmes = await getFilmesUseCase.execute();
        return res.json(filmes);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao listar filmes' });
    }
};