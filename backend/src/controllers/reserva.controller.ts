import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export const createReserva = async (req: Request, res: Response) => {
  const { cliente_id, sessao_id, assentos_ids } = req.body;

  // Tipagem explícita para evitar erros de tipo no Redis
  const lockKeys: string[] = assentos_ids.map((id: number) => `lock:sessao:${sessao_id}:assento:${id}`);
  
  try {
    for (const key of lockKeys) {
      const acquired = await redis.set(key, "locked", "EX", 10, "NX");
      if (!acquired) {
        return res.status(409).json({ 
          erro: "Um ou mais assentos estão sendo processados ou já foram reservados.",
          assentos_indisponiveis: [key.split(':').pop()] 
        });
      }
    }

    const novaReserva = await prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: sessao_id },
        include: { sala: true, filme: true }
      });

      if (!sessao) throw new Error("SESSAO_NOT_FOUND");

      const ocupados = await tx.reservaAssento.findMany({
        where: {
          idSessao: sessao_id,
          idAssento: { in: assentos_ids }
        }
      });

      if (ocupados.length > 0) {
        const idsOcupados = ocupados.map((o: any) => o.idAssento); // Tipado como any ou o tipo do Prisma
        throw { type: "CONCURRENCY_ERROR", ids: idsOcupados };
      }

      const totalAssentos = assentos_ids.length;
      const valorTotal = Number(sessao.valorUnitario) * totalAssentos;

      return await tx.reserva.create({
        data: {
          idCliente: cliente_id,
          idSessao: sessao_id,
          status: 'CONFIRMADA',
          totalAssentos,
          valorTotal,
          assentos: {
            create: assentos_ids.map((id: number) => ({
              idAssento: id,
              idSessao: sessao_id
            }))
          }
        },
        include: {
          assentos: { include: { assento: true } },
          sessao: { include: { filme: true, sala: true } }
        }
      });
    });

    return res.status(201).json(novaReserva);

  } catch (error: any) {
    if (error.type === "CONCURRENCY_ERROR") {
      return res.status(409).json({ erro: "Assentos já reservados", assentos_indisponiveis: error.ids });
    }
    return res.status(500).json({ erro: "Erro interno" });
  } finally {
    await Promise.all(lockKeys.map((key: string) => redis.del(key)));
  }
};