import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export class GetFilmesUseCase {
    async execute() {
        const cacheKey = 'filmes:all';

        //Tenta buscar no cache
        const cachedFilmes = await redis.get(cacheKey);
        if (cachedFilmes) {
            console.log('Cache hit: filmes');
            return JSON.parse(cachedFilmes);
        }

        //Se não tiver, busca no banco
        const filmes = await prisma.filme.findMany();

        //Salva no cache com expiração  
        await redis.set(cacheKey, JSON.stringify(filmes), 'EX', 300); //5 minutos de cache
        
        console.log('Cache miss: buscando no banco');
        return filmes;
    }
}