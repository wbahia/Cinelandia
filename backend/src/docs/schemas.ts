/**
 * @swagger
 * components:
 *   schemas:
 *
 *     # ─── ENTIDADES BASE ────────────────────────────────────────────────────────
 *
 *     Cliente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           example: joao@email.com
 *         cpf:
 *           type: string
 *           example: "12345678901"
 *         telefone:
 *           type: string
 *           example: "47999999999"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     Filme:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         titulo:
 *           type: string
 *           example: Duna Parte 2
 *         sinopse:
 *           type: string
 *           example: A continuação da saga de Paul Atreides em Arrakis.
 *         duracaoMin:
 *           type: integer
 *           example: 166
 *         genero:
 *           type: string
 *           example: Ficção Científica
 *         classificacao:
 *           type: string
 *           example: "14"
 *         posterUrl:
 *           type: string
 *           example: https://example.com/poster.jpg
 *
 *     Assento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 42
 *         idSala:
 *           type: integer
 *           example: 3
 *         fileira:
 *           type: string
 *           example: B
 *         numero:
 *           type: integer
 *           example: 5
 *         tipo:
 *           type: string
 *           enum: [NORMAL, VIP, PCD]
 *           example: VIP
 *         label:
 *           type: string
 *           description: Identificador legível no formato FileiraNúmero
 *           example: B5
 *
 *     Sessao:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         idSala:
 *           type: integer
 *           example: 3
 *         idFilme:
 *           type: integer
 *           example: 1
 *         dataHora:
 *           type: string
 *           format: date-time
 *           example: "2024-06-20T19:00:00.000Z"
 *         valorUnitario:
 *           type: number
 *           format: float
 *           example: 32.50
 *         idioma:
 *           type: string
 *           enum: [DUB, LEG, NAC]
 *           example: DUB
 *
 *     Reserva:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 100
 *         idCliente:
 *           type: integer
 *           example: 1
 *         idSessao:
 *           type: integer
 *           example: 10
 *         status:
 *           type: string
 *           enum: [PENDENTE, CONFIRMADA, CANCELADA]
 *           example: CONFIRMADA
 *         totalAssentos:
 *           type: integer
 *           example: 2
 *         valorTotal:
 *           type: number
 *           format: float
 *           example: 65.00
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-20T18:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-20T18:00:00.000Z"
 *
 *     # ─── RESPONSES CUSTOMIZADOS (shape real dos use cases) ───────────────────
 *
 *     SessaoListItem:
 *       description: Shape retornado pelo GetSessoesUseCase
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         filme:
 *           type: string
 *           example: Duna Parte 2
 *         sala:
 *           type: string
 *           example: Sala 3 - IMAX
 *         data_hora:
 *           type: string
 *           format: date-time
 *           example: "2024-06-20T19:00:00.000Z"
 *         valor_unitario:
 *           type: number
 *           format: float
 *           example: 32.50
 *
 *     SessaoAssentos:
 *       description: Shape retornado pelo GetSessaoAssentosUseCase
 *       type: object
 *       properties:
 *         sessao_id:
 *           type: integer
 *           example: 10
 *         valor_unitario:
 *           type: number
 *           format: float
 *           example: 32.50
 *         assentos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AssentoDisponivel'
 *
 *     AssentoDisponivel:
 *       description: Assento com status de disponibilidade para uma sessão
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 42
 *         fileira:
 *           type: string
 *           example: B
 *         numero:
 *           type: integer
 *           example: 5
 *         tipo:
 *           type: string
 *           enum: [NORMAL, VIP, PCD]
 *           example: VIP
 *         label:
 *           type: string
 *           example: B5
 *         disponivel:
 *           type: boolean
 *           example: true
 *
 *     # ─── INPUTS ────────────────────────────────────────────────────────────────
 *
 *     CreateClienteInput:
 *       type: object
 *       required: [nome, email, cpf, telefone]
 *       properties:
 *         nome:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           example: joao@email.com
 *         cpf:
 *           type: string
 *           example: "12345678901"
 *         telefone:
 *           type: string
 *           example: "47999999999"
 *
 *     CreateReservaInput:
 *       type: object
 *       required: [clienteId, sessaoId, assentosIds]
 *       properties:
 *         clienteId:
 *           type: integer
 *           example: 1
 *         sessaoId:
 *           type: integer
 *           example: 10
 *         assentosIds:
 *           type: array
 *           items:
 *             type: integer
 *           example: [42, 43]
 *
 *     # ─── ERRORS ────────────────────────────────────────────────────────────────
 *
 *     ErroMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "ASSENTO_OCUPADO: O assento B5 já está sendo reservado por outra pessoa."
 *
 *     ErroGenerico:
 *       type: object
 *       properties:
 *         erro:
 *           type: string
 *           example: Erro interno do servidor
 */