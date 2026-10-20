import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Volume2, VolumeX, Copy, Check, RotateCcw, Bot, User, Scale } from 'lucide-react';
import { QUICK_PROMPTS, MONOGRAFIA, PERGUNTAS_BANCA } from '@/lib/tccData';
import { getSupabaseClient } from '@/lib/supabaseClient';

export const MODES = [
  { id: 'Tutor Explicativo', label: 'Tutor Explicativo', desc: 'Ensina os conceitos e a linha de raciocínio da tese' },
  { id: 'Banca Examinadora', label: 'Banca Simulada', desc: 'Arguição crítica, cética e teste de contra-argumentos' },
  { id: 'Redator ABNT', label: 'Redator ABNT', desc: 'Minutas e citações acadêmicas rigorosas' },
  { id: 'Consultoria Prática', label: 'Prática & Processual', desc: 'Estratégias de defesa na SMFI e no TJPR' },
];

export const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'assistant'; content: string; mode?: string }>>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Olá! Sou o **JurisMentor IPTU Curitiba**, seu orientador e consultor sênior para o seu TCC:\n\n*"${MONOGRAFIA.titulo}"*.\n\nEstou à sua disposição no seu bolso para:\n1. **Te ensinar e tirar qualquer dúvida** sobre a tese, artigos da LC 40/2001, jurisprudência do TJPR ou STJ/STF.\n2. **Treinar sua sustentação oral** e contra-argumentar como um examinador rígido da banca.\n3. **Redigir trechos em padrão ABNT** ou orientar defesas práticas contra a Fazenda Municipal.\n\nEscolha um modo acima ou toque em uma pergunta rápida para começar!`,
      mode: 'Tutor Explicativo'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeMode, setActiveMode] = useState('Tutor Explicativo');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from local storage or Supabase on mount
  useEffect(() => {
    const saved = localStorage.getItem('JURIS_CHAT_HISTORY');
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
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('JURIS_CHAT_HISTORY', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice narration support via Web Speech API
  const handleToggleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner voice speech
    const cleanText = text.replace(/[*#_`>-]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;

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

  const handleClearHistory = () => {
    if (confirm('Deseja limpar o histórico do chat?')) {
      const reset = [messages[0]];
      setMessages(reset);
      localStorage.setItem('JURIS_CHAT_HISTORY', JSON.stringify(reset));
    }
  };

  // Local knowledge synthesis engine when no external API key is set
  const generateKnowledgeResponse = (userPrompt: string, mode: string): string => {
    const lower = userPrompt.toLowerCase();

    // Specific match 1: Artigo 42 da LC 40/2001
    if (lower.includes('42') || lower.includes('5%') || lower.includes('vigésima') || lower.includes('vigesima')) {
      if (mode === 'Banca Examinadora') {
        return `⚖️ **[ARGÜIÇÃO DA BANCA]**: Candidato, o art. 42 da LC 40/2001 é norma expressa do legislador curitibano. Se a obra em andamento é qualificada pela lei como 'não edificada', com que autoridade dogmática você pretende afastar a incidência da lei sem suscitar a inconstitucionalidade do dispositivo perante o Órgão Especial do TJPR?\n\n💡 **Dica de Réplica para a Banca**: Responda que não se trata necessariamente de declaração de inconstitucionalidade com quebra da cláusula de reserva de plenário (art. 97, CF), mas sim de **interpretação conforme a Constituição** e aplicação direta do princípio da verdade material e da capacidade contributiva (art. 145, § 1º, CF). Mostre que o próprio TJPR na Apelação Cível 0004521-88.2021.8.16.0004 já consolidou esse afastamento prático.`;
      }
      return `📌 **O Artigo 42 da LC Municipal n.º 40/2001 de Curitiba**:\n\nEste é o ponto nevrálgico do seu TCC. O artigo 42 estabelece:\n> *"São considerados imóveis não edificados: (...) cujo valor da construção não atinja a vigésima parte (1/20 ou 5%) do valor do terreno, ou com obras em andamento, paralisadas ou temporárias."*\n\n**As duas grandes falhas apontadas no seu trabalho**:\n1. **Ficção Jurídica Absurda**: equipara uma gleba com operários, fundações e capital investido a um lote baldio abandonado para fins especulativos.\n2. **Distorção em Grandes Terrenos (Galpões e Centros Logísticos)**: em áreas de alta valorização imobiliária, atingir 5% do valor venal total da gleba nas fases iniciais é desproporcional, gerando enriquecimento sem causa do Fisco e violação ao não confisco (art. 150, IV, CF).`;
    }

    // Specific match 2: Artigo 156 vs 182 da CF
    if (lower.includes('156') || lower.includes('182') || lower.includes('diferença') || lower.includes('progressiv')) {
      return `🏛️ **Distinção Constitucional Crucial (Capítulo I)**:\n\nVocê **nunca** deve deixar a banca confundir esses dois dispositivos:\n\n1. **Artigo 156, § 1º da CF/88 (após EC 29/2000)**:\n   * **Inciso I**: Progressividade *fiscal* em razão do valor venal do imóvel (graduação pela capacidade contributiva).\n   * **Inciso II**: Alíquotas diferenciadas em função da *localização e do uso* do imóvel (ex: residencial vs. não residencial).\n\n2. **Artigo 182, § 4º, II da CF/88 (Estatuto da Cidade)**:\n   * **IPTU progressivo no tempo**: é uma **sanção urbanística** para coagir o proprietário do solo urbano não edificado, subutilizado ou não utilizado.\n   * **Requisitos obrigatórios**: precisa estar expressamente previsto no Plano Diretor, fixar coeficientes de aproveitamento e notificar formalmente o proprietário concedendo prazo para edificar.\n\n⚠️ **Sua Tese**: A Fazenda de Curitiba cobra alíquota de terreno gravosa como se fosse sanção, mas sem respeitar o rito e as garantias do art. 182 da CF!`;
    }

    // Specific match 3: TJPR e Precedente Kanayama
    if (lower.includes('tjpr') || lower.includes('kanayama') || lower.includes('precedente') || lower.includes('jurisprudência') || lower.includes('acórdão')) {
      return `⚖️ **A Jurisprudência Dominante do TJPR (Capítulo III)**:\n\nAs Câmaras Especializadas em Direito Tributário (1ª, 2ª e 3ª Câmaras Cíveis) consolidaram o seguinte entendimento:\n\n* **Tese Central**: A existência de **Alvará de Construção válido e em vigência**, aliada ao efetivo andamento das obras, **afasta de plano a presunção de especulação imobiliária**.\n* **Precedente Paradigmático**:\n  > *"APELAÇÃO CÍVEL. TRIBUTÁRIO. EMBARGOS À EXECUÇÃO FISCAL. IPTU. MUNICÍPIO DE CURITIBA. IMÓVEL EM CONSTRUÇÃO. ENQUADRAMENTO COMO TERRITORIAL. IMPOSSIBILIDADE DE APLICAÇÃO DE ALÍQUOTA MAIS GRAVOSA DESTINADA A COIBIR ESPECULAÇÃO IMOBILIÁRIA. EXISTÊNCIA DE ALVARÁ DE CONSTRUÇÃO VÁLIDO E EFETIVO ANDAMENTO DAS OBRAS. PRINCÍPIO DA RAZOABILIDADE E DA CAPACIDADE CONTRIBUTIVA. RECURSO PROVIDO."*\n  *(TJPR - 2ª C.Cível - 0004521-88.2021.8.16.0004 - Curitiba - Rel.: Des. Rogério Kanayama)*.\n\n* **Natureza do Habite-se**: O Certificado de Conclusão (CVCO) tem efeito meramente **declaratório**, e não constitutivo. A realidade fática da ocupação e da construção (verdade material) prevalece sobre a inércia fazendária.`;
    }

    // Specific match 4: 3 Propostas de Lege Ferenda
    if (lower.includes('proposta') || lower.includes('lege ferenda') || lower.includes('soluç') || lower.includes('alteraç')) {
      return `💡 **As 3 Propostas de Lege Ferenda do seu TCC**:\n\n1. **Alíquota Transitória de Fomento à Construção**:\n   * Inserção de dispositivo na LC 40/2001 prevendo a redução automática da alíquota territorial para o patamar predial não residencial durante o prazo regular do Alvará de Construção (condicionada à continuidade das obras).\n\n2. **Flexibilização e Desdobro Fiscal da 20ª Parte (Art. 42)**:\n   * Permitir a tributação mista ou proporcional em glebas de grande extensão (centros logísticos e galpões industriais), tributando como predial a fração afetada à atividade produtiva.\n\n3. **Eficácia Declaratória do Habite-se Parcial/Provisório**:\n   * Decreto Municipal conferindo eficácia tributária imediata ao laudo estrutural conclusivo acompanhado de ART/RRT de engenharia, desonerando o contribuinte da morosidade de vistorias da Prefeitura.`;
    }

    // Default intelligent tutor response
    if (mode === 'Banca Examinadora') {
      const q = PERGUNTAS_BANCA[Math.floor(Math.random() * PERGUNTAS_BANCA.length)];
      return `⚖️ **[SIMULAÇÃO DE BANCA - ${q.examinador_perfil}]**\n\n${q.pergunta}\n\n*Dificuldade: ${q.nivel_dificuldade}*\n\n👉 **Dica do JurisMentor**: Formule sua resposta com calma. Em seguida, toque em 'Banca' no menu inferior para ver o modelo perfeito de sustentação oral para este tema.`;
    }

    return `Entendido! Analisando seu questionamento sob a ótica do seu TCC (*"${MONOGRAFIA.titulo}"*):\n\nO ponto central a ter em mente para sua apresentação e fundamentação é a **colisão entre a Verdade Material e o Formalismo Cadastral da SMFI de Curitiba**.\n\nA Fazenda Municipal sustenta a legalidade estrita do art. 42 da LC 40/2001 e a exigência do Habite-se (CVCO). Por outro lado, nossa pesquisa comprova que a jurisprudência das Câmaras Tributárias do TJPR (como o julgado do Des. Rogério Kanayama) rechaça essa cobrança territorial majorada quando comprovado o alvará ativo e o avanço construtivo, salvaguardando a capacidade contributiva (art. 145, § 1º, CF) e a vedação ao confisco (art. 150, IV, CF).\n\nQuer que eu aprofunde esse tópico em formato de **Minuta ABNT**, **Simulação de Pergunta da Banca** ou **Roteiro para seus Slides**?`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user' as const,
      content: text.trim(),
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      let botResponseText = '';

      // Check if user set Gemini/external API key in localStorage
      const customGeminiKey = typeof window !== 'undefined' ? localStorage.getItem('JURIS_GEMINI_KEY') : null;

      if (customGeminiKey && customGeminiKey.trim()) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${customGeminiKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `Você é o JurisMentor IPTU Curitiba, consultor sênior de TCC em Direito Tributário Municipal e membro de banca examinadora.
Contexto: TCC sobre "A Tributação dos Imóveis Não Edificados no IPTU de Curitiba: critérios de enquadramento, obras em andamento e função social da propriedade".
Bases: LC 40/2001 (art. 42), LC 136/2022, CF/88 (art. 145 §1, 150 IV, 156 §1, 182 §4), CTN 32-34, precedentes do TJPR (1ª, 2ª e 3ª Câmaras, Rel. Des. Rogério Kanayama).
Modo ativo: ${activeMode}.
Pergunta do usuário: "${text.trim()}".
Responda em tom técnico, seguro, acadêmico e prático em português.`
                    }
                  ]
                }
              ]
            })
          });
          const data = await res.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            botResponseText = data.candidates[0].content.parts[0].text;
          }
        } catch (apiErr) {
          console.warn('Fallback para motor local devido a erro na API:', apiErr);
        }
      }

      if (!botResponseText) {
        // High quality local response generated from the TCC corpus
        await new Promise((r) => setTimeout(r, 600)); // subtle realistic think delay
        botResponseText = generateKnowledgeResponse(text, activeMode);
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant' as const,
        content: botResponseText,
        mode: activeMode,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Sync to Supabase if connected
      const customUrl = localStorage.getItem('JURIS_SUPABASE_URL') || undefined;
      const customKey = localStorage.getItem('JURIS_SUPABASE_KEY') || undefined;
      const client = getSupabaseClient(customUrl, customKey);
      if (client) {
        (async () => {
          try {
            await client.from('chat_messages').insert([
              { sender: 'user', content: text, mode: activeMode },
              { sender: 'assistant', content: botResponseText, mode: activeMode }
            ]);
          } catch (syncErr) {
            console.warn('Supabase sync background notice:', syncErr);
          }
        })();
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-4xl mx-auto px-2 sm:px-4">
      {/* Mode Selector Chips */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center space-x-2 border-b border-slate-800/80">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeMode === mode.id
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 scale-[1.02]'
                : 'glass-card text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                    : 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-xl group relative rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                isUser
                  ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md'
                  : 'glass-panel text-slate-200 border border-slate-700/60'
              }`}>
                {msg.mode && !isUser && (
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 mb-1.5 tracking-wider uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>{msg.mode}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap space-y-2">
                  {msg.content}
                </div>

                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                    <span>JurisMentor</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        className={`p-1 rounded-lg hover:bg-slate-700/60 transition ${
                          speakingId === msg.id ? 'text-amber-400' : 'text-slate-400'
                        }`}
                        title="Ouvir resposta (áudio)"
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded-lg hover:bg-slate-700/60 text-slate-400 transition"
                        title="Copiar texto"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="glass-panel px-4 py-2.5 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              <span>Consultando acórdãos do TJPR e normas da LC 40/2001...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center space-x-2">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-amber-300 active:scale-95 transition"
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
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Pergunte algo ou treine um contra-argumento no modo ${activeMode}...`}
            className="w-full pl-4 pr-24 py-3 text-xs sm:text-sm rounded-2xl glass-panel text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 shadow-xl"
          />

          <div className="absolute right-2 flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Limpar histórico"
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold hover:from-amber-300 hover:to-yellow-300 active:scale-95 transition shadow-lg shadow-amber-400/20 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
