import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Volume2, VolumeX, Copy, Check, RotateCcw, Bot, User, Shield, Swords, Scroll, Compass, SpellCheck } from 'lucide-react';
import { QUICK_PROMPTS, MONOGRAFIA, PERGUNTAS_BANCA } from '@/lib/tccData';
import { getSupabaseClient } from '@/lib/supabaseClient';

export const MODES = [
  { id: 'Tutor Explicativo', label: '🎓 Modo Sábio', desc: 'Explica a fundo os conceitos e a linha de raciocínio da tese', icon: Compass },
  { id: 'Banca Examinadora', label: '⚔️ Modo Duelo', desc: 'Arguição crítica, cética e teste de contra-argumentos da banca', icon: Swords },
  { id: 'Redator ABNT', label: '📜 Modo Escriba', desc: 'Minutas acadêmicas rigorosas e citações ABNT NBR 10520', icon: Scroll },
  { id: 'Consultoria Prática', label: '🛡️ Modo Escudo', desc: 'Estratégias de defesa na SMFI e no TJPR', icon: Shield },
  { id: 'Revisor de Texto', label: '📝 Modo Revisor', desc: 'Corrige gramática, coesão e ABNT do seu artigo', icon: SpellCheck },
];

type ChatMsg = { id: string; sender: 'user' | 'assistant'; content: string; mode?: string; provider?: string };

const WELCOME_MESSAGE: ChatMsg = {
  id: 'welcome',
  sender: 'assistant',
  content: `⚡ **JURISMENTOR ONLINE // BASE DE DADOS DO TCC SINCRONIZADA**\n\nSaudações, futuro Bacharel! Eu sou o seu parceiro tático de estudos e consultor sênior para o seu TCC:\n\n*"${MONOGRAFIA.titulo}"*.\n\n### 🎯 Nossas Missões de Treino:\n1. **Dominar a Tese**: tirar dúvidas do art. 42 da LC 40/2001, CF/88 (art. 156 vs 182) e jurisprudência do TJPR.\n2. **Vencer a Banca**: treinar réplicas e tréplicas afiadas contra argumentos da Procuradoria Municipal.\n3. **Redação & Prática**: redigir parágrafos em norma ABNT e estruturar peças contra execuções fiscais.\n\nEscolha seu modo tático acima ou toque em uma pergunta rápida para começar!`,
  mode: 'Tutor Explicativo'
};

/** Quantas mensagens anteriores vão como contexto para a IA */
const CONTEXT_MESSAGES = 20;

/** Atalhos do Modo Revisor: preenchem o campo para o usuário colar o trecho em seguida */
const REVISOR_PROMPTS = [
  'Revise a gramática e a pontuação do trecho abaixo:\n\n',
  'Encontre trechos desconexos e melhore a coesão do texto abaixo:\n\n',
  'Padronize as citações e referências segundo a ABNT (NBR 10520 e 6023):\n\n',
  'Revise o resumo e as palavras-chave do artigo:\n\n',
  'Faça uma revisão completa (gramática, coesão, estilo e ABNT) do texto abaixo:\n\n',
];

interface ChatTabProps {
  userId: string;
}

