import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gylkjshsfncolomzqzbx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5bGtqc2hzZm5jb2xvbXpxemJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NjA1MTMsImV4cCI6MjEwMzMzNjUxM30.4GWwOLxLg32AXO6nJEIP2Ao9FArXSc3TI0njpQBjQgk';

// Instância única do Supabase no navegador.
// Precisa ser singleton para que a sessão de login (Supabase Auth) seja
// compartilhada por todas as abas/componentes do app.
let browserClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (browserClient) return browserClient;

  try {
    browserClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Evita deadlock do navigator.locks no @supabase/auth-js após dias sem abrir o app
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => await fn(),
      },
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
