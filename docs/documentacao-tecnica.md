# Documentação Técnica — AgendaFácil

## 1. Descrição do Sistema

**AgendaFácil** é uma plataforma web de agendamento de serviços, permitindo que clientes encontrem estabelecimentos (salões, pet shops, clínicas, etc.) e agendem horários online, enquanto prestadores gerenciam sua agenda e serviços em tempo real.

---

## 2. Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 18+ | Runtime JavaScript |
| Express | 4.18.3 | Framework HTTP |
| Prisma ORM | 5.10.0 | ORM + Migrations |
| SQLite (dev) | — | Banco de dados local |
| PostgreSQL (prod) | 14+ | Banco de dados produção |
| jsonwebtoken | 9.0.2 | Autenticação JWT |
| bcryptjs | 2.4.3 | Hash de senhas |
| date-fns | 3.3.1 | Manipulação de datas |
| express-validator | 7.0.1 | Validação de inputs |
| cors | 2.8.5 | Cross-Origin Resource Sharing |

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18.2.0 | UI Library |
| Vite | 5.1.4 | Build tool / Dev server |
| React Router | 6.22.1 | Roteamento SPA |
| Tailwind CSS | 3.4.1 | Estilização utility-first |
| Axios | 1.6.7 | Cliente HTTP |
| date-fns | 3.3.1 | Formatação de datas |

---

## 3. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                    │
│              React SPA — porta 5173                      │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  Pages  │ │Contexts  │ │Components│ │  api.js    │  │
│  │  /10    │ │Auth/Toast│ │ UI/Layout│ │  Axios     │  │
│  └─────────┘ └──────────┘ └──────────┘ └────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST (proxy /api)
┌────────────────────────▼────────────────────────────────┐
│                   SERVIDOR (Node.js)                     │
│              Express API — porta 3001                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  Routes  │→│Controllers│→│ Services │→│  Prisma    │ │
│  │  /5      │ │  /5      │ │  /5      │ │   ORM      │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────┬──────┘ │
└──────────────────────────────────────────────┬───────��──┘
                                               │
┌─────────────────────────────────────────��────▼──────────┐
│                   BANCO DE DADOS                         │
│         SQLite (dev.db) / PostgreSQL (prod)              │
│  Users │ Establishments │ Services │ WorkingHours │ Appointments │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Autenticação

```
Browser → POST /api/auth/login → authService.login()
       ← { token, user }
Browser salva token no localStorage
Próximas requisições → Authorization: Bearer <token>
auth.js middleware → jwt.verify() → req.user
requireRole() → verifica role → permite ou nega
```

---

## 4. Modelagem do Banco de Dados (ER)

```
USER
  id          PK
  name        String
  email       String UNIQUE
  password    String (hash bcrypt)
  phone       String?
  role        String (CLIENT|PROVIDER|ADMIN)
  createdAt   DateTime
  updatedAt   DateTime

ESTABLISHMENT
  id          PK
  name        String
  description String?
  category    String (SALON|PETSHOP|CLINIC|OTHER)
  address     String?
  phone       String?
  ownerId     FK → User.id
  createdAt   DateTime
  updatedAt   DateTime

SERVICE
  id              PK
  name            String
  description     String?
  duration        Int (minutos)
  price           Float
  establishmentId FK → Establishment.id
  active          Boolean (default true)
  createdAt       DateTime

WORKING_HOURS
  id              PK
  establishmentId FK → Establishment.id
  dayOfWeek       Int (0=Dom...6=Sab)
  startTime       String "HH:mm"
  endTime         String "HH:mm"

APPOINTMENT
  id              PK
  clientId        FK → User.id
  serviceId       FK → Service.id
  establishmentId FK → Establishment.id
  dateTime        DateTime
  endTime         DateTime
  status          String (PENDING|CONFIRMED|CANCELLED|COMPLETED)
  notes           String?
  createdAt       DateTime
  updatedAt       DateTime
```

**Relacionamentos:**
- User 1:N Establishment (um prestador tem vários estabelecimentos)
- User 1:N Appointment (um cliente tem vários agendamentos)
- Establishment 1:N Service
- Establishment 1:N WorkingHours
- Establishment 1:N Appointment
- Service 1:N Appointment

---

## 5. Endpoints da API

### Autenticação

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | /api/auth/register | — | Criar conta (CLIENT ou PROVIDER) |
| POST | /api/auth/login | — | Login, retorna JWT |
| GET | /api/auth/me | JWT | Dados do usuário logado |

### Estabelecimentos

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | /api/establishments | — | Listar (filtro por ?category=) |
| GET | /api/establishments/my | PROVIDER | Estabelecimentos do prestador |
| GET | /api/establishments/:id | — | Detalhes com serviços e horários |
| POST | /api/establishments | PROVIDER | Criar estabelecimento |
| PUT | /api/establishments/:id | PROVIDER | Editar (só dono) |
| DELETE | /api/establishments/:id | PROVIDER | Remover (só dono) |

### Serviços

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | /api/establishments/:id/services | — | Listar serviços ativos |
| POST | /api/establishments/:id/services | PROVIDER | Criar serviço |
| PUT | /api/services/:id | PROVIDER | Editar serviço |
| DELETE | /api/services/:id | PROVIDER | Desativar serviço |

