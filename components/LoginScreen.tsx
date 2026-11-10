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
  Link2,
  GraduationCap,
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';

const ADMIN_DEFAULT_EMAIL = 'arleisilverio41@gmail.com';

const translateAuthError = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos. Se não lembrar a senha, clique em "Esqueci minha senha".';
  }
  if (m.includes('email not confirmed')) {
    return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
  }
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) {
    return 'Por segurança, aguarde 60 segundos antes de solicitar outro e-mail de recuperação.';
  }
  if (m.includes('otp_expired') || m.includes('expired') || m.includes('invalid token')) {
    return 'O link ou código do e-mail expirou. Solicite um novo e-mail de recuperação.';
  }
  if (m.includes('network') || m.includes('fetch') || m.includes('timeout')) {
    return 'Falha de conexão com o servidor de autenticação. Verifique sua internet.';
  }
  return msg;
};

interface LoginScreenProps {
  onPasswordRecoverySession?: () => void;
  onEnterStudentMode?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onPasswordRecoverySession,
  onEnterStudentMode,
}) => {
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState(ADMIN_DEFAULT_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [pastedRecoveryInput, setPastedRecoveryInput] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
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

  // Envia exclusivamente o link oficial de recuperação para o e-mail cadastrado
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError('');
    setInfo('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Digite seu e-mail cadastrado para receber o link de redefinição.');
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl =
        typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        setError(translateAuthError(resetError.message));
      } else {
        setEmailSent(true);
        setInfo(
          `Enviamos um link seguro de redefinição de senha para ${cleanEmail}. Abra seu e-mail (verifique também a caixa de Spam/Promoções) e clique no link recebido.`
        );
      }
    } catch (err: any) {
      setError(translateAuthError(err?.message || 'Erro ao enviar e-mail de recuperação.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Caso o usuário tenha recebido o link no e-mail mas o redirecionamento tenha apontado
  // para localhost no celular, permite validar o link/código oficial recebido no e-mail
  const handleVerifyEmailTokenOrLink = async () => {
    if (!supabase || !pastedRecoveryInput.trim()) return;
    setError('');
    setInfo('');
    setIsLoading(true);

    const raw = pastedRecoveryInput.trim();
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1) Se colou a URL com #access_token=...&refresh_token=...
      if (raw.includes('access_token=')) {
        const hashPart = raw.includes('#') ? raw.split('#')[1] : raw.split('?')[1] || raw;
        const params = new URLSearchParams(hashPart);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token') || '';
        if (accessToken) {
          const { error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionErr) {
            setError(translateAuthError(sessionErr.message));
          } else {
            onPasswordRecoverySession?.();
          }
          setIsLoading(false);
          return;
        }
      }

      // 2) Se colou a URL do e-mail com ?token=...&type=recovery
      if (raw.includes('token=')) {
        const queryPart = raw.includes('?') ? raw.split('?')[1] : raw;
        const params = new URLSearchParams(queryPart);
        const tokenHash = params.get('token_hash') || params.get('token');
        if (tokenHash) {
          const { error: otpErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });
          if (otpErr) {
            setError(translateAuthError(otpErr.message));
          } else {
            onPasswordRecoverySession?.();
          }
          setIsLoading(false);
          return;
        }
      }

      // 3) Se digitou o código numérico (OTP de 6 dígitos do e-mail)
      const { error: codeErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: raw,
        type: 'recovery',
      });
      if (codeErr) {
        setError(translateAuthError(codeErr.message));
      } else {
        onPasswordRecoverySession?.();
      }
    } catch (err: any) {
      setError(translateAuthError(err?.message || 'Link ou código inválido.'));
    } finally {
      setIsLoading(false);
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
              ? 'Centro Universitário UniDomBosco • Direito Tributário Curitiba/PR'
              : 'Recuperação Segura por E-mail'}
          </p>
        </div>

        {/* =========================================================
            ACESSO LIVRE PARA ALUNOS & PESQUISADORES (FUNÇÃO SOCIAL)
           ========================================================= */}
        {viewMode === 'login' && onEnterStudentMode && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-slate-950 to-cyan-500/10 border-2 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.2)] space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                  Acesso Aberto aos Alunos • Função Social
                </span>
                <h2 className="text-sm sm:text-base font-black text-white">
                  Estudante ou Pesquisador de Direito?
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                  Acesse livremente o <strong>Mentor IA (Chat Jurídico & Revisor ABNT)</strong>, o{' '}
                  <strong>Artigo Científico Completo</strong> e o <strong>Vade Mecum do IPTU de Curitiba</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onEnterStudentMode}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-[0_0_18px_rgba(16,185,129,0.35)] hover:brightness-110 active:scale-95 transition"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Entrar como Aluno (Mentor IA + Artigo ABNT)</span>
            </button>
          </div>
        )}

        {viewMode === 'login' && onEnterStudentMode && (
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-black uppercase tracking-widest text-amber-400 whitespace-nowrap">
              🔒 Área Exclusiva do Autor (Defesa & Banca)
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>
        )}

        {/* =========================================================
            MODO 1: TELA DE LOGIN PRINCIPAL (ARLEI / ADMIN)
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
              <span>{isLoading ? 'Autenticando...' : 'Entrar'}</span>
            </button>

            <button
              id="login-reset-password"
              type="button"
              onClick={() => {
                setError('');
                setInfo('');
                setViewMode('forgot');
              }}
              className="w-full flex items-center justify-center space-x-1.5 text-xs sm:text-sm text-slate-400 hover:text-amber-300 transition pt-1"
            >
              <KeyRound className="w-4 h-4" />
              <span>Esqueci minha senha (recuperar por e-mail)</span>
            </button>
          </form>
        )}

        {/* =========================================================
            MODO 2: RECUPERAÇÃO DE SENHA EXCLUSIVAMENTE POR E-MAIL
           ========================================================= */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30 text-xs text-slate-300 leading-relaxed">
              🔒 <strong>Segurança por E-mail:</strong> Enviaremos um link exclusivo de recuperação para o seu e-mail.
              Somente quem tiver acesso à caixa de entrada poderá definir uma nova senha.
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Seu E-mail Cadastrado</span>
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
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span>{emailSent ? 'Reenviar Link para o Meu E-mail' : 'Enviar Link de Recuperação por E-mail'}</span>
            </button>

            {/* Auxiliar caso o link do e-mail tenha aberto localhost no celular */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => setShowPasteBox(!showPasteBox)}
                className="w-full text-left text-[11px] text-slate-400 hover:text-amber-300 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Recebeu o e-mail no celular? Cole o link recebido aqui</span>
                </span>
                <span>{showPasteBox ? '▲' : '▼'}</span>
              </button>

              {showPasteBox && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Se o botão do e-mail abrir uma página <code>localhost</code> no celular, segure o dedo sobre o botão{' '}
                    <strong>&ldquo;Reset Password&rdquo;</strong> no seu e-mail, copie o endereço do link e cole abaixo:
                  </p>
                  <input
                    type="text"
                    value={pastedRecoveryInput}
                    onChange={(e) => setPastedRecoveryInput(e.target.value)}
                    placeholder="Cole aqui o link copiado do seu e-mail..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailTokenOrLink}
                    disabled={isLoading || !pastedRecoveryInput.trim()}
                    className="w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition disabled:opacity-40"
                  >
                    Validar Link do E-mail e Criar Nova Senha
                  </button>
                </div>
              )}
            </div>

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
              <span>Voltar para o Login</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