export const ChatTab: React.FC<ChatTabProps> = ({ userId }) => {
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [activeMode, setActiveMode] = useState('Tutor Explicativo');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Histórico separado por usuário no navegador
  const storageKey = `JURIS_CHAT_HISTORY_${userId}`;

  useEffect(() => {
    // 1) Carrega rápido do navegador
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 2) Sincroniza com o Supabase (fonte oficial entre dispositivos)
    const client = getSupabaseClient();
    if (!client) return;
    client
      .from('chat_messages')
      .select('id, sender, content, mode, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(500)
      .then(({ data, error }) => {
        if (error) {
          console.warn('Supabase: não foi possível carregar o histórico:', error.message);
          return;
        }
        if (data && data.length > 0) {
          setMessages([
            WELCOME_MESSAGE,
            ...data.map((m: any) => ({ id: m.id, sender: m.sender, content: m.content, mode: m.mode || undefined })),
          ]);
        }
      });
  }, [storageKey, userId]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, storageKey]);

  const handleToggleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`>-]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = async () => {
    if (confirm('Deseja reiniciar a sessão de treino do chat? O histórico também será apagado do Supabase.')) {
      const reset = [WELCOME_MESSAGE];
      setMessages(reset);
      localStorage.setItem(storageKey, JSON.stringify(reset));

      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.from('chat_messages').delete().eq('user_id', userId);
        if (error) console.warn('Supabase: erro ao apagar histórico:', error.message);
      }
    }
  };

  const generateKnowledgeResponse = (userPrompt: string, mode: string): string => {
    const lower = userPrompt.toLowerCase();

    if (mode === 'Revisor de Texto') {
      return `📝 **Modo Revisor indisponível offline**\n\nA revisão de texto exige a IA online (OpenAI/Gemini). No momento nenhum provedor respondeu — verifique as chaves de API e tente novamente.`;
    }

    if (lower.includes('42') || lower.includes('5%') || lower.includes('vigésima') || lower.includes('vigesima')) {
      if (mode === 'Banca Examinadora') {
        return `⚔️ **[ARGUIÇÃO DO CHEFÃO DA BANCA]**:\n\nCandidato, o art. 42 da LC 40/2001 é cristalino ao dizer que imóvel com obra em andamento é territorial. O fiscal do município atua estritamente vinculado ao art. 142 do CTN. Como você ousa pedir o afastamento da lei sem suscitar a inconstitucionalidade do dispositivo perante o Órgão Especial do TJPR?\n\n💡 **Contra-Ataque Recomendado (Sua Réplica)**:\nResponda que **não há quebra de reserva de plenário (art. 97 da CF)**, mas sim **interpretação conforme a Constituição** e aplicação direta dos princípios da **Capacidade Contributiva (art. 145, § 1º)** e da **Vedação ao Confisco (art. 150, IV)**. O TJPR já pacificou (Rel. Des. Rogério Kanayama) que a verdade material afasta a ficção legal criada pela norma municipal.`;
      }
      return `📌 **O Artigo 42 da LC Municipal n.º 40/2001 (O Alvo Principal do seu TCC)**:\n\nEste é o ponto nevrálgico do seu trabalho. O art. 42 da LC 40/2001 institui uma ficção jurídica:\n> *"Considera-se não edificado o imóvel cujo valor venal da construção não alcance a vigésima parte (1/20 ou 5%) do valor venal do terreno, ou com obras em andamento, paralisadas ou temporárias."*\n\n**Os Dois Grandes Golpes Dogmáticos do seu TCC**:\n1. **Ficção Jurídica Absurda**: O Fisco equipara um terreno ativo com canteiro de obras e geração de empregos a um lote baldio abandonado para especulação imobiliária.\n2. **Distorção Brutal em Grandes Áreas (Galpões e Centros Logísticos)**: Em terrenos de alta valorização (PGV da LC 136/2022), alcançar 5% do valor do terreno na fase inicial da obra é inviável, transformando o tributo em penalidade confiscatória (art. 150, IV, CF).`;
    }

    if (lower.includes('156') || lower.includes('182') || lower.includes('diferença') || lower.includes('progressiv')) {
      return `🏛️ **Distinção Constitucional Vital (Capítulo I da Monografia)**:\n\nNão deixe a banca te confundir! Guarde com firmeza esta distinção:\n\n1. **Artigo 156, § 1º da CF/88 (após EC 29/2000)**:\n   * **Inciso I**: Progressividade *fiscal* em razão do valor venal do bem (capacidade contributiva presumida).\n   * **Inciso II**: Alíquotas diferenciadas em função da *localização e do uso* do imóvel (ex: residencial vs. não residencial).\n\n2. **Artigo 182, § 4º, II da CF/88 (Estatuto da Cidade)**:\n   * **IPTU progressivo no tempo**: é uma **sanção urbanística punitiva** para forçar o aproveitamento do solo urbano.\n   * **Exigências Rígidas**: Precisa de previsão no Plano Diretor, fixação de áreas e notificação formal do proprietário com concessão de prazo para edificar.\n\n⚠️ **Sua Tese Vencedora**: A Fazenda de Curitiba cobra alíquota territorial punitiva como se fosse sanção, mas ignora o devido processo legal do art. 182 da CF!`;
    }

    if (lower.includes('tjpr') || lower.includes('kanayama') || lower.includes('precedente') || lower.includes('jurisprudência') || lower.includes('acórdão')) {
      return `⚖️ **Jurisprudência Dominante do TJPR (Capítulo III)**:\n\nAs Câmaras Especializadas em Direito Tributário (1ª, 2ª e 3ª Câmaras Cíveis) consolidaram a vitória do contribuinte:\n\n* **Tese Consolidada**: A posse de **Alvará de Construção válido e o andamento real das obras** afastam de forma inequívoca a presunção de especulação imobiliária.\n* **Precedente Paradigmático**:\n  > *"APELAÇÃO CÍVEL. TRIBUTÁRIO. EMBARGOS À EXECUÇÃO FISCAL. IPTU. MUNICÍPIO DE CURITIBA. IMÓVEL EM CONSTRUÇÃO. ENQUADRAMENTO COMO TERRITORIAL. IMPOSSIBILIDADE DE APLICAÇÃO DE ALÍQUOTA MAIS GRAVOSA DESTINADA A COIBIR ESPECULAÇÃO IMOBILIÁRIA. EXISTÊNCIA DE ALVARÁ DE CONSTRUÇÃO VÁLIDO E EFETIVO ANDAMENTO DAS OBRAS. PRINCÍPIO DA RAZOABILIDADE E DA CAPACIDADE CONTRIBUTIVA. RECURSO PROVIDO."*\n  *(TJPR - 2ª C.Cível - 0004521-88.2021.8.16.0004 - Curitiba - Rel.: Des. Rogério Kanayama)*.\n\n* **O Papel do Habite-se**: O Certificado de Vistoria de Conclusão de Obras (CVCO) tem efeito meramente **declaratório**, e não constitutivo. A realidade fática da edificação (verdade material) sempre prevalece sobre a inércia da administração pública.`;
    }

    if (lower.includes('proposta') || lower.includes('lege ferenda') || lower.includes('soluç') || lower.includes('alteraç')) {
      return `💡 **As 3 Propostas de Lege Ferenda do seu TCC (Capítulo de Fechamento)**:\n\n1. **Alíquota Transitória de Fomento à Construção Civil**:\n   * Alteração na LC 40/2001 para reduzir automaticamente a alíquota territorial para o patamar predial não residencial durante o prazo regular do Alvará de Construção (condicionada à continuidade das obras).\n\n2. **Flexibilização e Desdobro Fiscal da Regra dos 5% (Art. 42)**:\n   * Permitir a tributação proporcional em glebas extensas (centros logísticos e indústrias), tributando como predial a fração afetada à atividade produtiva.\n\n3. **Eficácia Declaratória do Habite-se Parcial/Provisório**:\n   * Decreto municipal conferindo eficácia fazendária imediata ao laudo estrutural conclusivo com ART/RRT de engenharia, desonerando o proprietário dos atrasos de vistoria da Prefeitura.`;
    }

    if (mode === 'Redator ABNT') {
      return `📜 **[MINUTA EM PADRÃO ABNT - NBR 6022 & NBR 10520]**:\n\n> "A pretensão arrecadatória municipal de tributar terrenos com obras ativas sob alíquotas territoriais punitivas (art. 42 da LC n.º 40/2001) vulnera frontalmente o postulado da capacidade contributiva encartado no artigo 145, § 1.º, da Constituição da República de 1988. O canteiro de obras em pleno desenvolvimento e amparado por alvará construtivo válido atesta o cumprimento efetivo da função social da propriedade urbana (art. 182, CF), descaracterizando a retenção especulativa do solo e tornando imperativa a aplicação do regime predial ordinário." (SILVÉRIO, 2026).\n\n**Referências Convocadas (ABNT NBR 6023)**:\n* ALEXANDRE, Ricardo. **Direito Tributário**. 15. ed. Salvador: Juspodivm, 2021.\n* CURITIBA. **Lei Complementar n.º 40/2001**. Dispõe sobre os tributos municipais. Curitiba: CMC, 2001.\n* PARANÁ. Tribunal de Justiça. **Apelação Cível n.º 0004521-88.2021.8.16.0004**. Rel.: Des. Rogério Kanayama. Curitiba: TJPR, 2022.`;
    }

    if (mode === 'Consultoria Prática') {
      return `🛡️ **[ESTRATÉGIA PRÁTICA & PROCESSUAL - SMFI / TJPR]**:\n\n1. **Via Administrativa (SMFI Curitiba)**:\n   * **Peça**: Reclamação / Impugnação de Lançamento de IPTU (Prazo de 30 dias contados da notificação do carnet).\n   * **Provas Essenciais**: Cópia do Alvará de Construção em vigor; Anotação de Responsabilidade Técnica (ART/RRT) quitada; Laudo pericial com relatório fotográfico do canteiro de obras comprovando início contínuo das fundações/alvenarias.\n\n2. **Via Judicial (TJPR - Varas da Fazenda Pública)**:\n   * **Peça**: Ação Anulatória de Débito Fiscal c/c Repetição de Indébito ou Mandado de Segurança com Pedido de Tutela de Urgência (art. 300 do CPC).\n   * **Fumaça do Bom Direito**: Jurisprudência pacificada da 2ª Câmara Cível do TJPR (Precedente Des. Rogério Kanayama - Ap. Cív. 0004521-88.2021.8.16.0004).\n   * **Perigo da Demora**: Risco iminente de ajuizamento de Execução Fiscal com penhora de ativos via SISBAJUD.`;
    }

    if (mode === 'Banca Examinadora') {
      const q = PERGUNTAS_BANCA[Math.floor(Math.random() * PERGUNTAS_BANCA.length)];
      return `⚔️ **[SIMULAÇÃO DE BANCA - ${q.examinador_perfil}]**\n\n${q.pergunta}\n\n*Dificuldade: ${q.nivel_dificuldade}*\n\n👉 **Dica Tática**: Formule sua resposta com calma. Em seguida, acesse a aba **Banca** no menu inferior para ver o modelo ideal de sustentação oral e as armadilhas a evitar.`;
    }

    return `Entendido! Analisando seu questionamento sob a ótica do seu Artigo Científico (*"${MONOGRAFIA.titulo}"*):\n\nO pilar central da sua sustentação oral é a **vitória da Verdade Material sobre o Formalismo Burocrático da Secretaria de Finanças de Curitiba**.\n\nA Fazenda Municipal sustenta a letra fria do art. 42 da LC 40/2001 e exige o Habite-se (CVCO). Por outro lado, nossa pesquisa comprova que a jurisprudência das Câmaras Tributárias do TJPR (como o julgado do Des. Rogério Kanayama) anula essa cobrança territorial majorada quando comprovado o alvará ativo e o canteiro de obras em execução, protegendo a capacidade contributiva (art. 145, § 1º, CF) e a vedação ao confisco (art. 150, IV, CF).\n\nComo deseja aprofundar? Em **Minuta ABNT**, **Simulação de Pergunta da Banca** ou **Consultoria Prática Processual**?`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      sender: 'user',
      content: text.trim(),
      mode: activeMode,
    };

    // Contexto da conversa (sem a mensagem de boas-vindas)
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-CONTEXT_MESSAGES)
      .map((m) => ({ sender: m.sender, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      let botResponseText = '';
      let provider = '';
      const client = getSupabaseClient();

      try {
        const { data: sessionData } = (await client?.auth.getSession()) || { data: { session: null } };
        const token = sessionData.session?.access_token;

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message: text.trim(), mode: activeMode, history }),
        });
        const data = await res.json();
        if (res.ok && data?.reply) {
          botResponseText = data.reply;
          provider = data.provider || '';
        } else if (data?.errors?.length || data?.error) {
          console.warn('IA indisponível, usando motor local:', data.errors || data.error);
        }
      } catch (apiErr) {
        console.warn('Fallback para motor local:', apiErr);
      }

      if (!botResponseText) {
        await new Promise((r) => setTimeout(r, 500));
        botResponseText = generateKnowledgeResponse(text, activeMode);
        provider = 'Motor local (offline)';
      }

      const botMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: botResponseText,
        mode: activeMode,
        provider,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (client) {
        const { error: syncErr } = await client.from('chat_messages').insert([
          { user_id: userId, sender: 'user', content: text.trim(), mode: activeMode },
          { user_id: userId, sender: 'assistant', content: botResponseText, mode: activeMode },
        ]);
        if (syncErr) console.warn('Supabase sync notice:', syncErr.message);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto px-3 sm:px-4">
      {/* Gamer Mode Selector HUD */}
      <div className="py-2.5 overflow-x-auto no-scrollbar flex items-center space-x-2.5 border-b border-amber-500/20">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.03]'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-black border ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-700 text-white border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-yellow-300/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              </div>

              <div className={`max-w-[88%] sm:max-w-2xl rounded-2xl px-4 sm:px-5 py-3.5 text-sm sm:text-base leading-relaxed ${
                isUser
                  ? 'bg-gradient-to-r from-cyan-950/80 via-blue-900/80 to-slate-900 text-white border border-cyan-500/40 shadow-lg'
                  : 'bg-slate-900/90 text-slate-100 border border-amber-500/25 shadow-xl backdrop-blur-md'
              }`}>
                {msg.mode && !isUser && (
                  <div className="flex items-center space-x-1.5 text-xs font-black text-amber-400 mb-2 tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{msg.mode}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap space-y-2.5 text-slate-100 font-normal">
                  {msg.content}
                </div>

                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="text-amber-400/80 tracking-wide font-mono">
                      JURISMENTOR // {msg.provider ? msg.provider.toUpperCase() : 'TCC IPTU'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        className={`p-1.5 rounded-lg hover:bg-slate-800 transition ${
                          speakingId === msg.id ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400'
                        }`}
                        title="Ouvir resposta (áudio)"
                      >
                        {speakingId === msg.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition"
                        title="Copiar texto"
                      >
                        {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-slate-900/90 border border-amber-500/30 px-4 py-3 rounded-2xl text-sm text-amber-300 flex items-center space-x-2 shadow-lg">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              <span>{activeMode === 'Revisor de Texto' ? 'Revisor analisando gramática, coesão e ABNT...' : 'JurisMentor consultando acórdãos do TJPR e normas da LC 40...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Tactical Prompt Chips */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center space-x-2">
        {activeMode === 'Revisor de Texto'
          ? REVISOR_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInputValue(prompt)}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900/90 hover:bg-amber-500/15 border border-slate-700/80 hover:border-amber-400/60 text-slate-200 hover:text-amber-300 active:scale-95 transition"
              >
                {prompt.split(':')[0]}
              </button>
            ))
          : QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900/90 hover:bg-amber-500/15 border border-slate-700/80 hover:border-amber-400/60 text-slate-200 hover:text-amber-300 active:scale-95 transition"
              >
                {prompt}
              </button>
            ))}
      </div>

      {/* Input Bar */}
      <div className="pb-3 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <textarea
            value={inputValue}
            rows={activeMode === 'Revisor de Texto' ? 4 : 1}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              activeMode === 'Revisor de Texto'
                ? 'Cole aqui o trecho do artigo para revisar (Shift+Enter = nova linha)...'
                : `Pergunte algo ou treine um contra-argumento no ${activeMode}...`
            }
            className="w-full pl-4 pr-24 py-3.5 text-sm sm:text-base rounded-2xl bg-slate-900/95 border border-amber-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-[0_0_20px_rgba(0,0,0,0.6)] resize-none max-h-48"
          />

          <div className="absolute right-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Reiniciar chat"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black hover:brightness-110 active:scale-95 transition shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
