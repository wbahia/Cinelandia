import { prisma } from '../lib/prisma';
import { GetClienteByIdUseCase } from './get-cliente-by-id.use-case';
import { GetClientesUseCase } from './get-clientes.use-case';

export interface UpdateClienteInput {
    nome?: string;
    email?: string;
    cpf?: string;
    telefone?: string;
}

export class UpdateClienteUseCase {
    async execute(id: number, data: UpdateClienteInput) {
        const cliente = await prisma.cliente.update({
            where: { id },
            data,
        });

        // Invalida o cache individual e o cache da lista
        await Promise.all([
            GetClienteByIdUseCase.invalidate(id),
            GetClientesUseCase.invalidate(),
        ]);

        return cliente;
    }
}