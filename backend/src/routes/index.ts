import { Router } from 'express';
import { getFilmeById, getFilmes } from '../controllers/filme.controller';
import { deleteReserva, getReserva, postReserva } from '../controllers/reserva.controller';
import { getSessoes, getAssentosBySessao } from '../controllers/sessao.controller';
import { getReservasByCliente, postCliente } from '../controllers/cliente.controller';

const router = Router();

// Rotas da API

//Filmes
router.get('/filmes', getFilmes);
router.get('/filmes/:id', getFilmeById);

//Clientes
router.post('/clientes', postCliente);
router.get('/clientes/:id/reservas', getReservasByCliente);

//Reservas
router.post('/reservas', postReserva);
router.get('/reservas/:id', getReserva);
router.delete('/reservas/:id', deleteReserva);

//Sessões e assentos
router.get('/sessoes', getSessoes);
router.get('/sessoes/:id/assentos', getAssentosBySessao);

export default router;