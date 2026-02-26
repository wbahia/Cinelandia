import { Request, Response } from 'express';
import { CreateClienteUseCase } from '../use-cases/create-cliente.use-case';

const createClienteUseCase = new CreateClienteUseCase();

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClienteInput'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       409:
 *         description: Email ou CPF já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const postCliente = async (req: Request, res: Response) => {
    try {
        const cliente = await createClienteUseCase.execute(req.body);
        return res.status(201).json(cliente);
    } catch (error: any) {
        // P2002 é o código de erro de violação de constraint única no Prisma
        if (error.code === 'P2002') {
            return res.status(409).json({ erro: 'Email ou CPF já cadastrado' });
        }
        return res.status(400).json({ erro: error.message });
    }
};