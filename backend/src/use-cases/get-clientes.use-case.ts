import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export interface GetClientesFilters {
    nome?: string;
    email?: string;
    cpf?: string;
}

export class GetClientesUseCase {
    private static CACHE_KEY = 'clientes:all';
    private static CACHE_TTL = 60; // 1 minutos — lista muda com frequência

    async execute(filters: GetClientesFilters = {}) {
        const hasFilters = Object.values(filters).some(v => v && v.trim() !== '');

        // Cache aside só sem filtros (lista completa)
        if (!hasFilters) {
            const cached = await redis.get(GetClientesUseCase.CACHE_KEY);
            if (cached) {
                console.log('Cache hit: clientes:all');
                return JSON.parse(cached);
            }
            console.log('Cache miss: buscando clientes no banco');
        }

        const where: any = {};

        if (filters.nome?.trim()) {
            where.nome = { contains: filters.nome.trim() };
        }

        if (filters.email?.trim()) {
            where.email = { contains: filters.email.trim() };
        }

        if (filters.cpf?.trim()) {
            where.cpf = { contains: filters.cpf.trim() };
        }

        const clientes = await prisma.cliente.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                telefone: true,
                createdAt: true,
            }
        });

        // Popula cache apenas quando sem filtros
        if (!hasFilters) {
            await redis.set(
                GetClientesUseCase.CACHE_KEY,
                JSON.stringify(clientes),
                'EX',
                GetClientesUseCase.CACHE_TTL
            );
        }

        return clientes;
    }

    // Invalida o cache após mutações (create, update, delete)
    static async invalidate() {
        await redis.del(GetClientesUseCase.CACHE_KEY);
        console.log('Cache invalidado: clientes:all');
    }
}