import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { Sessao } from '@prisma/client';

export class GetSessaoByIdUseCase {

  private static cacheKey(id: number) {
        return `sessao:${id}`;
    }

  
  // static async invalidate(id: number) {
  //   await redis.del(GetSessaoByIdUseCase.cacheKey(id));
  //   console.log(`Cache invalidado: sessao:${id}`);
  // }

  async execute(id: number): Promise<Sessao> {
    const cacheKey = GetSessaoByIdUseCase.cacheKey(id);

    //Tenta buscar no cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: sessao:${id}`);
      return JSON.parse(cached);
    }

    //Cache miss — busca no banco
    console.log(`Cache miss: buscando sessao:${id} no banco`);
    const sessao = await prisma.sessao.findUnique({ where: { id } });
    if (!sessao) throw new Error('SESSAO_NAO_ENCONTRADA');

    //Popula o cache
    await redis.set(cacheKey, JSON.stringify(sessao), 'EX', 86400); // 24h

    return sessao;
  }
}