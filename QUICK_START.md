# 🚀 Início Rápido - Frontend

## ✅ Pré-requisitos

- ✅ Node.js instalado (18+ ou 20+)
- ✅ Backend rodando em `http://localhost:8000`

## 📦 1. Instalar Dependências

```bash
cd frontend
npm install
```

## 🔧 2. Configurar Backend URL

O arquivo `.env.local` já está configurado com:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Se seu backend roda em outra porta, edite este arquivo.

## ▶️ 3. Iniciar Desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

## 🎯 4. Fazer Login

### Credenciais padrão:
- **Email**: `admin@telecom.com`
- **Senha**: `admin123`

Ou crie uma conta em: http://localhost:3000/register

## 📱 5. Navegação

- **/** - Página inicial
- **/login** - Login
- **/register** - Criar conta
- **/dashboard** - Dashboard (requer login)
- **/dashboard/signals** - Medições de sinal
- **/dashboard/towers** - Torres
- **/dashboard/calculator** - Calculadora RF
- **/dashboard/reports** - Relatórios
- **/dashboard/speed-tests** - Speed Tests

## 🐛 Problemas?

### Backend não responde

**Erro**: `Network Error` ou `CORS Error`

**Solução**:
1. Verifique se backend está rodando: http://localhost:8000/docs
2. Verifique `.env.local` tem a URL correta
3. Verifique CORS no backend (deve permitir `http://localhost:3000`)

### Erro ao fazer login

**Erro**: `401 Unauthorized`

**Solução**:
1. Verifique credenciais
2. Certifique-se que rodou `python scripts/init_db.py` no backend
3. Verifique se banco de dados foi criado

### Página em branco

**Solução**:
1. Abra DevTools (F12)
2. Verifique erros no Console
3. Rode `npm run dev` novamente

---

## 🎉 Tudo Pronto!

Você agora tem:
- ✅ Frontend rodando em `http://localhost:3000`
- ✅ Backend rodando em `http://localhost:8000`
- ✅ Login funcionando
- ✅ Dashboard acessível

**Próximos passos**:
- Explore o dashboard
- Cadastre medições de sinal
- Use a calculadora RF
- Gere relatórios

---

**Dúvidas?** Consulte `README.md` ou `DEPLOY_VERCEL.md`

