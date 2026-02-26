import { Request, Response } from 'express';
import { GetFilmesUseCase } from '../use-cases/get-filmes.use-case';

const getFilmesUseCase = new GetFilmesUseCase();

/**
 * @swagger
 * /filmes:
 *   get:
 *     summary: Lista todos os filmes em cartaz
 *     tags: [Filmes]
 *     responses:
 *       200:
 *         description: Lista de filmes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Filme'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const getFilmes = async (req: Request, res: Response) => {
    try {
        const filmes = await getFilmesUseCase.execute();
        return res.json(filmes);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao listar filmes' });
    }
};