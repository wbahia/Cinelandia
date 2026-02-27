import { Request, Response } from 'express';
import { CreateClienteUseCase } from '../use-cases/create-cliente.use-case';
import { GetClientesUseCase } from '../use-cases/get-clientes.use-case';
import { GetClienteByIdUseCase } from '../use-cases/get-cliente-by-id.use-case';
import { UpdateClienteUseCase } from '../use-cases/update-cliente.use-case';
import { DeleteClienteUseCase } from '../use-cases/delete-cliente.use-case';
import { GetClienteReservasUseCase } from '../use-cases/get-cliente-reservas.use-case';

const getClientesUseCase        = new GetClientesUseCase();
const getClienteByIdUseCase     = new GetClienteByIdUseCase();
const createClienteUseCase      = new CreateClienteUseCase();
const updateClienteUseCase      = new UpdateClienteUseCase();
const deleteClienteUseCase      = new DeleteClienteUseCase();
const getClienteReservasUseCase = new GetClienteReservasUseCase();

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateClienteInput:
 *       type: object
 *       description: Todos os campos são opcionais — envie apenas o que deseja atualizar
 *       properties:
 *         nome:
 *           type: string
 *           example: João Silva Atualizado
 *         email:
 *           type: string
 *           example: joao.novo@email.com
 *         cpf:
 *           type: string
 *           example: "12345678901"
 *         telefone:
 *           type: string
 *           example: "47999991111"
 *
 *     ClienteReserva:
 *       description: Shape retornado pelo GetClienteReservasUseCase
 *       type: object
 *       properties:
 *         reserva_id:
 *           type: integer
 *           example: 10
 *         status:
 *           type: string
 *           enum: [PENDENTE, CONFIRMADA, CANCELADA]
 *           example: CONFIRMADA
 *         filme:
 *           type: string
 *           example: Duna Parte 2
 *         data_hora:
 *           type: string
 *           format: date-time
 *           example: "2024-06-20T19:00:00.000Z"
 *         assentos:
 *           type: array
 *           items:
 *             type: string
 *           example: ["A1", "A2", "A3"]
 *         total_assentos:
 *           type: integer
 *           example: 3
 *         valor_total:
 *           type: number
 *           format: float
 *           example: 105.00
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Lista todos os clientes
 *     description: >
 *       Retorna a lista de clientes cadastrados. Suporta filtros opcionais por nome,
 *       email e CPF (busca parcial). Sem filtros, o resultado é servido via cache Redis
 *       com TTL de 2 minutos (Cache-Aside). Com qualquer filtro ativo, sempre consulta o banco.
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Filtro parcial por nome (case-insensitive)
 *         example: João
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtro parcial por email
 *         example: joao@
 *       - in: query
 *         name: cpf
 *         schema:
 *           type: string
 *         description: Filtro parcial por CPF
 *         example: "12345"
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const getClientes = async (req: Request, res: Response) => {
    try {
        const { nome, email, cpf } = req.query;
        const clientes = await getClientesUseCase.execute({
            nome: nome as string,
            email: email as string,
            cpf: cpf as string,
        });
        return res.json(clientes);
    } catch (error: any) {
        return res.status(500).json({ erro: error.message });
    }
};

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Busca um cliente por ID
 *     description: >
 *       Retorna os dados de um cliente específico. O resultado é servido via cache Redis
 *       com TTL de 1 hora (Cache-Aside). O cache é invalidado automaticamente em caso
 *       de atualização ou exclusão do cliente.
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
 *         example: 1
 *     responses:
 *       200:
 *         description: Dados do cliente retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Cliente nao encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const getClienteById = async (req: Request, res: Response) => {
    try {
        const cliente = await getClienteByIdUseCase.execute(Number(req.params.id));
        return res.json(cliente);
    } catch (error: any) {
        if (error.message === 'CLIENTE_NAO_ENCONTRADO')
            return res.status(404).json({ erro: 'Cliente nao encontrado' });
        return res.status(500).json({ erro: error.message });
    }
};

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Cria um novo cliente
 *     description: >
 *       Cadastra um novo cliente no sistema. Email e CPF devem ser únicos.
 *       Após a criação, o cache da listagem (clientes:all) é invalidado automaticamente.
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
 *             example:
 *               erro: Email ou CPF já cadastrado
 *       400:
 *         description: Dados inválidos na requisição
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
        if (error.code === 'P2002')
            return res.status(409).json({ erro: 'Email ou CPF já cadastrado' });
        return res.status(400).json({ erro: error.message });
    }
};

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Atualiza dados de um cliente
 *     description: >
 *       Atualiza parcialmente os dados de um cliente. Todos os campos são opcionais.
 *       Após a atualização, o cache individual (cliente:{id}) e o cache da listagem
 *       (clientes:all) são invalidados automaticamente.
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente a ser atualizado
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClienteInput'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Cliente nao encontrado
 *       409:
 *         description: Email ou CPF já em uso por outro cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Email ou CPF já cadastrado
 *       400:
 *         description: Dados inválidos na requisição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const putCliente = async (req: Request, res: Response) => {
    try {
        const cliente = await updateClienteUseCase.execute(Number(req.params.id), req.body);
        return res.json(cliente);
    } catch (error: any) {
        if (error.code === 'P2002')
            return res.status(409).json({ erro: 'Email ou CPF já cadastrado' });
        if (error.code === 'P2025' || error.message === 'CLIENTE_NAO_ENCONTRADO')
            return res.status(404).json({ erro: 'Cliente nao encontrado' });
        return res.status(400).json({ erro: error.message });
    }
};

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Remove um cliente
 *     description: >
 *       Remove permanentemente um cliente do sistema. A operação verifica a existência
 *       do cliente antes de prosseguir. Após a exclusão, o cache individual (cliente:{id})
 *       e o cache da listagem (clientes:all) são invalidados automaticamente.
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente a ser removido
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente removido
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Cliente nao encontrado
 *       400:
 *         description: Erro ao remover cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const deleteCliente = async (req: Request, res: Response) => {
    try {
        await deleteClienteUseCase.execute(Number(req.params.id));
        return res.json({ message: 'Cliente removido' });
    } catch (error: any) {
        if (error.message === 'CLIENTE_NAO_ENCONTRADO')
            return res.status(404).json({ erro: 'Cliente nao encontrado' });
        return res.status(400).json({ erro: error.message });
    }
};

