import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export class GetSalaAssentosUseCase {
    private static cacheKey(salaId: number) {
        return `sala:${salaId}:assentos`;
    }

    async execute(salaId: number) {
        const cacheKey = GetSalaAssentosUseCase.cacheKey(salaId);

        // Tenta buscar o layout da sala no cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log(`Cache hit: layout da sala:${salaId}`);
            return JSON.parse(cached);
        }

        // Cache miss: Busca no banco
        console.log(`Cache miss: buscando layout da sala:${salaId} no banco`);
        const assentos = await prisma.assento.findMany({
            where: { idSala: salaId },
            select: {
                id: true,
                fileira: true,
                numero: true,
                tipo: true
            },
            orderBy: [{ fileira: 'asc' }, { numero: 'asc' }]
        });

        const assentosComLabel = assentos.map(a => ({
            ...a,
            label: `${a.fileira}${a.numero}`
        }));

        // Armazena o resultado no cache 
        await redis.set(cacheKey, JSON.stringify(assentosComLabel), 'EX', 86400); //24h

        return assentosComLabel;
    }
}