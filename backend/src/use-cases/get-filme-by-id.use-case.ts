import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export class GetFilmeByIdUseCase {
    async execute(id: number) {
        const cacheKey = `filme:${id}`;
        const cached = await redis.get(cacheKey);
        
        if (cached) return JSON.parse(cached);

        const filme = await prisma.filme.findUnique({ where: { id } });
        if (!filme) throw new Error('FILME_NAO_ENCONTRADO');

        await redis.set(cacheKey, JSON.stringify(filme), 'EX', 86400);
        return filme;
    }
}