/**
 * @swagger
 * /clientes/{id}/reservas:
 *   get:
 *     summary: Lista o histórico de reservas de um cliente
 *     description: >
 *       Retorna todas as reservas associadas ao cliente, ordenadas da mais recente
 *       para a mais antiga. A existência do cliente é validada via cache antes de
 *       consultar as reservas no banco.
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
 *         example: 1
 *     responses:
 *       200:
 *         description: Histórico de reservas retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClienteReserva'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 *             example:
 *               erro: Cliente nao encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
export const getReservasByCliente = async (req: Request, res: Response) => {
    try {
        // Valida existência do cliente aproveitando o cache do GetClienteByIdUseCase
        await getClienteByIdUseCase.execute(Number(req.params.id));

        const reservas = await getClienteReservasUseCase.execute(Number(req.params.id));

        const formatted = reservas.map((r: any) => ({
            reserva_id: r.id,
            status: r.status,
            filme: r.sessao.filme.titulo,
            data_hora: r.sessao.dataHora,
            assentos: r.assentos.map((ra: any) => `${ra.assento.fileira}${ra.assento.numero}`),
            total_assentos: r.totalAssentos,
            valor_total: Number(r.valorTotal),
        }));

        return res.json(formatted);
    } catch (error: any) {
        if (error.message === 'CLIENTE_NAO_ENCONTRADO')
            return res.status(404).json({ erro: 'Cliente nao encontrado' });
        return res.status(500).json({ erro: error.message });
    }
};