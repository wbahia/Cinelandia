import { prisma } from '../lib/prisma';
import { broadcastSessaoUpdate } from '../websocket/socket';

export class CancelReservaUseCase {
    async execute(reservaId: number) {
        return await prisma.$transaction(async (tx) => {
            const reserva = await tx.reserva.findUnique({
                where: { id: reservaId },
                include: { assentos: { select: { idAssento: true } } }
            });

            if (!reserva) throw new Error('RESERVA_NAO_ENCONTRADA');
            if (reserva.status === 'CANCELADA') throw new Error('RESERVA_JA_CANCELADA');

            const assentosLiberados = reserva.assentos.map(a => a.idAssento);
            const sessaoId = reserva.idSessao;

            await tx.reservaAssento.deleteMany({ where: { idReserva: reservaId } });

            const updated = await tx.reserva.update({
                where: { id: reservaId },
                data: { status: 'CANCELADA' }
            });

            // Broadcast liberação de assentos para os clientes que estão assistindo a sessão
            try {
                broadcastSessaoUpdate(sessaoId, [], assentosLiberados);
            } catch (_) {}

            return updated;
        });
    }
}