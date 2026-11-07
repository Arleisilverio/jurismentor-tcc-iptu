import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const BANCA_COPILOT_SYSTEM_PROMPT = `Você é o "Ponto Eletrônico de Banca" de Arlei Silvério na defesa ao vivo do TCC de Direito:
"A TRIBUTAÇÃO DOS IMÓVEIS NÃO EDIFICADOS NO IPTU DE CURITIBA: ANÁLISE JURÍDICA DOS CRITÉRIOS DE ENQUADRAMENTO, TRANSIÇÃO EM OBRAS E A FUNÇÃO SOCIAL DA PROPRIEDADE URBANA".

Um professor da banca acabou de fazer uma pergunta ao vivo (captada por microfone ou texto).
Sua missão é entregar uma resposta IMEDIATA, CIRÚRGICA e FÁCIL DE LER/OUVIR em formato JSON estrito com as seguintes chaves:
{
  "abertura_imediata": "Frase de 1 a 2 linhas para o Arlei começar a falar agora mesmo com total segurança e respeito acadêmico.",
  "sussurro_fone": "Resumo falado natural de 2 a 3 frases curtas (máximo 45 palavras) direto ao ponto para o Arlei ouvir no fone de ouvido.",
  "topicos_resposta": [
    "1.º Argumento principal direto e claro",
    "2.º Fundamento constitucional ou legal aplicável",
    "3.º Precedente do TJPR ou STF que fecha a questão"
  ],
  "fundamentos": [
    "Art. 42 da LC 40/2001 (Curitiba)",
    "TJPR - Ap. Cível 0004521-88.2021.8.16.0004 (Rel. Des. Rogério Kanayama)",
    "STF Tema 1.455 (Min. Dias Toffoli, 2026)"
  ],
  "armadilha": "O que jamais dizer ou confundir nessa pergunta (1 frase curta)."
}

NÚCLEO DE CONHECIMENTO OBRIGATÓRIO:
- Art. 42 da LC Municipal 40/2001 de Curitiba: cria a ficção de que obra em andamento é terreno não edificado e exige que a construção atinja 1/20 (5%) do valor venal do terreno.
- LC Municipal 136/2022 (PGV): elevou o valor venal de grandes terrenos logísticos/industriais, tornando os 5% confiscatórios.
- Habite-se (CVCO): a SMFI exige o Habite-se formal para mudar para IPTU predial, mas o TJPR e o art. 118 do CTN afirmam que o Habite-se é meramente DECLARATÓRIO (prevalece a verdade material).
- TJPR (1.ª, 2.ª e 3.ª Câmaras Cíveis - Precedente Des. Rogério Kanayama, Ap. Cível 0004521-88.2021.8.16.0004): Alvará de Construção válido + efetivo andamento das obras afastam a presunção de especulação imobiliária e a alíquota territorial punitiva. Se houver alvará simulado/obra parada, volta a cobrar territorial.
- CF/88: Art. 145, § 1.º (Capacidade Contributiva); Art. 150, IV (Vedação ao Confisco); Art. 156, § 1.º, I e II (EC 29/2000 - progressividade fiscal e alíquotas diferenciadas por uso/localização) vs. Art. 182, § 4.º, II (IPTU progressivo no tempo como sanção urbanística que exige Plano Diretor, área delimitada e notificação prévia).
- Reserva de Plenário (Art. 97 CF / Súmula Vinculante 10): o TJPR não declara a inconstitucionalidade formal em abstrato sem plenário; faz interpretação conforme a Constituição e subsunção fática pela verdade material.
- STF Tema 1.455 (ARE 1.593.784/SC, Rel. Min. Dias Toffoli, julgado em 06/08/2026): tese vinculante declarando inconstitucional fixar alíquota de IPTU em razão da área do imóvel; seletividade restringe-se ao uso/destinação, fulminando critérios métricos/aritméticos como a regra da 20.ª parte (5%).
- Súmula 160 do STJ: vedação de majoração ou restrição sem lei.
- As 3 propostas de lege ferenda do TCC: (1) Alíquota transitória predial durante alvará ativo; (2) Desdobro fiscal proporcional para grandes terrenos logísticos; (3) Eficácia declaratória imediata do protocolo de CVCO com Laudo Técnico e ART/RRT.`;

