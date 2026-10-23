import React, { useState } from 'react';
import { Shield, Mail, Lock, LogIn, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';

const translateAuthError = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde alguns minutos.';
  if (m.includes('network') || m.includes('fetch')) return 'Falha de conexão com o servidor. Verifique sua internet.';
  return msg;
};

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const supabase = getSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError('');
    setInfo('');
    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) setError(translateAuthError(authError.message));
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    if (!supabase) return;
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Digite seu e-mail acima para receber o link de redefinição.');
      return;
    }
    setIsLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
    });
    if (resetError) setError(translateAuthError(resetError.message));
    else setInfo('Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.');
    setIsLoading(false);
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-amber-500/30 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-700 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.45)] border border-yellow-300/40 mb-4">
            <Shield className="w-9 h-9 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase">
            JurisMentor <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">IPTU</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">Acesso restrito • TCC Imóveis Não Edificados</p>
        </div>

        {!supabase ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>
              Supabase não configurado. Defina <code>NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no <code>.env.local</code> (ou na Vercel).
            </span>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>E-mail</span>
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 text-base rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 select-text"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Senha</span>
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-base rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 select-text"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{info}</span>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl text-base font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:brightness-110 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
            </button>

            <button
              id="login-reset-password"
              type="button"
              onClick={handleResetPassword}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-1.5 text-sm text-slate-400 hover:text-amber-300 transition disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>Esqueci minha senha</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
