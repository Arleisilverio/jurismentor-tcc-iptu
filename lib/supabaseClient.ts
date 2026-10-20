import { createClient } from '@supabase/supabase-js';

// Supabase client initialization with graceful fallback
export const getSupabaseClient = (customUrl?: string, customKey?: string) => {
  const url = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return null;
  }

  try {
    return createClient(url, key);
  } catch (error) {
    console.warn('Erro ao inicializar Supabase client:', error);
    return null;
  }
};

export interface ChatMessage {
  id: string;
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
