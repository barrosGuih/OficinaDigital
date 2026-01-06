# Oficina Digital - Sistema de Gestão Automotiva

Sistema completo de gestão para oficinas mecânicas desenvolvido com React, Vite e Tailwind CSS.

## Funcionalidades Implementadas

- **Autenticação**: Login simulado com proteção de rotas.
- **Dashboard**: Visão geral com gráficos de receita e atividade mensal.
- **Gestão de Veículos**: Listagem, busca e cadastro (mock).
- **Gestão de Serviços**: Controle de ordens de serviço e status.
- **Estoque de Peças**: Controle de inventário com alertas de estoque baixo.
- **Documentos**: Upload (drag & drop) e gestão de arquivos.
- **Pregões**: Módulo de cotações com placeholder para IA.

## Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Estilização**: Tailwind CSS, clsx, tailwind-merge
- **Roteamento**: React Router DOM
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Datas**: date-fns
- **Gerenciamento de Estado**: Context API (Auth e Data)

## Comandos de Desenvolvimento

### Instalação
```bash
npm install
```

### Rodar em Desenvolvimento
```bash
npm run dev
```

### Build de Produção
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/           # Componentes base (Button, Input, Card, etc.)
│   ├── layout/       # Layout principal (Sidebar, Header)
│   └── dashboard/    # Componentes específicos do dashboard
├── context/          # Contextos globais (Auth, Data)
├── pages/            # Páginas da aplicação (Login, Dashboard, Vehicles, etc.)
├── services/         # Serviços e Mock Data
├── types/            # Definições de tipos TypeScript
└── utils/            # Utilitários (cn, formatters)
```

## Próximos Passos (Roadmap)

1. **Persistência Real**: Integrar com Supabase ou Backend dedicado.
2. **Formulários Completos**: Implementar modais de edição/criação com validação (Zod/React Hook Form).
3. **Módulo de IA**: Implementar a lógica de comparação de estoque para pregões.
4. **Relatórios Avançados**: Exportação para PDF/Excel.
