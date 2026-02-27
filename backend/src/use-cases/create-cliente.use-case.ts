import { prisma } from '../lib/prisma';
import { GetClientesUseCase } from './get-clientes.use-case';

export interface CreateClienteInput {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
}

export class CreateClienteUseCase {
    async execute(data: CreateClienteInput) {
        const cliente = await prisma.cliente.create({ data });

        // Invalida o cache da lista após criação
        await GetClientesUseCase.invalidate();

        return cliente;
    }
}