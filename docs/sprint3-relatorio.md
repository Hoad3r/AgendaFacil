# Relatório de Entregas — Sprint 3
**Projeto:** AgendaFácil  
**Data:** Maio de 2026  
**Repositório:** https://github.com/hoad3r/agendafacil  
**Branch:** `main`

---

## 1. Resumo Executivo

A Sprint 3 focou em **qualidade, usabilidade e relatórios**. Com o CRUD completo entregue na Sprint 2, o objetivo desta sprint foi melhorar a experiência do usuário com skeleton loading, gráficos de acompanhamento no dashboard, filtros avançados de busca, validações inline nos formulários e uma página completa de perfil para todos os papéis de usuário.

Nenhuma dependência externa de gráficos foi adicionada — os visuais foram construídos com CSS puro e Flexbox, mantendo o bundle leve.

---

## 2. Funcionalidades Entregues

### 2.1 Dashboard do Prestador — Relatórios Visuais

**Gráfico de barras — últimos 7 dias**

Exibe a quantidade de agendamentos por dia nos últimos 7 dias. O dia atual é destacado com cor mais intensa.

- Implementado com CSS + Flexbox (sem biblioteca externa)
- Barras proporcionais ao dia de maior volume
- Labels com dia da semana abreviado em pt-BR via `date-fns`
- Componente: `WeekChart` em `frontend/src/pages/provider/Dashboard.jsx`

**Ranking de serviços mais realizados**

Exibe os 5 serviços com mais agendamentos com status `COMPLETED`, em barras de progresso horizontais.

- Agrupa por nome do serviço e ordena por quantidade decrescente
- Barra do serviço líder equivale a 100%; demais são proporcionais
- Estado vazio tratado com mensagem contextual
- Componente: `TopServices` em `frontend/src/pages/provider/Dashboard.jsx`

**O que o dashboard exibe ao todo:**

| Métrica | Fonte dos dados |
|---|---|
| Agendamentos hoje | Filtra `dateTime` com `isToday` (date-fns) |
| Agendamentos esta semana | Filtra com `isThisWeek` (date-fns) |
| Pendentes | Filtra `status === 'PENDING'` |
| Receita total | Soma `service.price` dos agendamentos `COMPLETED` |
| Gráfico 7 dias | Contagem por dia via `isSameDay` |
| Top 5 serviços | Agrupamento dos agendamentos `COMPLETED` |
| Lista do dia | Agendamentos de hoje com nome do cliente e horário |

---

### 2.2 Skeleton Loading

Componentes de carregamento animado em vez de spinner genérico, melhorando a percepção de performance.

**Componentes criados** (`frontend/src/components/ui/Skeleton.jsx`):

| Componente | Uso |
|---|---|
| `Skeleton` | Bloco genérico animado, aceita `className` para dimensão |
| `SkeletonCard` | Simula card de agendamento (avatar + 3 linhas de texto) |
| `SkeletonStat` | Simula card de estatística (rótulo + número grande) |

**Onde aplicado:**
- Dashboard: 4 cards de stats, gráficos (2 painéis), lista do dia
- Agendamentos do prestador: lista de cards

---

### 2.3 Filtros Avançados — Agendamentos do Prestador

A página de gestão de agendamentos recebeu sistema de filtros combinados.

**Filtros implementados:**

| Filtro | Tipo | Comportamento |
|---|---|---|
| Busca textual | Input com ícone Search | Filtra por nome do cliente ou nome do serviço (case-insensitive) |
| Data específica | Input date com ícone Filter | Exibe apenas agendamentos da data selecionada |
| Status | Abas clicáveis | Todos / Pendentes / Confirmados / Concluídos / Cancelados |

**Comportamento geral:**
- Todos os filtros combinam simultaneamente (lógica AND)
- Calculado com `useMemo` para evitar re-renders desnecessários
- Botão "Limpar filtros" aparece quando qualquer filtro está ativo
- Contador de resultados encontrados exibido acima da lista
- Estado vazio com link para limpar filtros

**Arquivo:** `frontend/src/pages/provider/Appointments.jsx`

---

### 2.4 Validação Inline — Formulário de Cadastro

O formulário de registro passou a validar os campos no cliente antes de enviar ao servidor.

**Validações por campo:**

| Campo | Regra |
|---|---|
| Nome | Obrigatório |
| E-mail | Obrigatório + formato válido (regex) |
| Senha | Obrigatória + mínimo 6 caracteres |
| Telefone | Formato brasileiro opcional: `(XX) XXXXX-XXXX` |

**Comportamento:**
- `noValidate` no `<form>` desativa validação nativa do browser
- Erro por campo limpa individualmente ao digitar naquele campo
- Erro de servidor (ex: e-mail já cadastrado) exibido em banner separado
- Nenhuma requisição é feita se houver erros de validação

**Arquivo:** `frontend/src/pages/Register.jsx`

---

### 2.5 Página de Perfil (`/profile`)

Nova tela disponível para todos os papéis (CLIENT, PROVIDER, ADMIN).

**Funcionalidades:**

