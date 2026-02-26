import { Request, Response } from 'express';
import { CreateReservaUseCase } from '../use-cases/create-reserva.use-case';
import { GetAssentosByIdsUseCase } from '../use-cases/get-assentos-by-ids.use-case';
import { GetSessaoByIdUseCase } from '../use-cases/get-sessao-by-id.use-case';

const createReservaUseCase = new CreateReservaUseCase(
  new GetAssentosByIdsUseCase(),
  new GetSessaoByIdUseCase()
);

/**
 * @openapi
 * /reservas:
 *   post:
 *     summary: Cria uma nova reserva de assentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clienteId:
 *                 type: integer
 *               sessaoId:
 *                 type: integer
 *               assentosIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *       400:
 *         description: Erro de negócio (assento ocupado)
 */
export const postReserva = async (req: Request, res: Response) => {
  try {
    const result = await createReservaUseCase.execute(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};