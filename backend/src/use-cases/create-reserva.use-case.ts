import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AssentoResolver } from '../domain/interfaces/assento-resolver.interface';
import { SessaoResolver } from '../domain/interfaces/sessao-resolver.interface';

export interface CreateReservaInput {
    clienteId: number;
    sessaoId: number;
    assentosIds: number[];
}

export class CreateReservaUseCase {

    constructor(
        private readonly getAssentosByIds: AssentoResolver,
        private readonly getSessaoById: SessaoResolver
    ) {}

    async execute(input: CreateReservaInput) {
        const { clienteId, sessaoId, assentosIds } = input;

        // Resolve labels e sessão em paralelo via cache aside
        const [assentoMap, sessao] = await Promise.all([
            this.getAssentosByIds.execute(assentosIds),
            this.getSessaoById.execute(sessaoId)
        ]);

        // Tenta lockar no redis para cada assento/sessao
        for (const assentoId of assentosIds) {
            const lockKey = `lock:sessao:${sessaoId}:assento:${assentoId}`;
            const acquired = await redis.set(lockKey, "locked", "EX", 60, "NX"); //lock temporario de 60 segundos
            
            if (!acquired) {
                const label = assentoMap.get(assentoId)?.label ?? String(assentoId);
                throw new Error(`ASSENTO_OCUPADO: O assento ${label} já está sendo reservado por outra pessoa.`);
            }
        }

        try {
            // Transação no prisma (consistência no banco)
            return await prisma.$transaction(async (tx) => {
                
                // double check no banco para garantir que os assentos ainda estão disponíveis (concorrência)
                const ocupados = await tx.reservaAssento.findMany({
                    where: {
                        idSessao: sessaoId,
                        idAssento: { in: assentosIds }
                    }
                });

                if (ocupados.length > 0) {
                    const labels = ocupados
                        .map(({ idAssento }) => assentoMap.get(idAssento)?.label ?? String(idAssento))
                        .join(", ");
                    throw new Error(`ASSENTOS_INDISPONIVEIS: Os seguintes assentos já foram vendidos: ${labels}`);
                }

                const reserva = await tx.reserva.create({
                    data: {
                        idCliente: clienteId,
                        idSessao: sessaoId,
                        status: 'CONFIRMADA',
                        totalAssentos: assentosIds.length,
                        valorTotal: Number(sessao.valorUnitario) * assentosIds.length
                    }
                });

                // Vincula os Assentos a Reserva
                const assentosData = assentosIds.map(id => ({
                    idReserva: reserva.id,
                    idAssento: id,
                    idSessao: sessaoId
                }));

                    await tx.reservaAssento.createMany({
                    data: assentosData
                });

                return reserva;
            });

        } catch (error) {
            throw error;
        } finally {
            // Libera os locks no Redis
            for (const assentoId of assentosIds) {
                const lockKey = `lock:sessao:${sessaoId}:assento:${assentoId}`;
                await redis.del(lockKey);
            }
        }
    }
}