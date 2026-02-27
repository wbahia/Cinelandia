import { prisma } from '../lib/prisma';

export class GetClienteReservasUseCase {
    async execute(clienteId: number) {
        return await prisma.reserva.findMany({
            where: { idCliente: clienteId },
            include: {
                sessao: {
                    include: { filme: { select: { titulo: true } } }
                },
                assentos: {
                    include: { assento: { select: { fileira: true, numero: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}