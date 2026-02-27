import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export class GetClienteByIdUseCase {
    private static cacheKey(id: number) {
        return `cliente:${id}`;
    }

    static async invalidate(id: number) {
        await redis.del(GetClienteByIdUseCase.cacheKey(id));
        console.log(`Cache invalidado: cliente:${id}`);
    }

    async execute(id: number) {
        const cacheKey = GetClienteByIdUseCase.cacheKey(id);

        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log(`Cache hit: cliente:${id}`);
            return JSON.parse(cached);
        }

        console.log(`Cache miss: buscando cliente:${id} no banco`);
        const cliente = await prisma.cliente.findUnique({ where: { id } });

        if (!cliente) throw new Error('CLIENTE_NAO_ENCONTRADO');

        await redis.set(cacheKey, JSON.stringify(cliente), 'EX', 3600); // 1h
        return cliente;
    }
}