import { Request, Response } from 'express';
import { CreateReservaUseCase } from '../use-cases/create-reserva.use-case';
import { GetAssentosByIdsUseCase } from '../use-cases/get-assentos-by-ids.use-case';
import { GetSessaoByIdUseCase } from '../use-cases/get-sessao-by-id.use-case';

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