import { NextResponse } from 'next/server';
import { MONOGRAFIA, PERGUNTAS_BANCA } from '@/lib/tccData';

export async function POST(req: Request) {
  try {
    const { message, mode, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensagem obrigatória' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // If an API key is configured on server (e.g. on Vercel environment variables)
    if (process.env.GEMINI_API_KEY) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Você é o "JurisMentor IPTU Curitiba", consultor acadêmico sênior, especialista em Direito Tributário Municipal e membro de bancas examinadoras.
Tese do Orientando: "${MONOGRAFIA.titulo}".
Modo Operacional Ativo: ${mode || 'Tutor Explicativo'}.
Pergunta do Aluno: "${message}".
Responda com rigor técnico, citando LC 40/2001, LC 136/2022, CF/88 e TJPR.`
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return NextResponse.json({ reply });
      }
    }

    // Default response using local intelligence synthesis
    return NextResponse.json({
      reply: `[JurisMentor - ${mode || 'Tutor'}] Recebido: "${message}".\n\nLembre-se sempre de contrapor o formalismo do art. 42 da LC 40/2001 e a exigência do Habite-se à verdade material e à capacidade contributiva (art. 145, § 1º da CF), conforme consolidado na 2ª Câmara Cível do TJPR (Ap. Cível 0004521-88.2021.8.16.0004).`
    });

  } catch (error: any) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
