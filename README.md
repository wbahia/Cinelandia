# 🎬 Cinelandia — Sistema de Reserva de Cinema

POC de sistema de reserva de assentos em tempo real para cinemas, desenvolvido com Node.js, React e WebSocket.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Alpine-DC382D?style=flat-square&logo=redis&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC2927?style=flat-square&logo=microsoftsqlserver&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## Funcionalidades

- **Mapa de assentos interativo** com tipos Normal, VIP e PCD
- **Atualização em tempo real** via Socket.IO — assentos reservados por outro cliente piscam e são desbloqueados automaticamente na tela
- **Proteção contra double-booking** com locks no Redis (TTL 60s) + transação Prisma com double-check no banco
- **Cache aside com Redis** nas listagens de clientes, filmes e sessões
- **Wizard de reserva em 5 etapas** — Cliente → Filme → Sessão → Assentos → Confirmação
- **CRUD completo de clientes** com filtros por nome, email e CPF e highlight dos resultados
- **Documentação Swagger** em `/api-docs`

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│          React 18 + TypeScript + Vite (porta 5173)          │
│   Socket.IO Client → atualização ao vivo do mapa de assentos│
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP + WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                        Backend                               │
│        Node.js + Express + Socket.IO (porta 3000)           │
│              Clean Architecture — Use Cases                  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
   ┌───────────▼──────────┐      ┌────────────▼──────────────┐
   │   MS SQL Server 2022 │      │       Redis Alpine         │
   │   Prisma ORM         │      │  • Cache aside (listas)    │
   │   Porta 1433         │      │  • Locks de assento (60s)  │
   └──────────────────────┘      └───────────────────────────┘
```

### Estratégia de concorrência

Quando dois clientes tentam reservar o mesmo assento simultaneamente:

1. **Redis lock** — adquirido por assento antes de qualquer operação no banco (TTL 60s)
2. **Transação Prisma** — double-check de disponibilidade dentro da transação
3. **WebSocket broadcast** — todos os clientes na sala recebem `assentos:update` imediatamente após reserva ou cancelamento

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, TypeScript, Vite, Socket.IO Client |
| Backend | Node.js 20, Express, Socket.IO |
| ORM | Prisma 5 |
| Banco de dados | Microsoft SQL Server 2022 |
| Cache / Locks | Redis Alpine |
| Infraestrutura | Docker Compose |
| Documentação | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- Node.js 20+ (apenas para desenvolvimento local)

---

## Subindo com Docker

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/cinelandia.git
cd cinelandia

# Suba todos os serviços
docker compose up -d

# Aguarde o SQL Server inicializar (~20s) e rode as migrations + seed
docker compose exec backend npm run db:migrate
docker compose exec backend npm run seed
```

Serviços disponíveis após subir:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API REST | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/api-docs |
| SQL Server | localhost:1433 |
| Redis | localhost:6379 |

---

## Desenvolvimento local

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:generate    # gera o Prisma Client
npm run db:migrate     # aplica as migrations
npm run seed           # popula dados de exemplo
npm run dev            # ts-node-dev com hot reload
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## Variáveis de ambiente

### Backend (`backend/.env`)

```env
DATABASE_URL="sqlserver://localhost:1433;database=cinelandia;user=sa;password=Admin@123;trustServerCertificate=true"
REDIS_URL="redis://localhost:6379"
FRONTEND_URL="http://localhost:5173"
PORT=3000
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000
```

---

## Endpoints da API

### Clientes
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/clientes` | Lista clientes — filtros: `?nome=&email=&cpf=` |
| `GET` | `/api/v1/clientes/:id` | Busca cliente por ID |
| `POST` | `/api/v1/clientes` | Cria cliente |
| `PUT` | `/api/v1/clientes/:id` | Atualiza cliente |
| `DELETE` | `/api/v1/clientes/:id` | Remove cliente |
| `GET` | `/api/v1/clientes/:id/reservas` | Histórico de reservas do cliente |

### Filmes e Sessões
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/filmes` | Lista filmes |
| `GET` | `/api/v1/filmes/:id` | Detalhes do filme |
| `GET` | `/api/v1/sessoes` | Lista sessões — filtros: `?filme_id=&data=` |
| `GET` | `/api/v1/sessoes/:id/assentos` | Mapa de assentos com disponibilidade |

### Reservas
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/reservas` | Cria reserva |
| `GET` | `/api/v1/reservas/:id` | Detalhes da reserva |
| `DELETE` | `/api/v1/reservas/:id` | Cancela reserva e libera assentos |

---

## WebSocket

O cliente conecta em `ws://localhost:3000` e usa os seguintes eventos:

```js
// Entrar na sala de uma sessão para receber atualizações ao vivo
socket.emit('watch:sessao', sessaoId)

// Sair da sala
socket.emit('unwatch:sessao', sessaoId)

// Receber atualizações de assentos em tempo real
socket.on('assentos:update', ({ sessaoId, reservados, liberados }) => {
  // reservados: number[] — IDs dos assentos recém-reservados
  // liberados:  number[] — IDs dos assentos recém-liberados
})
```

---

## Estrutura do projeto

```
cinelandia/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Handlers HTTP + anotações Swagger
│   │   ├── use-cases/       # Lógica de negócio (Clean Architecture)
│   │   ├── routes/          # Definição das rotas Express
│   │   ├── websocket/       # Inicialização e broadcast Socket.IO
│   │   ├── docs/            # schemas.ts com componentes Swagger
│   │   └── lib/             # Prisma client, Redis client
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # ClientesPage, FilmesPage, SessoesPage, NovaReservaPage
│   │   ├── components/      # SeatMap, Sidebar, UI primitives, ToastContainer
│   │   ├── hooks/           # useSessaoSocket, useToast
│   │   └── services/        # api.ts — todas as chamadas HTTP tipadas
│   └── Dockerfile
└── docker-compose.yml
```

---

## Licença

MIT
