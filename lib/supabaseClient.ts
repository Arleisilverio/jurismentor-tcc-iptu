import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Instância única do Supabase no navegador.
// Precisa ser singleton para que a sessão de login (Supabase Auth) seja
// compartilhada por todas as abas/componentes do app.
let browserClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return null;
  }

  if (browserClient) return browserClient;

  try {
    browserClient = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return browserClient;
  } catch (error) {
    console.warn('Erro ao inicializar Supabase client:', error);
    return null;
  }
};

export interface ChatMessage {
  id: string;
  user_id?: string;
  sender: 'user' | 'assistant';
  content: string;
  mode?: string;
  created_at: string;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}
