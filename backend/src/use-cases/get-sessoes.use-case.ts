import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export interface GetSessoesFilters {
    filmeId?: number;
    data?: string;
}

export class GetSessoesUseCase {
    async execute(filters: GetSessoesFilters) {
        const cacheKey = `sessoes:f:${filters.filmeId ?? 'all'}:d:${filters.data ?? 'any'}`;

        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const sessoes = await prisma.sessao.findMany({
            where: {
                idFilme: filters.filmeId,
                dataHora: filters.data ? {
                    gte: new Date(`${filters.data}T00:00:00Z`),
                    lte: new Date(`${filters.data}T23:59:59Z`),
                } : undefined
            },
            include: {
                filme: { select: { titulo: true } },
                sala: { select: { numero: true, tipo: true } }
            }
        });

        const result = sessoes.map(s => ({
            id: s.id,
            filme: s.filme.titulo,
            sala: `Sala ${s.sala.numero} - ${s.sala.tipo}`,
            data_hora: s.dataHora,
            valor_unitario: s.valorUnitario
        }));

        // Cache curto pois novas sessões podem ser criadas ou removidas
        await redis.set(cacheKey, JSON.stringify(result), 'EX', 300); // 5 min

        return result;
    }
}