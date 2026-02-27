import { prisma } from '../lib/prisma';

export class GetReservaByIdUseCase {
    async execute(id: number) {
        const reserva = await prisma.reserva.findUnique({
            where: { id },
            include: {
                cliente: true,
                sessao: {
                    include: { filme: true, sala: true }
                },
                assentos: {
                    include: { assento: true }
                }
            }
        });

        if (!reserva) throw new Error('RESERVA_NAO_ENCONTRADA');

        return {
            id: reserva.id,
            status: reserva.status,
            valor_total: Number(reserva.valorTotal),
            cliente: reserva.cliente.nome,
            filme: reserva.sessao.filme.titulo,
            sala: reserva.sessao.sala.numero,
            data_hora: reserva.sessao.dataHora,
            assentos: reserva.assentos.map(ra => `${ra.assento.fileira}${ra.assento.numero}`)
        };
    }
}