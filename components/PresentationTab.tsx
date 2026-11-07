'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Timer,
  Presentation,
  Monitor,
  Headphones,
  Send,
  Zap,
  ShieldAlert,
  BookOpen,
  Image as ImageIcon,
  Loader2,
  Radio,
} from 'lucide-react';
import { SLIDES, PresentationSlide } from '@/lib/tccData';
import { broadcastSlideChange, subscribeToSlideChanges } from '@/lib/liveSlideSync';

interface PresentationTabProps {
  onOpenPresentationGenerator?: () => void;
}

interface BancaLiveAnswer {
  abertura_imediata: string;
  sussurro_fone: string;
  topicos_resposta: string[];
  fundamentos: string[];
  armadilha: string;
  provider?: string;
  audioBase64?: string | null;
}

const QUICK_BANCA_QUESTIONS = [
  'O fiscal não está apenas cumprindo a legalidade estrita do art. 42 da LC 40/2001 (art. 142 do CTN)?',
  'E se o proprietário pedir o alvará de construção só para simular e pagar menos IPTU sem construir?',
  'Qual a diferença entre a alíquota diferenciada do art. 156 e o IPTU progressivo no tempo do art. 182 da CF?',
  'Afastar o art. 42 da LC 40/2001 não viola a cláusula de reserva de plenário (art. 97 da CF / Súmula Vinculante 10)?',
  'Como o Tema 1.455 do STF (Min. Dias Toffoli) impacta a regra dos 5% de Curitiba?',
];

