import { Request, Response } from 'express';
import { CreateClienteUseCase } from '../use-cases/create-cliente.use-case';
import { GetClienteReservasUseCase } from '../use-cases/get-cliente-reservas.use-case';

const createClienteUseCase = new CreateClienteUseCase();
const getClienteReservasUseCase = new GetClienteReservasUseCase();

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



/**
 * @swagger
 * /clientes/{id}/reservas:
 *   get:
 *     summary: Lista o histórico de reservas de um cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de reservas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserva'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const getReservasByCliente = async (req: Request, res: Response) => {
    try {
        const result = await getClienteReservasUseCase.execute(Number(req.params.id));
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
};