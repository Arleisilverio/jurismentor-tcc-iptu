import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JurisMentor IPTU Curitiba | Agente de Bolso para TCC',
  description: 'Tutor inteligente, simulador de banca examinadora e preparador para defesa do TCC sobre Tributação dos Imóveis Não Edificados no IPTU de Curitiba.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="select-none bg-slate-950 font-sans text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