- Card de avatar com inicial do nome, e-mail e badge de papel (Cliente / Prestador / Admin)
- Edição de nome e telefone
- E-mail exibido como campo desabilitado (não pode ser alterado)
- Seção colapsável de alteração de senha com 3 campos: senha atual, nova senha, confirmar nova senha
- Validação completa antes de enviar: nome obrigatório, senha mínimo 6 caracteres, senhas iguais
- Atualiza o contexto de autenticação global após salvar com sucesso
- Feedback via toast de sucesso ou exibição do erro do servidor

**Backend necessário** (também implementado nesta sprint):

| Método | Rota | Descrição |
|---|---|---|
| PUT | `/api/auth/profile` | Atualiza nome, telefone e/ou senha |

A senha só é alterada se `newPassword` for enviado. Nesse caso, `currentPassword` é obrigatório e validado com bcrypt antes de qualquer alteração.

**Arquivos:**
- `frontend/src/pages/Profile.jsx`
- `backend/src/services/authService.js` — função `updateProfile`
- `backend/src/controllers/authController.js` — controller `updateProfile`
- `backend/src/routes/auth.js` — rota `PUT /profile`

---

### 2.6 Navbar — Acesso ao Perfil

A barra de navegação foi aprimorada para facilitar o acesso à página de perfil.

**Melhorias:**
- Avatar do usuário (desktop) virou link direto para `/profile`
- Nome do usuário exibido ao lado do avatar em telas largas (breakpoint `lg`)
- Menu mobile inclui item "Meu Perfil" com ícone `UserCircle`
- Cabeçalho do menu mobile exibe nome e e-mail do usuário logado

**Arquivo:** `frontend/src/components/layout/Navbar.jsx`

---

## 3. Checklist Final Sprint 3

| Item | Status |
|---|---|
| Gráfico de barras — últimos 7 dias (CSS-only) | ✅ |
| Top 5 serviços mais realizados (barras de progresso) | ✅ |
| Skeleton loading — cards de stats | ✅ |
| Skeleton loading — gráficos do dashboard | ✅ |
| Skeleton loading — lista de agendamentos | ✅ |
| Filtro por texto em agendamentos (cliente/serviço) | ✅ |
| Filtro por data em agendamentos | ✅ |
| Botão "Limpar filtros" e contador de resultados | ✅ |
| Validação inline no formulário de cadastro | ✅ |
| Página de perfil — editar nome e telefone | ✅ |
| Página de perfil — alterar senha com validação | ✅ |
| Backend — endpoint PUT /auth/profile | ✅ |
| Navbar — link de perfil no avatar (desktop) | ✅ |
| Navbar — "Meu Perfil" no menu mobile | ✅ |
| Nenhuma biblioteca externa de gráficos adicionada | ✅ |

---

## 4. Diagrama de Fluxo — Relatório do Dashboard

```
                  PRESTADOR
                      │
                      ▼
             ┌─────────────────┐
             │ GET /appointments│
             │ (todos do estab.)│
             └────────┬─────────┘
                      │ retorna lista
                      ▼
             ┌─────────────────────────────────────┐
             │         FRONTEND (Dashboard)         │
             │                                      │
             │  isToday()     → agendamentos hoje   │
             │  isThisWeek()  → agendamentos semana │
             │  status=PENDING → pendentes          │
             │  status=COMPLETED + price → receita  │
             │                                      │
             │  isSameDay() × 7 dias → WeekChart   │
             │  groupBy(service) → TopServices      │
             │  isToday() → lista do dia            │
             └─────────────────────────────────────┘
```

---

## 5. Diagrama de Fluxo — Atualização de Perfil

```
           USUÁRIO
               │
               ▼
      ┌─────────────────┐
      │  Acessa /profile │
      └────────┬─────────┘
               │
      ┌────────▼─────────────────────┐
      │ Edita nome / telefone         │
      │ (opcional) ativa alteração    │
      │ de senha                      │
      └────────┬─────────────────────┘
               │ valida client-side
               ▼
      ┌─────────────────┐     falha    ┌──────────────────┐
      │ PUT /auth/profile│────────────→│ Exibe erro inline │
      └────────┬─────────┘             └──────────────────┘
               │ sucesso
               ▼
      ┌─────────────────┐
      │ Atualiza contexto│
      │ AuthContext      │
      │ Toast "Perfil    │
      │ atualizado!"     │
      └─────────────────┘
```

---

## 6. Arquivos Modificados / Criados

| Arquivo | Tipo | O que mudou |
|---|---|---|
| `frontend/src/pages/provider/Dashboard.jsx` | Modificado | WeekChart, TopServices, SkeletonStat, Skeleton |
| `frontend/src/pages/provider/Appointments.jsx` | Modificado | Filtros de busca, data e limpeza |
| `frontend/src/pages/Register.jsx` | Modificado | Validação inline por campo |
| `frontend/src/pages/Profile.jsx` | Criado | Página completa de perfil |
| `frontend/src/components/ui/Skeleton.jsx` | Criado | Skeleton, SkeletonCard, SkeletonStat |
| `frontend/src/components/layout/Navbar.jsx` | Modificado | Link de perfil, nome do usuário, menu mobile |
| `frontend/src/App.jsx` | Modificado | Rota `/profile` adicionada |
| `backend/src/services/authService.js` | Modificado | Função `updateProfile` |
| `backend/src/controllers/authController.js` | Modificado | Controller `updateProfile` |
| `backend/src/routes/auth.js` | Modificado | `PUT /profile` |
