# AgendaFácil

Plataforma web de agendamento de serviços — salões, pet shops, clínicas e muito mais.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui + React Router 6
- **Backend:** Node.js + Express + Prisma ORM
- **Banco de dados:** PostgreSQL
- **Autenticação:** [Better Auth](https://better-auth.com) (e-mail/senha + Google OAuth)
- **E-mail transacional:** Resend
- **Upload de imagens:** Cloudinary

## Deploy

| Camada | Plataforma |
|---|---|
| Backend + PostgreSQL | [Render](https://render.com) |
| Frontend | [Vercel](https://vercel.com) |

> O projeto começou previsto para o Railway, mas foi migrado para o Render (backend + banco) no free tier.

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm 9+
- Uma instância PostgreSQL (local ou em nuvem)

### 1. Clone o repositório

```bash
git clone https://github.com/hoad3r/agendafacil.git
cd agendafacil
```

### 2. Instalar dependências

```bash
npm install          # instala concurrently na raiz
npm run install:all  # instala dependências do backend e frontend
```

### 3. Backend

```bash
cd backend

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e preencha DATABASE_URL (PostgreSQL) e BETTER_AUTH_SECRET no mínimo

# Aplicar migrations e popular o banco
npx prisma migrate dev
node prisma/seed.js

# Iniciar servidor (porta 3001)
npm run dev
```

### 4. Frontend

```bash
# Em outro terminal
cd frontend
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev            # dev server na porta 5173
```

Ou suba os dois de uma vez a partir da raiz:

```bash
npm run dev            # backend (3001) + frontend (5173) simultaneamente
```

Acesse: **http://localhost:5173**

---

## Contas de Demonstração

Criadas pelo `prisma/seed.js`:

| Papel | E-mail | Senha |
|---|---|---|
| Admin | admin@agendafacil.com | admin123 |
| Prestador (Salão) | joao@salao.com | provider123 |
| Prestador (Pet Shop) | maria@petshop.com | provider123 |
| Cliente | carlos@email.com | client123 |
| Cliente | beatriz@email.com | client123 |

---

## Estrutura do Projeto

```
agendafacil/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos do banco (PostgreSQL)
│   │   └── seed.js             # Dados de demonstração
│   ├── src/
│   │   ├── lib/                # auth.js (Better Auth), email.js, cloudinary
│   │   ├── controllers/        # Handlers HTTP
│   │   ├── middlewares/        # Autenticação + roles
│   │   ├── routes/             # Definição de rotas
│   │   ├── jobs/               # Job de lembretes
│   │   └── server.js           # Entrada da aplicação
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # UI (shadcn/ui) + Layout
│   │   ├── contexts/           # Auth + Toast
│   │   ├── lib/                # auth-client.js
│   │   ├── pages/              # Todas as telas
│   │   └── services/api.js     # Axios configurado
│   ├── vercel.json
│   └── vite.config.js
└── docs/                       # Documentação técnica e relatórios
```

## Scripts úteis

```bash
# Backend
npm run dev          # Nodemon
npm run db:migrate   # Aplicar migrations
npm run db:seed      # Popular banco
npm run db:studio    # Prisma Studio (GUI)
npm run db:reset     # Reset completo + seed

# Frontend
npm run dev          # Dev server
npm run build        # Build produção
npm run preview      # Preview do build
```

## Variáveis de Ambiente

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/agendafacil?sslmode=require"
BETTER_AUTH_SECRET="gere-com-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3001"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
RESEND_API_KEY=""
EMAIL_FROM="AgendaFácil <noreply@seudominio.com>"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api
VITE_CLOUDINARY_CLOUD_NAME=""
```

> Em produção, `VITE_API_URL` deve terminar em `/api` (ex.: `https://seu-backend.onrender.com/api`).

---

## Documentação

- [Documentação técnica](docs/documentacao-tecnica.md)
- [Relatório Sprint 2](docs/sprint2-relatorio.md)
- [Relatório Sprint 3](docs/sprint3-relatorio.md)
