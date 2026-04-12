# Relatório de Entregas — Sprint 2
**Projeto:** AgendaFácil  
**Data:** Abril de 2026  
**Repositório:** https://github.com/hoad3r/agendafacil  
**Branch:** `main`

---

## 1. Resumo Executivo

O AgendaFácil é uma plataforma web fullstack de agendamento de serviços (salões, pet shops, clínicas e outros). A Sprint 2 focou em duas frentes: **(1) implementação das funcionalidades principais** — CRUD completo das entidades, telas base com navegação e conexão com banco de dados — e **(2) redesign visual completo** — novo sistema de design com identidade visual consistente, componentes aprimorados e UX refinada em todas as 12 telas.

Ao final desta sprint, a aplicação possui **backend REST completo**, **frontend React com 12 telas redesenhadas** e **banco de dados relacional integrado via Prisma ORM**.

---

## 2. Funcionalidades Entregues

### 2.1 Conexão com Banco de Dados

- **ORM:** Prisma com suporte a SQLite (dev) e PostgreSQL (prod)
- **Migration** gerada e aplicada: `20260411192510_init`
- **Seed** com dados de demonstração (2 prestadores, 2 clientes, 2 estabelecimentos, serviços e agendamentos)
- **5 modelos** implementados: `User`, `Establishment`, `Service`, `WorkingHours`, `Appointment`

### 2.2 CRUD Implementado

| Entidade | Backend (API REST) | Frontend (Tela) |
|---|---|---|
| Usuário / Auth | ✅ POST /auth/register, POST /auth/login, GET /auth/me | ✅ Login + Cadastro |
| Estabelecimento | ✅ GET, POST, PUT, DELETE /establishments | ✅ Gerenciar Estabelecimento |
| Serviço | ✅ GET, POST, PUT, DELETE /services | ✅ Gerenciar Serviços |
| Horários | ✅ GET, POST (upsert), PUT /working-hours | ✅ Configurar Horários |
| Agendamento | ✅ GET, POST /appointments, PATCH status | ✅ Agendar + Meus Agendamentos |

### 2.3 Telas Base Implementadas (12 telas)

**Telas Públicas (sem login):**
- `/` — Home / Landing Page
- `/login` — Login
- `/register` — Cadastro
- `/establishments` — Lista de estabelecimentos com filtro por categoria e busca
- `/establishments/:id` — Detalhes do estabelecimento com serviços e horários

**Telas do Cliente (autenticado):**
- `/booking/:establishmentId/:serviceId` — Agendamento com seleção de data e horário
- `/my-appointments` — Meus agendamentos com abas Próximos e Histórico

**Telas do Prestador (autenticado):**
- `/provider/dashboard` — Dashboard com estatísticas e agendamentos do dia
- `/provider/establishment` — CRUD completo do estabelecimento *(entregue nesta sprint)*
- `/provider/services` — CRUD de serviços
- `/provider/schedule` — Configuração de horários de funcionamento
- `/provider/appointments` — Gestão de agendamentos com filtros e ações de status

### 2.4 Redesign Visual Completo (12 tarefas)

O redesign foi executado em 12 tarefas cobrindo toda a aplicação, com foco em identidade visual consistente, hierarquia tipográfica clara e componentes de alta qualidade.

**Fase 1 — Fundação (Tarefas 1-4):**
- Instalação do `lucide-react` e atualização dos componentes base (Button, Input, Card, Modal) com variantes, ícones e estados visuais melhorados
- Adição do `Sidebar` e `ProviderLayout` com navegação lateral para o painel do prestador
- Redesign da `Navbar` e `Footer` com gradientes, logo aprimorado e links responsivos
- Separação e organização do roteamento em `App.jsx` com estrutura clara de rotas públicas, cliente e prestador

**Fase 2 — Telas Públicas (Tarefas 5-8):**
- **Home:** hero section com gradiente, cards de categorias ilustradas, seção "Como funciona" e CTA final
- **Login / Register:** layout split com painel visual à esquerda e formulário à direita; validação inline
- **Establishments:** grid responsivo com cards visuais, filtros por categoria e barra de busca aprimorada
- **EstablishmentDetail:** galeria de imagem, badge de categoria, cards de serviço com preço/duração e seção de horários formatada
- **Booking:** stepper de 3 passos (serviço → data → confirmação), calendário customizado e grade de horários disponíveis

