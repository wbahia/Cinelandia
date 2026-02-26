import { Sessao } from '@prisma/client';

export interface SessaoResolver {
    execute(id: number): Promise<Sessao>;
}