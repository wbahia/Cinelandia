import { prisma } from '../lib/prisma';

export interface CreateClienteInput {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
}

export class CreateClienteUseCase {
    async execute(data: CreateClienteInput) {
        return await prisma.cliente.create({
            data
        });
    }
}