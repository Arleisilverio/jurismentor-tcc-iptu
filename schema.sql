-- SCHEMA DO SUPABASE: JURISMENTOR IPTU CURITIBA

-- 1. Tabela de Mensagens do Chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL DEFAULT 'default_session',
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    mode TEXT DEFAULT 'Tutor Explicativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Anotações de Estudo e Dicas para Apresentação
CREATE TABLE IF NOT EXISTS study_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Geral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Simulações da Banca Examinadora
CREATE TABLE IF NOT EXISTS banca_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    user_answer TEXT,
    evaluator_score INTEGER CHECK (evaluator_score BETWEEN 0 AND 10),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security) e permitir inserção pública para uso como app pessoal
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE banca_simulations ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso aberto para o app de bolso
CREATE POLICY "Permitir leitura anonima" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anonima" ON chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura de notas" ON study_notes FOR SELECT USING (true);
CREATE POLICY "Permitir insercao de notas" ON study_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir remocao de notas" ON study_notes FOR DELETE USING (true);

CREATE POLICY "Permitir simulacoes" ON banca_simulations FOR ALL USING (true);
