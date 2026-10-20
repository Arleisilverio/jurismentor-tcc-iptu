# ⚖️ JurisMentor IPTU Curitiba — Agente de Bolso para TCC

Aplicativo web mobile-first e agente de inteligência artificial pessoal projetado para ensinar, orientar e treinar o aluno durante todo o desenvolvimento, redação e sustentação oral do Trabalho de Conclusão de Curso (TCC) em Direito:

> **"A Tributação dos Imóveis Não Edificados no IPTU de Curitiba: critérios de enquadramento, transição em obras e a função social da propriedade urbana"**

---

## 📱 Principais Funcionalidades do Agente de Bolso

1. 💬 **Chat com o JurisMentor**:
   - Comutador instantâneo entre 4 modos de operação:
     - 🎓 **Tutor Explicativo**: Ensina teses, conceitos e linhas de raciocínio da monografia.
     - ⚖️ **Banca Simulada**: Arguição cética como um membro de banca de TCC.
     - 📝 **Redator ABNT**: Minutas e citações acadêmicas rigorosas.
     - 🏛️ **Consultoria Prática**: Estratégias processuais perante a SMFI e o TJPR.
   - Narração de áudio (Text-to-Speech) para você ouvir as respostas no celular.
   - Perguntas rápidas pré-configuradas.

2. ⚖️ **Simulador de Arguição da Banca**:
   - Banco de perguntas reais e capciosas feitas por examinadores de Direito Tributário e Urbanístico.
   - Revelação da resposta ideal, armadilhas a evitar e fundamentos normativos.
   - Sistema de autoavaliação (notas de 0 a 10) salvo no histórico.

3. 🎙️ **Treinador de Sustentação Oral (Ensaio da Defesa)**:
   - Roteiro slide a slide para apresentação de 12 a 15 minutos.
   - Cronômetro interativo com barra visual de progresso.
   - Fala sugerida, pontos-chave de ênfase e erros fatais a evitar.

4. 📚 **Guia Rápido da Tese & Leis**:
   - Síntese dos capítulos e do problema de pesquisa.
   - As 3 propostas de *Lege Ferenda* elaboradas para Curitiba.
   - Matriz normativa (CF/88, CTN, LC 40/2001, LC 136/2022).
   - Precedente paradigmático do TJPR (*Rel. Des. Rogério Kanayama*).

---

## 🚀 Como Rodar Localmente no seu Computador

1. Instale as dependências (já instaladas se estiver clonando):
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra no navegador:
```
http://localhost:3000
```

---

## 🗄️ Configuração do Banco de Dados no Supabase

1. Crie uma conta gratuita em [Supabase.com](https://supabase.com).
2. Crie um novo projeto (ex: `jurismentor-tcc`).
3. No menu lateral do Supabase, vá em **SQL Editor** e clique em **New Query**.
4. Copie todo o conteúdo do arquivo [`schema.sql`](./schema.sql) deste repositório e clique em **Run**.
5. No Supabase, vá em **Project Settings -> API** e copie:
   - **Project URL**
   - **anon public key**
6. No seu app (pelo celular ou PC), clique no ícone de **Engrenagem** no canto superior direito e cole essas chaves. Pronto! Todas as mensagens e notas serão salvas no seu Supabase.

---

## 🌐 Publicação no GitHub e Deploy na Vercel (Para usar no Celular)

### Passo 1: Subir o projeto para o GitHub
```bash
git init
git add .
git commit -m "feat: JurisMentor IPTU Curitiba - Agente de Bolso"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/jurismentor-iptu.git
git push -u origin main
```

### Passo 2: Deploy Gratuito na Vercel
1. Acesse [Vercel.com](https://vercel.com) e faça login com seu GitHub.
2. Clique em **Add New... -> Project** e selecione o repositório `jurismentor-iptu`.
3. Em *Environment Variables* (opcional), você pode adicionar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (se desejar IA gerativa adicional via Google AI Studio)
4. Clique em **Deploy**. Em menos de 2 minutos seu link estará no ar (ex: `https://jurismentor-iptu.vercel.app`).

### Passo 3: Usar como App no Celular (PWA)
1. Abra o link da Vercel no Safari (iPhone) ou Chrome (Android).
2. Toque no botão de **Compartilhar** (iOS) ou nos **3 pontos** (Android).
3. Selecione **"Adicionar à Tela de Início"** (Add to Home Screen).
4. O JurisMentor agora abrirá como um aplicativo nativo no seu bolso!
