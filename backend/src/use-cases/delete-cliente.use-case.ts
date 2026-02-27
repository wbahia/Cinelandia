import { prisma } from '../lib/prisma';
import { GetClienteByIdUseCase } from './get-cliente-by-id.use-case';
import { GetClientesUseCase } from './get-clientes.use-case';

export class DeleteClienteUseCase {
    async execute(id: number) {
        // Verifica se existe antes de tentar deletar
        const exists = await prisma.cliente.findUnique({ where: { id }, select: { id: true } });
        if (!exists) throw new Error('CLIENTE_NAO_ENCONTRADO');

        await prisma.cliente.delete({ where: { id } });

        // Invalida o cache individual e o cache da lista
        await Promise.all([
            GetClienteByIdUseCase.invalidate(id),
            GetClientesUseCase.invalidate(),
        ]);
    }
}