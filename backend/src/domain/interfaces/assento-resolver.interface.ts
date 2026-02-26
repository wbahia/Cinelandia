import { AssentoInfo } from '../../use-cases/get-assentos-by-ids.use-case';

export interface AssentoResolver {
    execute(ids: number[]): Promise<Map<number, AssentoInfo>>;
}