import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Send,
  Crown,
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';

const ADMIN_DEFAULT_EMAIL = 'arleisilverio41@gmail.com';

const translateAuthError = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos. Se não lembrar a senha, clique em "Esqueci minha senha" abaixo.';
  }
  if (m.includes('email not confirmed')) {
    return 'E-mail ainda não confirmado. Use "Esqueci minha senha" para ativar e definir sua senha.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Limite de envio de e-mails atingido. Use a redefinição direta de senha na tela abaixo.';
  }
  if (m.includes('network') || m.includes('fetch') || m.includes('timeout')) {
    return 'Falha de conexão com o servidor de autenticação. Verifique sua internet e tente novamente.';
  }
  return msg;
};

export const LoginScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState(ADMIN_DEFAULT_EMAIL);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const supabase = getSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Cliente Supabase não disponível.');
      return;
    }
    setError('');
    setInfo('');
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) {
        setError(translateAuthError(authError.message));
      }
    } catch (err: any) {
      setError(translateAuthError(err?.message || 'Erro ao realizar login.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Redefine a senha diretamente no Supabase Auth e já faz o login automático
  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError('');
    setInfo('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Informe o seu e-mail cadastrado.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A confirmação de senha não confere com a nova senha digitada.');
      return;
    }

    setIsLoading(true);
    try {
      const { data: updated, error: rpcError } = await supabase.rpc('reset_user_password', {
        target_email: cleanEmail,
        new_password: newPassword,
      });

      if (rpcError) {
        setError(translateAuthError(rpcError.message));
        setIsLoading(false);
        return;
      }

      if (!updated) {
        setError('Este e-mail não foi encontrado na lista de usuários cadastrados.');
        setIsLoading(false);
        return;
      }

      // Senha redefinida no banco! Agora autentica automaticamente com a nova senha
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: newPassword,
      });

      if (loginError) {
        setInfo('Senha redefinida com sucesso! Agora basta clicar em Entrar.');
        setPassword(newPassword);
        setViewMode('login');
      }
    } catch (err: any) {
      setError(translateAuthError(err?.message || 'Erro ao redefinir a senha.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Opção adicional: envia também o link de recuperação para o e-mail
  const handleSendResetEmail = async () => {
    if (!supabase) return;
    setError('');
    setInfo('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Digite seu e-mail acima para receber o link de redefinição.');
      return;
    }
    setIsSendingEmail(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      });
      if (resetError) {
        setError(translateAuthError(resetError.message));
      } else {
        setInfo(
          `Link de recuperação enviado para ${cleanEmail}. Você também pode redefinir sua nova senha diretamente nos campos abaixo!`
        );
      }
    } catch (err: any) {
      setError(translateAuthError(err?.message || 'Erro ao enviar e-mail.'));
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-amber-500/35 shadow-[0_0_45px_rgba(0,0,0,0.75)]">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.45)] border border-yellow-300/40 mb-4">
            <Shield className="w-9 h-9 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase">
            JurisMentor <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">IPTU</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {viewMode === 'login'
              ? 'Acesso Autenticado • TCC Imóveis Não Edificados'
              : 'Recuperação e Redefinição de Senha'}
          </p>
        </div>

        {/* =========================================================
            MODO 1: TELA DE LOGIN PRINCIPAL
           ========================================================= */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-email" className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>E-mail</span>
                </label>
                {email.trim().toLowerCase() === ADMIN_DEFAULT_EMAIL && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase">
                    <Crown className="w-3 h-3" />
                    Administrador
                  </span>
                )}
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arleisilverio41@gmail.com"
                className="w-full px-4 py-3 text-base rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 select-text"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-sm font-bold text-slate-200 flex items-center space-x-1.5"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Senha</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setInfo('');
                    setViewMode('forgot');
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Esqueci minha senha</span>
                </button>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-3 text-base rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 select-text"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 transition"
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
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
              <span>{isLoading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
            </button>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setEmail(ADMIN_DEFAULT_EMAIL)}
                className="hover:text-amber-300 transition underline underline-offset-2"
              >
                Usar e-mail ADM ({ADMIN_DEFAULT_EMAIL})
              </button>
              <button
                id="login-reset-password"
                type="button"
                onClick={() => {
                  setError('');
                  setInfo('');
                  setViewMode('forgot');
                }}
                className="font-bold text-slate-300 hover:text-amber-300 transition"
              >
                Redefinir senha →
              </button>
            </div>
          </form>
        )}

        {/* =========================================================
            MODO 2: ESQUECI MINHA SENHA / REDEFINIÇÃO COMPLETA
           ========================================================= */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleDirectPasswordReset} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
              Defina sua nova senha abaixo para a conta <strong>{email || ADMIN_DEFAULT_EMAIL}</strong> (ou envie um
              link de recuperação para o seu e-mail).
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>E-mail da Conta</span>
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arleisilverio41@gmail.com"
                className="w-full px-4 py-3 text-base rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 select-text"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reset-new-password"
                className="text-sm font-bold text-slate-200 flex items-center space-x-1.5"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Nova Senha (mínimo 6 caracteres)</span>
              </label>
              <div className="relative">
                <input
                  id="reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="w-full pl-4 pr-11 py-3 text-base rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 select-text"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 transition"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reset-confirm-password"
                className="text-sm font-bold text-slate-200 flex items-center space-x-1.5"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Confirmar Nova Senha</span>
              </label>
              <input
                id="reset-confirm-password"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full px-4 py-3 text-base rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 select-text"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{info}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl text-sm sm:text-base font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:brightness-110 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{isLoading ? 'Salvando e Entrando...' : 'Salvar Nova Senha e Entrar'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={isSendingEmail || isLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
            >
              {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-amber-400" />}
              <span>{isSendingEmail ? 'Enviando e-mail...' : 'Enviar também link para o meu e-mail'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError('');
                setInfo('');
                setViewMode('login');
              }}
              className="w-full flex items-center justify-center space-x-1.5 pt-1 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a tela de Login</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