**Fase 3 — Telas Autenticadas (Tarefas 9-12):**
- **MyAppointments:** cards de agendamento com status colorido, abas Próximos/Histórico e ação de cancelamento
- **Provider Dashboard:** métricas em cards de destaque, lista de agendamentos do dia e acesso rápido às seções
- **Provider Establishment:** formulário de CRUD completo com campos bem espaçados e feedback visual
- **Provider Services:** lista de serviços com toggle ativo/inativo, modal de criação/edição e confirmação de exclusão
- **Provider Schedule:** grid de dias da semana com toggles de ativação e inputs de horário por dia
- **Provider Appointments:** tabela de agendamentos com filtros de status e botões de ação contextual

**Correções pós-redesign:**
- Proteção contra data vazia no componente de agendamento (guard em chamada `format`)
- Scripts `dev:all` e `dev:backend`/`dev:frontend` adicionados ao `package.json` raiz para facilitar desenvolvimento
- Ajustes de acessibilidade, espaçamento e consistência visual em toda a aplicação

### 2.4 Navegação Entre Telas

- **React Router 6** com rotas aninhadas
- **ProtectedRoute** para controle de acesso por papel (CLIENT, PROVIDER, ADMIN)
- **Navbar responsiva** com links dinâmicos por papel
- Redirecionamento automático pós-login baseado no papel do usuário
- Intercept de resposta HTTP 401 → redireciona para `/login`

---

## 3. Arquitetura Técnica

### Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + Vite | 18 / 5 |
| Estilização | Tailwind CSS | 3 |
| Roteamento | React Router | 6 |
| HTTP Client | Axios | — |
| Backend | Node.js + Express | — |
| ORM | Prisma | — |
| Banco (dev) | SQLite | — |
| Banco (prod) | PostgreSQL | — |
| Autenticação | JWT + bcrypt | — |

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 18 + Vite (porta 5173)                               │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Contexts │  │  Pages   │  │Components│  │  services/ │  │
│  │AuthContext│  │ 12 telas │  │ UI + Nav │  │  api.js   │  │
│  │ToastCtx  │  │          │  │ProtRoute │  │  (axios)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────┬──────┘  │
└──────────────────────────────────────────────────┼──────────┘
                                                    │ HTTP /api
                                         Vite proxy │
┌──────────────────────────────────────────────────┼──────────┐
│                        BACKEND                    │          │
│  Node.js + Express (porta 3001)                  │          │
│                                                   ▼          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Routes  │→ │Controllers│→ │ Services │→ │  Prisma  │    │
│  │5 arquivos│  │5 arquivos│  │5 arquivos│  │   ORM    │    │
│  └──────────┘  └──────────┘  └──────────┘  └─────┬────┘    │
│                                                    │          │
│  ┌──────────────────┐   ┌──────────────────────┐  │          │
│  │  Middlewares     │   │     Utils            │  │          │
│  │  auth.js (JWT)   │   │  availableSlots.js   │  │          │
│  └──────────────────┘   └──────────────────────┘  │          │
└──────────────────────────────────────────────────┼──────────┘
                                                    │
┌──────────────────────────────────────────────────┼──────────┐
│                     BANCO DE DADOS                │          │
│  SQLite (dev) / PostgreSQL (prod) via Prisma      ▼          │
│                                                              │
│  ┌────────┐   ┌───────────────┐   ┌──────────┐             │
│  │  User  │──<│ Establishment │──<│ Service  │             │
│  └────────┘   └───────┬───────┘   └────┬─────┘             │
│                       │                 │                    │
│               ┌───────┴──────┐  ┌──────▼──────┐            │
│               │ WorkingHours │  │ Appointment │            │
│               └──────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Diagrama Entidade-Relacionamento (ERD)

