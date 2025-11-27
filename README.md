# 🌐 TelecomTools Suite - Frontend

Frontend da aplicação TelecomTools Suite, desenvolvido com **Next.js 15**, **TypeScript** e **Material-UI**.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Material-UI (MUI)** - Componentes UI
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos
- **React Leaflet** - Mapas interativos
- **Notistack** - Notificações

## 📋 Pré-requisitos

- Node.js 18+ ou 20+
- npm ou yarn
- Backend rodando em `http://localhost:8000`

## 🔧 Instalação

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env.local`:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📦 Build para Produção

```bash
npm run build
npm start
```

## 🎨 Funcionalidades

### ✅ Implementadas

- [x] **Autenticação**
  - Login com JWT
  - Registro de usuários
  - Proteção de rotas
  
- [x] **Dashboard**
  - Estatísticas gerais
  - Cards informativos
  - Navegação lateral

### 🚧 Em Desenvolvimento

- [ ] **Medições de Sinal**
  - Listar medições
  - Criar nova medição
  - Mapa de calor
  - Estatísticas de cobertura

- [ ] **Torres**
  - Listar torres
  - Adicionar torre
  - Visualizar no mapa
  - Integração OpenCellID

- [ ] **Calculadora RF**
  - Link Budget
  - Path Loss (Friis, Okumura-Hata)
  - Zona de Fresnel
  - Conversões de unidades

- [ ] **Relatórios**
  - Gerar relatórios
  - Download PDF/CSV
  - Visualização de dados

- [ ] **Speed Tests**
  - Registrar testes
  - Estatísticas
  - Gráficos de performance

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Página inicial
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de registro
│   │   └── dashboard/         # Dashboard e sub-páginas
│   ├── components/            # Componentes reutilizáveis
│   │   ├── layout/            # Layouts
│   │   └── auth/              # Componentes de autenticação
│   ├── lib/                   # Bibliotecas e configurações
│   │   ├── api.ts            # Cliente API (Axios)
│   │   ├── store.ts          # Estado global (Zustand)
│   │   └── theme.ts          # Tema Material-UI
│   └── types/                 # TypeScript types
│       └── index.ts          # Tipos da API
├── public/                    # Arquivos estáticos
├── package.json              # Dependências
├── tsconfig.json             # Configuração TypeScript
├── next.config.ts            # Configuração Next.js
└── README.md                 # Este arquivo
```

## 🔐 Autenticação

O sistema usa **JWT (JSON Web Tokens)** para autenticação:

1. Login em `/api/v1/auth/login`
2. Token salvo no `localStorage`
3. Token enviado no header `Authorization: Bearer <token>`
4. Interceptor Axios adiciona token automaticamente
5. Redirect para `/login` se 401 Unauthorized

## 🎨 Tema e Estilização

### Material-UI Theme

Customizado em `src/lib/theme.ts`:

- **Cores primárias**: Azul (#1976d2)
- **Cores secundárias**: Roxo (#9c27b0)
- **Tipografia**: Sans-serif system font stack
- **Border Radius**: 8px
- **Botões**: textTransform none

### Dark Mode

Para implementar dark mode:

```typescript
// src/lib/theme.ts
export const theme = createTheme({
  palette: {
    mode: 'dark', // ou 'light'
    // ...
  },
});
```

## 🌐 Deploy na Vercel

### Método 1: Via GitHub (Recomendado)

1. **Commit e push para GitHub**
```bash
git add .
git commit -m "Add frontend"
git push
```

2. **Conectar no Vercel**
   - Acesse: https://vercel.com
   - New Project
   - Import from GitHub
   - Selecione seu repositório

3. **Configurar Build**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Variáveis de Ambiente**
```env
NEXT_PUBLIC_API_URL=https://seu-backend.up.railway.app
```

5. **Deploy** 🚀

### Método 2: Via Vercel CLI

```bash
npm i -g vercel
cd frontend
vercel
```

## 🔗 Conexão com Backend

### Desenvolvimento Local

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Produção

```env
NEXT_PUBLIC_API_URL=https://seu-backend.up.railway.app
```

**IMPORTANTE**: O backend precisa ter CORS configurado para aceitar requests do frontend!

No backend (`app/main.py`):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev         # Inicia servidor de desenvolvimento

# Build
npm run build       # Cria build de produção
npm start           # Roda build de produção

# Lint
npm run lint        # Verifica código
```

## 🐛 Troubleshooting

### Erro de CORS

**Problema**: `Access-Control-Allow-Origin` error

**Solução**: Configure CORS no backend:
```python
BACKEND_CORS_ORIGINS=["http://localhost:3000", "https://seu-app.vercel.app"]
```

### Token expirado

**Problema**: Logout automático

**Solução**: O token JWT expira. Configure tempo maior no backend ou implemente refresh token.

### API não responde

**Problema**: `Network Error`

**Solução**: 
1. Verifique se backend está rodando
2. Verifique `NEXT_PUBLIC_API_URL`
3. Verifique CORS no backend

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Pull Request

## 📄 Licença

Este projeto é privado.

## 👨‍💻 Desenvolvido por

TelecomTools Suite Team

---

**Status**: 🚧 Em Desenvolvimento

**Última atualização**: Novembro 2024

