import { Router } from 'express';
import { getFilmes } from '../controllers/filme.controller';
import { postReserva } from '../controllers/reserva.controller';
import { getSessoes, getAssentosBySessao } from '../controllers/sessao.controller';
import { postCliente } from '../controllers/cliente.controller';

const router = Router();

// Rotas da API

//Filmes
router.get('/filmes', getFilmes);

//Clientes
router.post('/clientes', postCliente);

//Reservas
router.post('/reservas', postReserva);

//Sessões e assentos
router.get('/sessoes', getSessoes);
router.get('/sessoes/:id/assentos', getAssentosBySessao);

export default router;