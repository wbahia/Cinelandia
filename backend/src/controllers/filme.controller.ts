import { Request, Response } from 'express';
import { GetFilmesUseCase } from '../use-cases/get-filmes.use-case';
import { GetFilmeByIdUseCase } from '../use-cases/get-filme-by-id.use-case';

const getFilmesUseCase = new GetFilmesUseCase();
const getFilmeByIdUseCase = new GetFilmeByIdUseCase();

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


/**
 * @swagger
 * /filmes/{id}:
 *   get:
 *     summary: Detalhes de um filme específico
 *     tags: [Filmes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do filme (Cache 24h)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Filme'
 *       404:
 *         description: Filme não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const getFilmeById = async (req: Request, res: Response) => {
    try {
        const result = await getFilmeByIdUseCase.execute(Number(req.params.id));
        return res.json(result);
    } catch (error: any) {
        return res.status(404).json({ error: error.message });
    }
};