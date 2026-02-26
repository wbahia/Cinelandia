import { prisma } from '../lib/prisma';
import { GetSessaoByIdUseCase } from './get-sessao-by-id.use-case';
import { GetSalaAssentosUseCase } from './get-sala-assentos.use-case';

export class GetSessaoAssentosUseCase {
    constructor(
        private readonly getSessaoById: GetSessaoByIdUseCase,
        private readonly getSalaAssentos: GetSalaAssentosUseCase
    ) {}

    async execute(sessaoId: number) {
        // Busca dados da sessão (Cache-Aside 24h)
        const sessao = await this.getSessaoById.execute(sessaoId);

        // Busca layout de assentos da sala (Cache-Aside 24h)
        const layoutAssentos = await this.getSalaAssentos.execute(sessao.idSala);

        // Busca ocupação atual (Sempre banco para evitar overbooking)
        const ocupados = await prisma.reservaAssento.findMany({
            where: { idSessao: sessaoId },
            select: { idAssento: true }
        });

        const ocupadosIds = new Set(ocupados.map(o => o.idAssento));

        // Une TUDO 
        return {
            sessao_id: sessao.id,
            valor_unitario: Number(sessao.valorUnitario),
            assentos: layoutAssentos.map((a: any) => ({
                ...a,
                disponivel: !ocupadosIds.has(a.id)
            }))
        };
    }
}