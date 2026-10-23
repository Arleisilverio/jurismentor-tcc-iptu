-- =====================================================================
-- SCHEMA DO SUPABASE: JURISMENTOR IPTU CURITIBA
-- Login por e-mail/senha (Supabase Auth) + histórico por usuário + ADMIN
-- Script idempotente: pode ser executado de novo sobre um banco existente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. ADMINISTRADOR
-- O admin (aluno Arlei) tem acesso TOTAL a todas as linhas de todas as
-- tabelas do app. Para trocar o e-mail do admin, altere SÓ esta função.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = 'arleisilveiro41@gmail.com';
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------------------------------------------------------------------
-- 1. Tabela de Mensagens do Chat (histórico por usuário)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL DEFAULT 'default_session',
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    mode TEXT DEFAULT 'Tutor Explicativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 2. Tabela de Anotações de Estudo e Dicas para Apresentação
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Geral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 3. Tabela de Simulações da Banca Examinadora
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banca_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    user_answer TEXT,
    evaluator_score INTEGER CHECK (evaluator_score BETWEEN 0 AND 10),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 4. Dono de cada linha (user_id) — preenchido automaticamente com o
--    usuário logado. Linhas antigas (sem dono) ficam visíveis só ao admin.
-- ---------------------------------------------------------------------
ALTER TABLE chat_messages     ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE study_notes       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE banca_simulations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON chat_messages (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_study_notes_user           ON study_notes (user_id);
CREATE INDEX IF NOT EXISTS idx_banca_simulations_user     ON banca_simulations (user_id);

-- ---------------------------------------------------------------------
-- 5. RLS (Row Level Security)
-- ---------------------------------------------------------------------
ALTER TABLE chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE banca_simulations ENABLE ROW LEVEL SECURITY;

-- Remove as políticas antigas de acesso público/anônimo
DROP POLICY IF EXISTS "Permitir leitura anonima"   ON chat_messages;
DROP POLICY IF EXISTS "Permitir insercao anonima"  ON chat_messages;
DROP POLICY IF EXISTS "Permitir leitura de notas"  ON study_notes;
DROP POLICY IF EXISTS "Permitir insercao de notas" ON study_notes;
DROP POLICY IF EXISTS "Permitir remocao de notas"  ON study_notes;
DROP POLICY IF EXISTS "Permitir simulacoes"        ON banca_simulations;

-- Remove as políticas novas (para permitir reexecutar o script)
DROP POLICY IF EXISTS "Dono ou admin - chat"  ON chat_messages;
DROP POLICY IF EXISTS "Dono ou admin - notas" ON study_notes;
DROP POLICY IF EXISTS "Dono ou admin - banca" ON banca_simulations;

-- Cada usuário logado só vê/edita as próprias linhas; o admin vê/edita tudo.
CREATE POLICY "Dono ou admin - chat" ON chat_messages
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Dono ou admin - notas" ON study_notes
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Dono ou admin - banca" ON banca_simulations
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Visitantes não logados (anon) não acessam nada.
REVOKE ALL ON chat_messages, study_notes, banca_simulations FROM anon;