```
┌──────────────────────────────┐
│            USER              │
├──────────────────────────────┤
│ id        String (PK, CUID)  │
│ name      String             │
│ email     String (UNIQUE)    │
│ password  String (bcrypt)    │
│ phone     String?            │
│ role      CLIENT|PROVIDER|   │
│           ADMIN              │
│ createdAt DateTime           │
│ updatedAt DateTime           │
└──────────┬───────────────────┘
           │ 1
           │ possui N
           ▼
┌──────────────────────────────┐         ┌──────────────────────────┐
│       ESTABLISHMENT          │ 1     N │      WORKING_HOURS       │
├──────────────────────────────┤─────────┤──────────────────────────┤
│ id          String (PK)      │         │ id              String PK │
│ name        String           │         │ establishmentId String FK │
│ description String?          │         │ dayOfWeek       Int (0-6) │
│ category    SALON|PETSHOP|   │         │ startTime       String    │
│             CLINIC|OTHER     │         │ endTime         String    │
│ address     String?          │         └──────────────────────────┘
│ phone       String?          │
│ ownerId     String (FK→User) │         ┌──────────────────────────┐
│ createdAt   DateTime         │ 1     N │         SERVICE          │
│ updatedAt   DateTime         │─────────┤──────────────────────────┤
└──────────┬───────────────────┘         │ id              String PK │
           │ 1                           │ name            String    │
           │ tem N                       │ description     String?   │
           ▼                            │ duration        Int (min) │
┌──────────────────────────────┐         │ price           Float     │
│        APPOINTMENT           │         │ establishmentId String FK │
├──────────────────────────────┤         │ active          Boolean   │
│ id              String (PK)  │         │ createdAt       DateTime  │
│ clientId        String FK───────────→ USER                        │
│ serviceId       String FK───────────→ SERVICE                     │
│ establishmentId String FK───────────→ ESTABLISHMENT               │
│ dateTime        DateTime     │         └──────────────────────────┘
│ endTime         DateTime     │
│ status          PENDING|     │
│                 CONFIRMED|   │
│                 CANCELLED|   │
│                 COMPLETED    │
│ notes           String?      │
│ createdAt       DateTime     │
│ updatedAt       DateTime     │
└──────────────────────────────┘
```

---

## 5. Diagrama de Fluxo — Agendamento de Serviço (Cliente)

```
                    CLIENTE
                       │
                       ▼
              ┌─────────────────┐
              │  Acessa /login  │
              │  ou /register   │
              └────────┬────────┘
                       │ JWT gerado
                       ▼
              ┌─────────────────┐
              │  /establishments│
              │  Lista com      │
              │  filtro/busca   │
              └────────┬────────┘
                       │ clica no card
                       ▼
              ┌─────────────────┐
              │/establishments/ │
              │:id              │
              │Serviços e       │
              │horários         │
              └────────┬────────┘
                       │ clica "Agendar"
                       ▼
              ┌─────────────────┐
              │ /booking/       │
              │ :estId/:svcId   │
              │                 │
              │ 1. Escolhe data │
              │ 2. Carrega      │
              │    slots livres │
              │ 3. Escolhe hora │
              │ 4. Confirma     │
              └────────┬────────┘
                       │ POST /appointments
                       ▼
              ┌─────────────────┐
              │/my-appointments │
              │ Aba "Próximos"  │
              │ Pode cancelar   │
              └─────────────────┘
```

---

## 6. Diagrama de Fluxo — Gestão do Prestador

```
                   PRESTADOR
                       │
                       ▼
              ┌─────────────────┐
              │  Login/Cadastro │
              │  role=PROVIDER  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │/provider/dash   │
              │ Stats do dia    │
              │ Links rápidos   │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┬─────────────┐
          ▼            ▼            ▼             ▼
  ┌──────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │/provider/│  │/provider/│ │/provider/│ │/provider/│
  │establis..│  │ services │ │ schedule │ │appoint.. │
  │          │  │          │ │          │ │          │
  │CRUD do   │  │CRUD de   │ │Horários  │ │Confirmar │
  │negócio   │  │serviços  │ │por dia   │ │Cancelar  │
  │          │  │ativo/    │ │da semana │ │Completar │
  │Criar     │  │inativo   │ │          │ │          │
  │Editar    │  │          │ │          │ │Filtrar   │
  │Excluir   │  │          │ │          │ │por status│
  └──────────┘  └──────────┘ └──────────┘ └──────────┘
```

---

## 7. Endpoints da API REST

```
AUTH
  POST   /api/auth/register          Cadastrar usuário
  POST   /api/auth/login             Login → JWT
  GET    /api/auth/me                Dados do usuário logado

ESTABELECIMENTOS
  GET    /api/establishments         Listar todos (público)
  GET    /api/establishments/my      Estabelecimentos do provider
  GET    /api/establishments/:id     Detalhes do estabelecimento
  POST   /api/establishments         Criar (PROVIDER)
  PUT    /api/establishments/:id     Editar (owner)
  DELETE /api/establishments/:id     Excluir (owner)

SERVIÇOS
  GET    /api/establishments/:id/services   Listar serviços
  POST   /api/establishments/:id/services   Criar serviço (PROVIDER)
  PUT    /api/services/:id                   Editar serviço
  DELETE /api/services/:id                   Desativar serviço

HORÁRIOS
  GET    /api/establishments/:id/working-hours  Listar horários
  POST   /api/establishments/:id/working-hours  Criar/atualizar (upsert)
  PUT    /api/working-hours/:id                  Atualizar registro

AGENDAMENTOS
  GET    /api/appointments                          Listar por papel
  GET    /api/establishments/:id/available-slots    Horários livres
  POST   /api/appointments                          Criar agendamento
  PATCH  /api/appointments/:id/status               Atualizar status
```