### Horários de Funcionamento

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | /api/establishments/:id/working-hours | — | Listar horários |
| POST | /api/establishments/:id/working-hours | PROVIDER | Criar/atualizar (upsert) |
| PUT | /api/working-hours/:id | PROVIDER | Atualizar um registro |

### Agendamentos

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | /api/appointments | JWT | Listar (filtrado por role) |
| GET | /api/establishments/:id/available-slots | — | Horários livres (?date=&serviceId=) |
| POST | /api/appointments | CLIENT | Criar agendamento |
| PATCH | /api/appointments/:id/status | JWT | Atualizar status |

---

## 6. Algoritmo de Slots Disponíveis

```
Entrada: establishmentId, serviceId, date (YYYY-MM-DD)

1. Buscar WorkingHours onde dayOfWeek = getDay(date)
   → Se não houver: retornar []

2. Buscar Service para obter duration (minutos)

3. Gerar slots:
   startMin = timeToMinutes(startTime)  // ex: "08:00" → 480
   endMin   = timeToMinutes(endTime)    // ex: "18:00" → 1080
   for t = startMin; t + duration <= endMin; t += duration:
     slots.push(t)

4. Buscar Appointments do dia (status != CANCELLED)

5. Para cada slot, verificar conflito:
   slotStart = t
   slotEnd   = t + duration
   conflito = EXISTS appointment WHERE:
     apptStart < slotEnd AND apptEnd > slotStart

6. Retornar slots sem conflito como ["08:00", "09:00", ...]
```

---

## 7. Regras de Negócio

1. Não agendar no passado (`dateTime < now` → 400)
2. Não agendar em horário ocupado (verificação de overlap → 409)
3. PROVIDER só gerencia seus próprios estabelecimentos (403 caso contrário)
4. CLIENT cancela apenas agendamentos PENDING ou CONFIRMED
5. PROVIDER pode: CONFIRMED, CANCELLED, COMPLETED
6. Serviços inativos não aparecem para clientes (`active = false`)

---

## 8. Instruções de Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm 9+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env se necessário (DATABASE_URL, JWT_SECRET)

npx prisma migrate dev --name init
node prisma/seed.js

npm run dev
# Servidor em http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Aplicação em http://localhost:5173
```

### Migrar para PostgreSQL (produção)

1. Alterar `schema.prisma`: `provider = "postgresql"`
2. Atualizar `.env`: `DATABASE_URL="postgresql://user:pass@host:5432/agendafacil"`
3. Executar: `npx prisma migrate dev --name init`

---

## 9. Contas de Demonstração (Seed)

| Papel | E-mail | Senha |
|---|---|---|
| Admin | admin@agendafacil.com | admin123 |
| Prestador (Salão) | joao@salao.com | provider123 |
| Prestador (Pet Shop) | maria@petshop.com | provider123 |
| Cliente | carlos@email.com | client123 |
| Cliente | ana@email.com | client123 |

---

## 10. Telas do Sistema

### Área do Cliente
- **Home** — Landing page com categorias de serviços e hero section
- **Estabelecimentos** — Grid com filtro por categoria e busca por nome
- **Detalhe do Estabelecimento** — Informações, serviços com preços/duração, horários
- **Agendamento** — Seleção de data → horários disponíveis → confirmação com modal
- **Meus Agendamentos** — Tabs "Próximos" / "Histórico", cancelamento

### Área do Prestador
- **Dashboard** — Cards de métricas, agendamentos do dia, links rápidos
- **Serviços** — Tabela CRUD com toggle ativo/inativo, modal de criação/edição
- **Horários** — Grade semanal com checkbox por dia e inputs de hora
- **Agendamentos** — Tabela filtrada por status, ações confirmar/concluir/cancelar

### Autenticação
- **Login** — Formulário com credenciais de teste exibidas
- **Cadastro** — Seletor de papel (Cliente / Prestador) + formulário

---

## 11. Funcionalidades Implementadas

- [x] Autenticação JWT com refresh via localStorage
- [x] Três níveis de acesso: CLIENT, PROVIDER, ADMIN
- [x] CRUD completo de estabelecimentos
- [x] CRUD de serviços com ativação/desativação
- [x] Configuração de horários de funcionamento por dia da semana
- [x] Cálculo automático de slots disponíveis
- [x] Validação de conflito de horários no backend
- [x] Validação de agendamento no passado
- [x] Gestão completa do ciclo de vida do agendamento
- [x] Interface responsiva (mobile-first)
- [x] Toasts de feedback para todas as ações
- [x] Loading states em todos os formulários e listas
- [x] Seed com dados realistas para demonstração

---

## 12. Possíveis Melhorias Futuras

1. **Notificações por e-mail** — Envio automático ao confirmar/cancelar agendamento
2. **Upload de foto** — Imagem de capa para estabelecimentos
3. **Avaliações** — Sistema de notas e comentários pós-atendimento
4. **Pagamento online** — Integração com Stripe/MercadoPago
5. **Relatórios** — Gráficos de receita, agendamentos por per��odo
6. **Múltiplos profissionais** — Cada profissional com sua própria agenda
7. **App mobile** — React Native ou PWA
8. **Fila de espera** — Lista de espera para horários cancelados
9. **Recorrência** — Agendamentos semanais automáticos
10. **Mapa** — Busca de estabelecimentos por geolocalização
