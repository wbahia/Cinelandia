import { Router } from 'express';
import { getFilmeById, getFilmes } from '../controllers/filme.controller';
import { deleteReserva, getReserva, postReserva } from '../controllers/reserva.controller';
import { getSessoes, getAssentosBySessao } from '../controllers/sessao.controller';
import {
    getClientes,
    getClienteById,
    postCliente,
    putCliente,
    deleteCliente,
    getReservasByCliente
} from '../controllers/cliente.controller';

const router = Router();

// Rotas da API

//Filmes
router.get('/filmes', getFilmes);
router.get('/filmes/:id', getFilmeById);

//Clientes
router.get('/clientes', getClientes);
router.get('/clientes/:id', getClienteById);
router.post('/clientes', postCliente);
router.put('/clientes/:id', putCliente);
router.delete('/clientes/:id', deleteCliente);
router.get('/clientes/:id/reservas', getReservasByCliente);

//Reservas
router.post('/reservas', postReserva);
router.get('/reservas/:id', getReserva);
router.delete('/reservas/:id', deleteReserva);

//Sessões e assentos
router.get('/sessoes', getSessoes);
router.get('/sessoes/:id/assentos', getAssentosBySessao);

export default router;