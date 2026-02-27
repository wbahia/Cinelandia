import { prisma } from '../lib/prisma';

export class CancelReservaUseCase {
    async execute(reservaId: number) {
        return await prisma.$transaction(async (tx) => {
            //Check se reserva existe
            const reserva = await tx.reserva.findUnique({
                where: { id: reservaId }
            });

            if (!reserva) throw new Error('RESERVA_NAO_ENCONTRADA');
            if (reserva.status === 'CANCELADA') throw new Error('RESERVA_JA_CANCELADA');

            // Remove os assentos 
            await tx.reservaAssento.deleteMany({
                where: { idReserva: reservaId }
            });

            // Atualiza o status
            return await tx.reserva.update({
                where: { id: reservaId },
                data: { status: 'CANCELADA' }
            });
        });
    }
}