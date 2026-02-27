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
            reserva_id:     reserva.id,
            status:         reserva.status,
            cliente:        { id: reserva.cliente.id, nome: reserva.cliente.nome },
            sessao: {
                filme:    reserva.sessao.filme.titulo,
                data_hora: reserva.sessao.dataHora,
                sala:     `Sala ${reserva.sessao.sala.numero} - ${reserva.sessao.sala.tipo}`,
            },
            assentos:       reserva.assentos.map(ra => ({
                fileira: ra.assento.fileira,
                numero:  ra.assento.numero,
            })),
            total_assentos: reserva.totalAssentos,
            valor_unitario: Number(reserva.sessao.valorUnitario),
            valor_total:    Number(reserva.valorTotal),
        };
    }
}