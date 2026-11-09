'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Radio,
  Users,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { getPublicAudienceUrl } from '@/lib/liveSlideSync';

interface LiveShareQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewerCount?: number;
  isRealtimeConnected?: boolean;
}

export const LiveShareQrModal: React.FC<LiveShareQrModalProps> = ({
  isOpen,
  onClose,
  viewerCount = 1,
  isRealtimeConnected = false,
}) => {
  const [audienceUrl, setAudienceUrl] = useState('https://jurismentor-tcc-iptu.vercel.app/telao?plateia=1');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAudienceUrl(getPublicAudienceUrl());
  }, [isOpen]);

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(
    audienceUrl
  )}`;

  const shareText = `⚖️ *Apresentação Ao Vivo — TCC Direito Tributário (IPTU Curitiba)*\n\nAcompanhe os slides da minha defesa em tempo real direto na tela do seu celular (os slides mudam sozinhos conforme eu apresento!):\n\n👉 ${audienceUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(audienceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'TCC IPTU Curitiba — Transmissão Ao Vivo de Slides',
          text: 'Acompanhe os slides da minha apresentação em tempo real pelo celular:',
          url: audienceUrl,
        });
        return;
      } catch {
        // user cancelled or unsupported
      }
    }
    handleCopyLink();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl p-6 sm:p-7 border border-amber-500/40 shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-y-auto max-h-[92vh] space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                Compartilhar Slides Ao Vivo
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                <Users className="w-3 h-3 text-emerald-400" />
                <span>{viewerCount} online</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Envie no grupo da conferência! Quando você mudar o slide aqui no seu PC, o slide muda{' '}
              <strong className="text-amber-300">sozinho e na mesma hora</strong> no celular de todo mundo.
            </p>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="flex flex-col items-center justify-center bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)] border-2 border-amber-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt="QR Code para acompanhar os slides ao vivo"
              className="w-52 h-52 sm:w-60 sm:h-60 object-contain"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Aponte a câmera do celular ou envie o link abaixo no grupo</span>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] font-mono">
            <Radio
              className={`w-3.5 h-3.5 ${
                isRealtimeConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
              }`}
            />
            <span className={isRealtimeConnected ? 'text-emerald-300' : 'text-amber-300'}>
              {isRealtimeConnected
                ? 'Sala de Transmissão Ativa • Sem necessidade de senha para quem assiste'
                : 'Conectando sala em tempo real...'}
            </span>
          </div>
        </div>

        {/* Link Box + Copy */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Link Direto para os Colegas do Grupo (Modo Plateia):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={audienceUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center space-x-1.5 transition shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Enviar no Grupo (WhatsApp)</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar Convite...</span>
          </button>
        </div>

        {/* Preview Audience View */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>🔒 No Modo Plateia, só você muda os slides.</span>
          <a
            href={audienceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            <span>Testar visão da galera</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

