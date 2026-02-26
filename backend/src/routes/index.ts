import { Router } from 'express';
import { getFilmes } from '../controllers/filme.controller';
import { postReserva } from '../controllers/reserva.controller';

const router = Router();

// Rotas de Filmes
router.get('/filmes', getFilmes);

// Rotas de Reservas
router.post('/reservas', postReserva);

export default router;