export const PresentationTab: React.FC<PresentationTabProps> = ({ onOpenPresentationGenerator }) => {
  // Modo ativo dentro da Central de Defesa: 'slides' (Apresentação Guiada) ou 'argicao' (Ponto Eletrônico GPT)
  const [copilotSection, setCopilotSection] = useState<'slides' | 'arguicao'>('slides');

  // Estado dos Slides e Cronômetro
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [scriptStyle, setScriptStyle] = useState<'simples' | 'formal'>('simples');
  const [seconds, setSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Estado do Copiloto de Voz da Apresentação
  const [isListeningSlide, setIsListeningSlide] = useState(false);
  const [autoAdvanceSlide, setAutoAdvanceSlide] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [spokenRadar, setSpokenRadar] = useState<{ [slideIdx: number]: { [radarIdx: number]: boolean } }>({});
  const [autoAdvanceNotice, setAutoAdvanceNotice] = useState<string | null>(null);

  // Imagens personalizadas geradas via Nano Banana / IA
  const [customImages, setCustomImages] = useState<{ [idx: number]: string }>({});
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  // Estado do Ponto Eletrônico da Banca (GPT em Tempo Real + Fone Opcional)
  const [bancaQuestion, setBancaQuestion] = useState('');
  const [isListeningBanca, setIsListeningBanca] = useState(false);
  const [earpieceVoiceEnabled, setEarpieceVoiceEnabled] = useState(false);
  const [isAskingBancaAi, setIsAskingBancaAi] = useState(false);
  const [bancaAnswer, setBancaAnswer] = useState<BancaLiveAnswer | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const slideRecognitionRef = useRef<any>(null);
  const bancaRecognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const lastAdvanceTimeRef = useRef<number>(0);

  const currentSlide: PresentationSlide = SLIDES[currentSlideIndex] || SLIDES[0];
  const progressPercent = Math.min(100, (seconds / 720) * 100); // Meta ideal: 12 min (720s)

  // Muda o slide localmente e transmite para o Telão (/telao)
  const changeSlide = useCallback(
    (newIndex: number) => {
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, newIndex));
      setCurrentSlideIndex(clamped);
      broadcastSlideChange(clamped, customImages[clamped]);
    },
    [customImages]
  );

  // Recebe mudanças caso o usuário mude lá no Telão
  useEffect(() => {
    const unsubscribe = subscribeToSlideChanges((state) => {
      if (state.slideIndex >= 0 && state.slideIndex < SLIDES.length) {
        setCurrentSlideIndex(state.slideIndex);
      }
    });
    return unsubscribe;
  }, []);

  // Cronômetro
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Analisa o texto falado pelo Arlei para marcar o Checklist e avançar o slide
  const processSlideSpeech = useCallback(
    (transcriptText: string) => {
      const norm = transcriptText.toLowerCase();
      const slide = SLIDES[currentSlideIndex];
      if (!slide) return;

      // 1) Verifica os itens do Radar de Voz deste slide
      if (slide.radar_voz && slide.radar_voz.length > 0) {
        setSpokenRadar((prev) => {
          const currentMap = { ...(prev[currentSlideIndex] || {}) };
          let changed = false;
          slide.radar_voz!.forEach((item, rIdx) => {
            if (!currentMap[rIdx]) {
              const hit = item.termos.some((t) => norm.includes(t.toLowerCase()));
              if (hit) {
                currentMap[rIdx] = true;
                changed = true;
              }
            }
          });
          return changed ? { ...prev, [currentSlideIndex]: currentMap } : prev;
        });
      }

      // 2) Verifica gatilhos de avanço automático de slide
      if (autoAdvanceSlide && currentSlideIndex < SLIDES.length - 1) {
        const now = Date.now();
        if (now - lastAdvanceTimeRef.current < 6000) return; // Evita pular 2 slides seguidos

        const triggers = slide.gatilhos_avanco || ['próximo slide'];
        const matchedTrigger = triggers.find((g) => norm.includes(g.toLowerCase()));
        if (matchedTrigger) {
          lastAdvanceTimeRef.current = now;
          setAutoAdvanceNotice(`Gatilho detectado ("${matchedTrigger}") → Avançando para o Slide ${currentSlideIndex + 2}...`);
          setTimeout(() => {
            changeSlide(currentSlideIndex + 1);
            setLiveTranscript('');
            setAutoAdvanceNotice(null);
          }, 1400);
        }
      }
    },
    [autoAdvanceSlide, changeSlide, currentSlideIndex]
  );

  // Mantém a referência atualizada da função de processamento de fala
  const processSpeechRef = useRef(processSlideSpeech);
  useEffect(() => {
    processSpeechRef.current = processSlideSpeech;
  }, [processSlideSpeech]);

  // Liga/Desliga o Microfone do Copiloto de Slides
  const toggleSlideListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz nativo. Recomendamos usar o Google Chrome ou Edge.');
      return;
    }

    if (isListeningSlide) {
      slideRecognitionRef.current?.stop();
      setIsListeningSlide(false);
      return;
    }

    // Para o microfone da banca se estiver ativo
    if (isListeningBanca) {
      bancaRecognitionRef.current?.stop();
      setIsListeningBanca(false);
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let combined = '';
      for (let i = Math.max(0, event.results.length - 3); i < event.results.length; i++) {
        combined += event.results[i][0].transcript + ' ';
      }
      const cleaned = combined.trim();
      setLiveTranscript(cleaned);
      processSpeechRef.current(cleaned);
    };

    recognition.onerror = () => {
      setIsListeningSlide(false);
    };

    recognition.onend = () => {
      setIsListeningSlide(false);
    };

    slideRecognitionRef.current = recognition;
    recognition.start();
    setIsListeningSlide(true);
    if (!isTimerActive) setIsTimerActive(true);
  };

  // Liga/Desliga o Microfone para ouvir a Pergunta do Professor da Banca
  const toggleBancaListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz nativo. Use o Google Chrome ou digite a pergunta.');
      return;
    }

    if (isListeningBanca) {
      bancaRecognitionRef.current?.stop();
      setIsListeningBanca(false);
      return;
    }

    if (isListeningSlide) {
      slideRecognitionRef.current?.stop();
      setIsListeningSlide(false);
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let fullText = '';
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript + ' ';
      }
      setBancaQuestion(fullText.trim());
    };

    recognition.onerror = () => {
      setIsListeningBanca(false);
    };

    recognition.onend = () => {
      setIsListeningBanca(false);
    };

    bancaRecognitionRef.current = recognition;
    recognition.start();
    setIsListeningBanca(true);
  };

  // Toca o áudio de resposta no fone de ouvido (MP3 da OpenAI ou Voz do Navegador)
  const playEarpieceAudio = (answer: BancaLiveAnswer) => {
    stopEarpieceAudio();

    if (answer.audioBase64) {
      try {
        const audio = new Audio(`data:audio/mp3;base64,${answer.audioBase64}`);
        audioPlayerRef.current = audio;
        setIsPlayingAudio(true);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        audio.play().catch(() => setIsPlayingAudio(false));
        return;
      } catch {
        // fallback para speechSynthesis
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(answer.sussurro_fone);
      utter.lang = 'pt-BR';
      utter.rate = 1.08;
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utter);
    }
  };

  const stopEarpieceAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Consulta o GPT em Tempo Real para responder à pergunta da banca
  const handleAskBancaAi = async (customQuestion?: string) => {
    const q = (customQuestion ?? bancaQuestion).trim();
    if (!q || isAskingBancaAi) return;

    if (customQuestion) setBancaQuestion(customQuestion);
    if (isListeningBanca) {
      bancaRecognitionRef.current?.stop();
      setIsListeningBanca(false);
    }

    stopEarpieceAudio();
    setIsAskingBancaAi(true);

    try {
      const res = await fetch('/api/banca-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          generateAudio: earpieceVoiceEnabled,
        }),
      });
      const data = await res.json();
      if (res.ok && data) {
        setBancaAnswer(data);
        if (earpieceVoiceEnabled) {
          playEarpieceAudio(data);
        }
      }
    } catch (err) {
      console.error('Erro ao consultar Ponto Eletrônico:', err);
    } finally {
      setIsAskingBancaAi(false);
    }
  };

  // Gera nova ilustração para o slide atual via API Nano Banana / DALL-E 3
  const handleRegenerateSlideImage = async () => {
    if (isGeneratingImg) return;
    setIsGeneratingImg(true);
    try {
      const res = await fetch('/api/slides/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideTitle: currentSlide.titulo,
          slideSubtitle: currentSlide.subtitulo_telao,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.imageUrl) {
        setCustomImages((prev) => ({ ...prev, [currentSlideIndex]: data.imageUrl }));
        broadcastSlideChange(currentSlideIndex, data.imageUrl);
      } else {
        alert(data?.error || 'Não foi possível gerar nova imagem no momento.');
      }
    } catch {
      alert('Erro ao conectar com o gerador de imagens.');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const openProjectorWindow = () => {
    broadcastSlideChange(currentSlideIndex, customImages[currentSlideIndex]);
    window.open('/telao', '_blank', 'noopener,noreferrer');
  };

  const activeScript =
    scriptStyle === 'simples' && currentSlide.fala_simples
      ? currentSlide.fala_simples
      : currentSlide.fala_sugerida;

  const currentSlideImage =
    customImages[currentSlideIndex] || currentSlide.imagem_url || '/slides/slide-1.png';

  const radarItems = currentSlide.radar_voz || [];
  const currentRadarHits = spokenRadar[currentSlideIndex] || {};

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-4">
      {/* Top Action Bar: Telão 16:9 + Gerador PPTX + Cronômetro */}
      <div className="bg-slate-900/95 rounded-2xl p-4 border border-amber-500/35 shadow-[0_0_25px_rgba(0,0,0,0.6)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Botões de Projeção e Exportação */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openProjectorWindow}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-95 transition flex items-center space-x-2"
            >
              <Monitor className="w-4 h-4" />
              <span>Abrir Telão (Projetor 16:9)</span>
            </button>

            {onOpenPresentationGenerator && (
              <button
                onClick={onOpenPresentationGenerator}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs sm:text-sm transition flex items-center space-x-1.5"
              >
                <Presentation className="w-4 h-4" />
                <span>Baixar .PPTX</span>
              </button>
            )}
          </div>

          {/* Cronômetro Compacto */}
          <div className="flex items-center space-x-2">
            <div
              className={`px-3.5 py-1.5 rounded-xl font-mono text-lg sm:text-xl font-black tracking-wider border ${
                seconds > 720
                  ? 'bg-rose-950/40 text-rose-400 border-rose-500/50 animate-pulse'
                  : 'bg-slate-950 text-amber-400 border-amber-500/40'
              }`}
              title="Meta ideal: 10 a 12 minutos"
            >
              <Timer className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              {formatTime(seconds)}
            </div>
            <button
              onClick={() => setIsTimerActive(!isTimerActive)}
              className={`p-2 rounded-xl font-black transition ${
                isTimerActive
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500 text-slate-950 hover:brightness-110'
              }`}
              title={isTimerActive ? 'Pausar Cronômetro' : 'Iniciar Cronômetro'}
            >
              {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setIsTimerActive(false);
                setSeconds(0);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Zerar Cronômetro"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Progresso do Tempo */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 ${
              seconds > 720 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Seletor de Modo do Copiloto: 1) Apresentação Guiada vs 2) Ponto Eletrônico da Banca (GPT) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setCopilotSection('slides')}
          className={`p-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 border transition-all ${
            copilotSection === 'slides'
              ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/15 text-amber-300 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4 text-amber-400 shrink-0" />
          <span>1. Copiloto de Slides (Sua Fala)</span>
        </button>

        <button
          onClick={() => setCopilotSection('arguicao')}
          className={`p-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 border transition-all ${
            copilotSection === 'arguicao'
              ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/15 text-cyan-300 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Headphones className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>2. Responder Professor (IA + Fone)</span>
        </button>
      </div>

      {/* =====================================================================
          SEÇÃO 1: COPILOTO DE SLIDES & TELEPROMPTER GUIADO POR VOZ
         ===================================================================== */}
      {copilotSection === 'slides' && (
        <div className="space-y-4">
          {/* Painel de Escuta Ativa por Voz (Hands-Free) */}
          <div className="bg-slate-900/95 rounded-2xl p-4 border border-emerald-500/30 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleSlideListening}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-2 transition active:scale-95 shadow-lg ${
                    isListeningSlide
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                      : 'bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 shadow-emerald-500/30'
                  }`}
                >
                  {isListeningSlide ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>
                    {isListeningSlide ? 'Ouvindo Você... (Toque p/ Pausar)' : 'Ativar Ajudante por Voz (Microfone)'}
                  </span>
                </button>

                <label className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAdvanceSlide}
                    onChange={(e) => setAutoAdvanceSlide(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <span>Mudar slide sozinho ao concluir fala</span>
                </label>
              </div>

              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Sincronizado com /telao
              </span>
            </div>

            {isListeningSlide && (
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs sm:text-sm text-emerald-300 font-medium">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block mb-0.5">
                  🎙️ Captando sua voz ao vivo:
                </span>
                {liveTranscript || 'Pode começar a falar o roteiro abaixo...'}
              </div>
            )}

            {autoAdvanceNotice && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 text-xs sm:text-sm font-black flex items-center space-x-2 animate-bounce">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{autoAdvanceNotice}</span>
              </div>
            )}
          </div>

          {/* Controles Gigantes de Navegação de Slide */}
          <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <button
              onClick={() => changeSlide(currentSlideIndex - 1)}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black text-xs sm:text-sm flex items-center space-x-1.5 border border-slate-700"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Anterior</span>
            </button>

            <div className="text-center">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
                Slide {currentSlideIndex + 1} de {SLIDES.length}
              </span>
              <span className="text-sm sm:text-base font-black text-white">{currentSlide.titulo}</span>
            </div>

            <button
              onClick={() => changeSlide(currentSlideIndex + 1)}
              disabled={currentSlideIndex === SLIDES.length - 1}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 disabled:opacity-30 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-1.5 shadow-md"
            >
              <span>Próximo Slide</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Card Principal do Slide + Teleprompter + Preview Visual */}
          <div className="bg-slate-900/95 rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl space-y-5">
            {/* Preview Miniatura do Slide do Telão + Botão Nano Banana */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
              <div className="md:col-span-5 relative aspect-video rounded-xl overflow-hidden border border-amber-500/30 bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSlideImage}
                  alt={currentSlide.titulo}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRegenerateSlideImage}
                  disabled={isGeneratingImg}
                  className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center space-x-1 shadow-lg"
                  title="Gerar nova ilustração com IA (Nano Banana / DALL-E)"
                >
                  {isGeneratingImg ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  <span>{isGeneratingImg ? 'Gerando...' : 'Nova Arte IA'}</span>
                </button>
              </div>

              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                    🖥️ O que a Banca está vendo no Telão:
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {currentSlide.tempo_sugerido}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-amber-200 bg-amber-500/10 border-l-2 border-amber-400 pl-3 py-1.5 rounded-r-lg">
                  {currentSlide.destaque_telao || currentSlide.objetivo}
                </p>
                <ul className="space-y-1 text-xs text-slate-300">
                  {(currentSlide.topicos_telao || currentSlide.pontos_chave).map((t, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Checklist Vivo de Argumentos Falados (Radar de Voz) */}
            {radarItems.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>✅ Checklist Vivo deste Slide (Acende em verde conforme você fala):</span>
                  <span className="text-emerald-400 font-mono">
                    {Object.values(currentRadarHits).filter(Boolean).length} / {radarItems.length} falados
                  </span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {radarItems.map((item, idx) => {
                    const isDone = !!currentRadarHits[idx];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setSpokenRadar((prev) => ({
                            ...prev,
                            [currentSlideIndex]: {
                              ...(prev[currentSlideIndex] || {}),
                              [idx]: !isDone,
                            },
                          }))
                        }
                        className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-bold flex items-center space-x-2 transition ${
                          isDone
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <CheckCircle
                          className={`w-4 h-4 shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-600'}`}
                        />
                        <span>{item.rotulo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Teleprompter (Roteiro de Fala em Letras Grandes) */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                  <Volume2 className="w-5 h-5" />
                  <span>Seu Teleprompter (O que falar neste slide):</span>
                </span>

                <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setScriptStyle('simples')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      scriptStyle === 'simples'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Fala Natural (Simples)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptStyle('formal')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      scriptStyle === 'formal'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Fala Formal
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border-2 border-emerald-500/35 text-lg sm:text-xl text-slate-100 leading-relaxed font-medium shadow-inner">
                &ldquo;{activeScript}&rdquo;
              </div>

              {currentSlide.gatilhos_avanco && currentSlide.gatilhos_avanco.length > 0 && (
                <p className="text-xs text-slate-400">
                  🎯 <strong>Palavras-gatilho que avançam para o próximo slide:</strong>{' '}
                  <span className="text-amber-300 font-mono">
                    {currentSlide.gatilhos_avanco.slice(0, 3).join(' • ')}
                  </span>
                </p>
              )}
            </div>

            {/* O que evitar */}
            <div className="p-3.5 rounded-xl bg-rose-950/25 border border-rose-500/30 flex items-start space-x-2.5 text-xs sm:text-sm text-rose-200">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-400 font-black">Cuidado neste slide:</strong> {currentSlide.evitar}
              </div>
            </div>
          </div>

          {/* Grade Rápida de Todos os Slides */}
          <div className="grid grid-cols-7 gap-2">
            {SLIDES.map((s, idx) => (
              <button
                key={s.slide}
                onClick={() => changeSlide(idx)}
                className={`py-2.5 px-1 rounded-xl text-xs font-black transition-all text-center ${
                  currentSlideIndex === idx
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                SLIDE {s.slide}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 2: PONTO ELETRÔNICO DA BANCA (GPT AO VIVO + VOZ OPCIONAL NO FONE)
         ===================================================================== */}
      {copilotSection === 'arguicao' && (
        <div className="space-y-4">
          <div className="bg-slate-900/95 rounded-2xl p-5 border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                  <Headphones className="w-5 h-5 text-cyan-400" />
                  <span>Ponto Eletrônico de Banca // IA GPT Ao Vivo</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Capte a pergunta do professor pelo microfone ou texto e receba a resposta blindada na tela e no fone.
                </p>
              </div>

              {/* Chave Opcional: Voz no Fone ON/OFF */}
              <button
                type="button"
                onClick={() => {
                  const next = !earpieceVoiceEnabled;
                  setEarpieceVoiceEnabled(next);
                  if (!next) stopEarpieceAudio();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-2 border transition ${
                  earpieceVoiceEnabled
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {earpieceVoiceEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span>Voz no Fone: {earpieceVoiceEnabled ? 'ATIVADA (Opcional)' : 'DESATIVADA (Só Texto)'}</span>
              </button>
            </div>

            {/* Botão de Captar Pergunta do Professor por Voz + Campo de Texto */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleBancaListening}
                  className={`px-4 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-2 transition active:scale-95 shadow-lg ${
                    isListeningBanca
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                  }`}
                >
                  {isListeningBanca ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>
                    {isListeningBanca
                      ? 'Escutando Pergunta do Professor... (Toque p/ Parar)'
                      : '🎙️ Escutar Pergunta do Professor'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAskBancaAi()}
                  disabled={!bancaQuestion.trim() || isAskingBancaAi}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg hover:brightness-110 disabled:opacity-40"
                >
                  {isAskingBancaAi ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>{isAskingBancaAi ? 'GPT Elaborando Resposta...' : '⚡ Gerar Resposta Agora'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={bancaQuestion}
                  onChange={(e) => setBancaQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskBancaAi();
                    }
                  }}
                  placeholder="A pergunta do professor aparecerá aqui enquanto ele fala (ou digite palavras-chave como: 'alvará simulado', 'art 156 vs 182', 'reserva de plenário')..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Atalhos Rápidos de 1 Toque para Perguntas Clássicas */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  ⚡ Perguntas Clássicas da Banca (Toque para resposta imediata):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_BANCA_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAskBancaAi(q)}
                      className="text-left px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-200 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card de Resposta Ao Vivo do GPT */}
          {bancaAnswer && (
            <div className="bg-slate-900/95 rounded-2xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Resposta Pronta // {bancaAnswer.provider || 'GPT Ao Vivo'}</span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    isPlayingAudio ? stopEarpieceAudio() : playEarpieceAudio(bancaAnswer)
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white'
                      : 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 hover:bg-cyan-500/30'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                  <span>{isPlayingAudio ? 'Parar Áudio do Fone' : '🎧 Ouvir Resumo no Fone'}</span>
                </button>
              </div>

              {/* 1. Frase de Abertura Imediata */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                  🗣️ Comece falando exatamente isto:
                </span>
                <p className="text-lg sm:text-xl font-black text-white leading-relaxed">
                  &ldquo;{bancaAnswer.abertura_imediata}&rdquo;
                </p>
              </div>

              {/* 2. Resumo do Ponto Eletrônico */}
              <div className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-500/30 space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Headphones className="w-4 h-4" />
                  <span>Resumo Rápido (Sussurro do Ponto Eletrônico):</span>
                </span>
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
                  {bancaAnswer.sussurro_fone}
                </p>
              </div>

              {/* 3. Os 3 Pilares da Resposta */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                  ⚖️ Argumentos Técnicos para Desenvolver:
                </span>
                <div className="space-y-2">
                  {(bancaAnswer.topicos_resposta || []).map((t, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm sm:text-base text-slate-100 leading-relaxed flex items-start space-x-2.5"
                    >
                      <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Dispositivos e Precedentes */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Cite Estes Artigos / Julgados:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {(bancaAnswer.fundamentos || []).map((f, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-950 border border-cyan-500/40 text-cyan-200"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. Armadilha a Evitar */}
              {bancaAnswer.armadilha && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs sm:text-sm text-rose-200 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-400 font-black">Armadilha a evitar:</strong>{' '}
                    {bancaAnswer.armadilha}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