---

## 8. Diagrama de Sequência — Cálculo de Slots Disponíveis

```
Cliente          Frontend         Backend API       Banco de Dados
   │                │                  │                  │
   │ Escolhe data   │                  │                  │
   │──────────────→ │                  │                  │
   │                │ GET /available-  │                  │
   │                │ slots?date=X     │                  │
   │                │ &serviceId=Y     │                  │
   │                │─────────────────→│                  │
   │                │                  │ busca WorkingHours│
   │                │                  │─────────────────→│
   │                │                  │←─────────────────│
   │                │                  │ busca Service     │
   │                │                  │ (duração)         │
   │                │                  │─────────────────→│
   │                │                  │←─────────────────│
   │                │                  │ busca Appointments│
   │                │                  │ do dia (≠CANCEL) │
   │                │                  │─────────────────→│
   │                │                  │←─────────────────│
   │                │                  │                  │
   │                │                  │ gera slots de    │
   │                │                  │ início ao fim    │
   │                │                  │ filtra conflitos │
   │                │←─────────────────│                  │
   │ Vê slots livres│                  │                  │
   │←───────────────│                  │                  │
```

---

## 9. Checklist Final Sprint 2

| Item | Status |
|---|---|
| Conexão com banco de dados | ✅ Prisma + SQLite/PostgreSQL |
| Migration de banco | ✅ 20260411192510_init |
| Seed de dados demo | ✅ Usuários, estabelecimentos, agendamentos |
| CRUD — Autenticação | ✅ Registro, login, JWT, bcrypt |
| CRUD — Estabelecimentos (backend) | ✅ Todos os endpoints |
| CRUD — Estabelecimentos (frontend) | ✅ Tela /provider/establishment |
| CRUD — Serviços | ✅ Backend + frontend |
| CRUD — Horários | ✅ Backend + frontend |
| CRUD — Agendamentos | ✅ Criar, cancelar, atualizar status |
| Telas base (12 telas) | ✅ Público + cliente + prestador |
| Navegação entre telas | ✅ React Router 6 + ProtectedRoute |
| Proteção de rotas por papel | ✅ CLIENT, PROVIDER, ADMIN |
| Algoritmo de slots disponíveis | ✅ Sem conflito de horários |
| Componentes reutilizáveis | ✅ Button, Input, Modal, Badge, Card, etc. |
| Responsividade (mobile) | ✅ Tailwind CSS |
| Redesign visual — fundação (Navbar, Layout, Sidebar) | ✅ Tarefas 1-4 concluídas |
| Redesign visual — telas públicas (Home, Login, Register) | ✅ Tarefas 5-6 concluídas |
| Redesign visual — Establishments e Booking | ✅ Tarefas 7-8 concluídas |
| Redesign visual — MyAppointments e Provider Dashboard | ✅ Tarefas 9-10 concluídas |
| Redesign visual — painel provider completo | ✅ Tarefas 11-12 concluídas |
| Correções pós-redesign (guard de data, scripts dev) | ✅ Aplicadas |
| Documentação técnica | ✅ docs/documentacao-tecnica.md |
| README com instruções | ✅ README.md |

---

## 10. Instruções para Rodar o Projeto

### Setup inicial (primeira vez)

```bash
# Instalar dependências de backend e frontend de uma vez
npm run install:all

# Configurar banco de dados
cd backend
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
cd ..
```

### Rodar o projeto

```bash
# Na raiz do projeto — sobe backend (porta 3001) e frontend (porta 5173) simultaneamente
npm run dev
```

> Usa `concurrently` internamente. Não é necessário abrir dois terminais.

### Rodar separadamente (opcional)

```bash
npm run dev:backend    # Apenas backend — porta 3001
npm run dev:frontend   # Apenas frontend — porta 5173
```

**Credenciais de demonstração:**

| Papel | Email | Senha |
|---|---|---|
| Admin | admin@agendafacil.com | admin123 |
| Prestador | joao@salao.com | provider123 |
| Prestador | maria@petshop.com | provider123 |
| Cliente | carlos@email.com | client123 |
| Cliente | ana@email.com | client123 |
