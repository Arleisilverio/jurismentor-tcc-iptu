import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { slideTitle, slideSubtitle } = await req.json();
    const prompt = `Editorial academic presentation illustration (16:9), deep dark navy slate background (#090D16) with warm gold (#F59E0B) and cyan (#06B6D4) lighting accents, modern legal and urban architecture infographic style (like The Economist / NotebookLM). Topic: ${slideTitle} - ${slideSubtitle || 'Direito Tributário e IPTU de Curitiba'}. Strictly NO text, NO words, NO letters inside the image.`;

    // 1. Tenta Nano Banana (Gemini 2.5 Flash Image) se GEMINI_API_KEY estiver configurada
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const imgPart = parts.find((p: any) => p.inlineData?.data);
          if (imgPart?.inlineData?.data) {
            const mime = imgPart.inlineData.mimeType || 'image/png';
            return NextResponse.json({
              imageUrl: `data:${mime};base64,${imgPart.inlineData.data}`,
              provider: 'Nano Banana (Gemini 2.5 Flash Image)',
            });
          }
        }
      } catch (e) {
        console.warn('Nano Banana fallback para OpenAI Image:', e);
      }
    }

    // 2. Usa OpenAI (DALL-E 3) com a OPENAI_API_KEY já ativa no projeto
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const oaiRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1792x1024',
          response_format: 'b64_json',
        }),
      });

      if (oaiRes.ok) {
        const data = await oaiRes.json();
        const b64 = data?.data?.[0]?.b64_json;
        if (b64) {
          return NextResponse.json({
            imageUrl: `data:image/png;base64,${b64}`,
            provider: 'OpenAI DALL·E 3 HD',
          });
        }
      }
    }

    return NextResponse.json(
      { error: 'Nenhuma chave de geração de imagem disponível.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao gerar imagem' }, { status: 500 });
  }
}

