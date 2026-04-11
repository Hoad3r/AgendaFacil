# AgendaFácil

Plataforma web de agendamento de serviços — salões, pet shops, clínicas e muito mais.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router 6
- **Backend:** Node.js + Express + Prisma ORM
- **Banco de dados:** SQLite (dev) / PostgreSQL (prod)
- **Autenticação:** JWT + bcrypt

## Como rodar

### Pré-requisitos

- Node.js 18+
- npm 9+

### 1. Clone o repositório

```bash
git clone <url-do-repo>
cd agendafacil
```

### 2. Backend

```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# O .env já está pronto para desenvolvimento com SQLite

# Criar banco e aplicar migrations
npx prisma migrate dev --name init

# Popular banco com dados de demonstração
node prisma/seed.js

# Iniciar servidor (porta 3001)
npm run dev
```

### 3. Frontend

```bash
# Em outro terminal
cd frontend
npm install

# Iniciar dev server (porta 5173)
npm run dev
```

Acesse: **http://localhost:5173**

---

## Contas de Demonstração

| Papel | E-mail | Senha |
|---|---|---|
| Admin | admin@agendafacil.com | admin123 |
| Prestador (Salão) | joao@salao.com | provider123 |
| Prestador (Pet Shop) | maria@petshop.com | provider123 |
| Cliente | carlos@email.com | client123 |
| Cliente | ana@email.com | client123 |

---

## Estrutura do Projeto

```
agendafacil/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos do banco
│   │   └── seed.js             # Dados iniciais
│   ├── src/
│   │   ├── controllers/        # Handlers HTTP
│   │   ├── middlewares/        # JWT + roles
│   │   ├── routes/             # Definição de rotas
│   │   ├── services/           # Lógica de negócio
│   │   ├── utils/              # availableSlots
│   │   └── server.js           # Entrada da aplicação
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # UI reutilizáveis + Layout
│   │   ├── contexts/           # Auth + Toast
│   │   ├── pages/              # Todas as telas
│   │   └── services/api.js     # Axios configurado
│   └── vite.config.js
└── docs/
    └── documentacao-tecnica.md
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

## Variáveis de Ambiente (backend/.env)

```env
DATABASE_URL="file:./dev.db"        # SQLite local
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

Para PostgreSQL em produção:
```env
DATABASE_URL="postgresql://user:password@host:5432/agendafacil"
```

---

## Documentação técnica completa

Ver [docs/documentacao-tecnica.md](docs/documentacao-tecnica.md)