function buildFallbackAnswer(question: string) {
  const q = question.toLowerCase();
  if (q.includes('simula') || q.includes('parada') || q.includes('paralis') || q.includes('fraude')) {
    return {
      abertura_imediata:
        'Excelente indagação, professor. O entendimento do TJPR exige dois requisitos cumulativos: alvará válido E obra efetivamente em andamento.',
      sussurro_fone:
        'Diga que o TJPR exige alvará válido mais obra real em andamento. Se o terreno ficar parado ou for alvará simulado, a Prefeitura fiscaliza e cobra a alíquota territorial máxima retroativa.',
      topicos_resposta: [
        'Requisito duplo no TJPR: Alvará de Construção válido + comprovação fática do andamento das obras (ART, fotos, diário de obra).',
        'Presunção relativa (juris tantum): se constatada paralisação injustificada ou simulação, cai o benefício e incide a alíquota territorial retroativa.',
        'Protege-se a boa-fé produtiva de quem edifica, reprimindo-se a fraude fiscal.',
      ],
      fundamentos: [
        'TJPR - Ap. Cível 0004521-88.2021.8.16.0004 (Rel. Des. Rogério Kanayama)',
        'Art. 118 e Art. 149 do CTN (Lançamento de Ofício em caso de omissão/simulação)',
      ],
      armadilha: 'Jamais diga que basta ter o papel do alvará na gaveta; é indispensável o andamento real da obra.',
    };
  }

  if (q.includes('156') || q.includes('182') || q.includes('progressiv') || q.includes('estatuto da cidade')) {
    return {
      abertura_imediata:
        'Perfeito questionamento, professor. A distinção entre o artigo 156 e o artigo 182 da Constituição é a espinha dorsal do Capítulo I do artigo.',
      sussurro_fone:
        'Diferencie o artigo 156, que trata de alíquota fiscal por uso e localização após a Emenda 29, do artigo 182, que é sanção urbanística progressiva no tempo e exige notificação em cartório e Plano Diretor.',
      topicos_resposta: [
        'Art. 156, § 1.º, I e II (EC 29/2000): natureza fiscal ordinária (valor venal, localização e uso residencial ou não residencial).',
        'Art. 182, § 4.º, II (Estatuto da Cidade): sanção urbanística no tempo contra subutilização, exigindo lei específica, notificação pessoal e prazo para edificar.',
        'Curitiba aplica alíquota territorial punitiva de 3,5% como atalho sancionatório sem observar o devido processo legal do art. 182.',
      ],
      fundamentos: [
        'Art. 156, § 1.º, I e II da CF/88 (EC 29/2000)',
        'Art. 182, § 4.º, II da CF/88 e Lei 10.257/2001 (Estatuto da Cidade)',
      ],
      armadilha: 'Nunca confunda alíquota diferenciada por uso (art. 156) com IPTU progressivo no tempo (art. 182).',
    };
  }

  return {
    abertura_imediata:
      'Excelente ponto, professor. Embora o lançamento tributário seja vinculado (art. 142 do CTN), a lei municipal subordina-se à Constituição Federal e à verdade material.',
    sussurro_fone:
      'Responda que a verdade material do artigo 118 do CTN e a capacidade contributiva prevalecem sobre a ficção do artigo 42 de Curitiba, conforme pacificado pelo Desembargador Kanayama no TJPR e pelo Tema 1455 do STF.',
    topicos_resposta: [
      'Supremacia Constitucional: o auditor fiscal segue o art. 142 do CTN, mas o Judiciário afasta o efeito confiscatório (art. 150, IV) e protege a capacidade contributiva (art. 145, § 1.º da CF).',
      'Primazia da Verdade Material (art. 118 do CTN): o Habite-se (CVCO) é meramente declaratório; o alvará válido com obra ativa afasta a especulação imobiliária (TJPR, Des. Rogério Kanayama).',
      'Tese Vinculante do STF (Tema 1.455 - Min. Dias Toffoli, 2026): é inconstitucional fixar alíquota de IPTU por critérios métricos ou frações aritméticas como a regra dos 5% (1/20) do art. 42 da LC 40/2001.',
    ],
    fundamentos: [
      'Art. 42 da LC 40/2001 (Curitiba)',
      'TJPR - Ap. Cível 0004521-88.2021.8.16.0004 (Des. Rogério Kanayama)',
      'STF Tema 1.455 (ARE 1.593.784/SC) & Art. 145, § 1.º / Art. 150, IV da CF/88',
    ],
    armadilha: 'Explique que não há violação à Reserva de Plenário (art. 97 CF), pois trata-se de interpretação conforme a Constituição e verdade material.',
  };
}

export async function POST(req: Request) {
  try {
    const { question, generateAudio } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Pergunta obrigatória' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    let structured: any = null;
    let provider = 'Motor Local Tático';

    if (apiKey) {
      try {
        const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            response_format: { type: 'json_object' },
            temperature: 0.25,
            messages: [
              { role: 'system', content: BANCA_COPILOT_SYSTEM_PROMPT },
              {
                role: 'user',
                content: `Pergunta do professor da banca ao vivo: "${question.trim()}"`,
              },
            ],
          }),
        });

        if (chatRes.ok) {
          const data = await chatRes.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            structured = JSON.parse(content);
            provider = `OpenAI · ${OPENAI_MODEL}`;
          }
        }
      } catch (err) {
        console.warn('Erro ao consultar OpenAI no banca-live, usando fallback:', err);
      }
    }

    if (!structured) {
      structured = buildFallbackAnswer(question);
    }

    let audioBase64: string | null = null;
    if (generateAudio && apiKey && structured?.sussurro_fone) {
      try {
        const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'onyx',
            speed: 1.08,
            input: structured.sussurro_fone,
          }),
        });

        if (ttsRes.ok) {
          const arrayBuffer = await ttsRes.arrayBuffer();
          audioBase64 = Buffer.from(arrayBuffer).toString('base64');
        }
      } catch (ttsErr) {
        console.warn('Fallback TTS navegador:', ttsErr);
      }
    }

    return NextResponse.json({
      ...structured,
      provider,
      audioBase64,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}

