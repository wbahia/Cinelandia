import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export interface AssentoInfo {
    id: number;
    fileira: string;
    numero: number;
    label: string; 
}

export class GetAssentosByIdsUseCase {
  async execute(ids: number[]): Promise<Map<number, AssentoInfo>> {
    const result = new Map<number, AssentoInfo>();
    const missingIds: number[] = [];

    // Tenta buscar cada assento no cache
    for (const id of ids) {
        const cacheKey = `assento:${id}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
          console.log(`Cache hit: assento:${id}`);
          result.set(id, JSON.parse(cached));
        } else {
          missingIds.push(id);
        }
    }

    //Busca no banco apenas os que não estavam no cache (cache miss)
    if (missingIds.length > 0) {
        console.log(`Cache miss: buscando assentos [${missingIds.join(', ')}] no banco`);

        const assentos = await prisma.assento.findMany({
          where: { id: { in: missingIds } },
          select: { id: true, fileira: true, numero: true }
        });

        //Popula o cache e o resultado com os dados do banco
        for (const assento of assentos) {
          const assentoInfo: AssentoInfo = {
            ...assento,
            label: `${assento.fileira}${assento.numero}`
          };

          await redis.set(`assento:${assento.id}`, JSON.stringify(assentoInfo), 'EX', 86400); // 24h de cache
          result.set(assento.id, assentoInfo);
        }
    }

    return result;
  }
}