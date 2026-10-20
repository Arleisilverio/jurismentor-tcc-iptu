import React, { useState, useEffect } from 'react';
import { X, Database, Key, CheckCircle2, AlertCircle, Save, ExternalLink } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupabaseUrl(localStorage.getItem('JURIS_SUPABASE_URL') || '');
      setSupabaseKey(localStorage.getItem('JURIS_SUPABASE_KEY') || '');
      setGeminiKey(localStorage.getItem('JURIS_GEMINI_KEY') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setTestStatus('error');
      setStatusMessage('Preencha a URL e a Anon Key do Supabase.');
      return;
    }

    setTestStatus('testing');
    setStatusMessage('Testando conexão...');

    try {
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (!client) throw new Error('Não foi possível inicializar o cliente.');

      const { error } = await client.from('chat_messages').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setTestStatus('success');
      setStatusMessage('Conectado ao Supabase com sucesso!');
    } catch (err: any) {
      console.error(err);
      setTestStatus('error');
      setStatusMessage('Erro de conexão: ' + (err.message || 'Verifique as credenciais ou as tabelas do schema.sql.'));
    }
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('JURIS_SUPABASE_URL', supabaseUrl.trim());
      localStorage.setItem('JURIS_SUPABASE_KEY', supabaseKey.trim());
      localStorage.setItem('JURIS_GEMINI_KEY', geminiKey.trim());
    }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Configurações & Conexões</h2>
            <p className="text-xs text-slate-400">Supabase (banco de dados) e IA de bolso</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Supabase Box */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Project URL</span>
              </label>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center space-x-0.5"
              >
                <span>Dashboard</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="text"
              placeholder="https://xyz.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />

            <label className="text-xs font-semibold text-slate-200 block">
              Supabase Anon Key (Chave Pública)
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 disabled:opacity-50"
              >
                {testStatus === 'testing' ? 'Testando...' : 'Testar Conexão'}
              </button>

              {testStatus === 'success' && (
                <span className="flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Conectado</span>
                </span>
              )}
              {testStatus === 'error' && (
                <span className="flex items-center space-x-1 text-xs text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Falhou</span>
                </span>
              )}
            </div>

            {statusMessage && (
              <p className={`text-[11px] ${testStatus === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {statusMessage}
              </p>
            )}

            <p className="text-[10px] text-slate-400 italic">
              Dica: O script SQL de criação das tabelas está disponível em <code className="text-amber-300">schema.sql</code> na raiz do projeto.
            </p>
          </div>

          {/* AI Key Box */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Chave de API de IA (Google Gemini / OpenAI - Opcional)</span>
            </label>
            <input
              type="password"
              placeholder="AIzaSy... ou sk-..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O app possui um motor inteligente offline pré-alimentado com toda a sua monografia, artigos da LC 40 e julgados do TJPR. Adicionando a chave de API, ele ativa respostas gerativas dinâmicas personalizadas.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
