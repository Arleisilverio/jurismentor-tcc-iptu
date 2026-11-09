import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

interface PresetVoiceTopic {
  id: string;
  title: string;
  audioUrl: string;
  text: string;
  keywords: string[];
}

const ARLEI_PRESET_VOICES: PresetVoiceTopic[] = [
  {
    id: 'abertura-original',
    title: 'Abertura Oficial e Homenagem à Orientadora Prof.ª Ana Cristina Zadra Valadares',
    audioUrl: '/audio/arlei/abertura-original.mp3',
    text: 'Bom dia aos ilustres professores da banca examinadora e à minha orientadora, excelentíssima professora de Direito Tributário do Centro Universitário UniDomBosco, Ana Cristina Zadra Valadares. Meu nome é Arlei Silvério, e nesta pesquisa analisaremos a tributação dos imóveis não edificados no IPTU de Curitiba, demonstrando que o alvará de construção válido e o canteiro de obras em andamento cumprem a função social da propriedade urbana.',
    keywords: ['abertura', 'ana cristina', 'valadares', 'orientadora', 'apresente-se', 'apresentacao inicial'],
  },
  {
    id: 'lc-40-2001',
    title: 'Art. 42 da LC 40/2001 de Curitiba: Regra dos 5% e o Dogma do Habite-se',
    audioUrl: '/audio/arlei/lc-40-2001.mp3',
    text: 'Explicando a Lei Complementar 40 de 2001 de Curitiba: o artigo 42 comete duas grandes distorções contra quem constrói na nossa cidade. Primeiro, ele cria uma ficção fiscal que equipara o imóvel com edificação em andamento a um terreno baldio abandonado, mantendo a alíquota territorial punitiva de até três e meio por cento até a expedição formal do Habite-se, o CVCO. Segundo, impõe a regra da vigésima parte, exigindo que o valor da construção supere cinco por cento do valor venal do terreno. Com a Planta Genérica da LC 136 de 2022, grandes terrenos industriais e logísticos passaram a valer dezenas de milhões de reais, tornando essa cobrança confiscatória e contrária à verdade material.',
    keywords: ['lc 40', '40/2001', '40 de 2001', 'artigo 42', 'art 42', '5%', 'cinco por cento', 'vigesima parte', 'habite-se', 'cvco', '136'],
  },
  {
    id: 'cf-156-182',
    title: 'Matriz Constitucional: Art. 156 vs. Art. 182 da CF/88',
    audioUrl: '/audio/arlei/cf-156-182.mp3',
    text: 'Sobre a matriz constitucional do IPTU: é fundamental distinguir o artigo 156 do artigo 182 da Constituição de 1988. O artigo 156, parágrafo primeiro, após a Emenda 29 de 2000, autoriza alíquotas diferenciadas conforme o uso e a localização do imóvel, respeitando sempre a capacidade contributiva do artigo 145 e a vedação ao confisco do artigo 150, inciso quarto. Já o IPTU progressivo no tempo do artigo 182, parágrafo quarto, é uma sanção urbanística que exige lei específica do Plano Diretor, notificação prévia do proprietário em cartório e concessão de prazo para construir. Portanto, Curitiba não pode usar a alíquota territorial como punição automática contra quem já tem alvará válido e está edificando.',
    keywords: ['156', '182', 'constituicao', 'constitucional', 'estatuto da cidade', 'emenda 29', 'progressivo no tempo', 'confisco', 'capacidade contributiva'],
  },
  {
    id: 'tjpr-stf',
    title: 'A Resposta dos Tribunais: TJPR (Des. Rogério Kanayama) e STF (Tema 1.455)',
    audioUrl: '/audio/arlei/tjpr-stf.mp3',
    text: 'Quanto à resposta do Poder Judiciário: o Tribunal de Justiça do Paraná, no precedente paradigmático relatado pelo Desembargador Rogério Kanayama na Apelação Cível 0004521-88.2021.8.16.0004, pacificou que a existência de Alvará de Construção válido somada ao efetivo andamento das obras afasta por completo a presunção de especulação imobiliária. Além disso, pelo artigo 118 do Código Tributário Nacional, prevalece a verdade material: o Habite-se tem efeito meramente declaratório. E fechando a questão, o Supremo Tribunal Federal, no Tema 1.455 relatado pelo Ministro Dias Toffoli em 2026, declarou inconstitucional fixar alíquota de IPTU em razão da área ou fração métrica do imóvel, derrubando subterfúgios aritméticos como a regra dos cinco por cento de Curitiba.',
    keywords: ['tjpr', 'kanayama', 'rogerio kanayama', 'tribunal', 'jurisprudencia', '1455', '1.455', 'toffoli', 'stf', 'supremo', 'verdade material', '118'],
  },
  {
    id: 'propostas-lege-ferenda',
    title: 'As Três Propostas de Lege Ferenda para Curitiba',
    audioUrl: '/audio/arlei/propostas-lege-ferenda.mp3',
    text: 'Para solucionar esse conflito em Curitiba, nosso artigo propõe três alterações legislativas de lege ferenda: Primeira, instituir na LC 40 de 2001 a Alíquota Transitória de Fomento à Construção Civil, aplicando o patamar predial durante a vigência regular do Alvará de Construção ativo. Segunda, criar o Desdobro Fiscal Proporcional para grandes terrenos logísticos e industriais, tributando como predial a área construída e operacional e mantendo a alíquota territorial apenas sobre eventual fração realmente ociosa. E terceira, conferir eficácia declaratória imediata ao protocolo do pedido de Habite-se quando instruído com Laudo Técnico Conclusivo e ART ou RRT de engenharia.',
    keywords: ['propostas', 'tres propostas', '3 propostas', 'lege ferenda', 'solucoes', 'aliquota transitoria', 'desdobro', 'laudo tecnico', 'art'],
  },
];

function matchPresetTopic(query: string): PresetVoiceTopic | null {
  const norm = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const preset of ARLEI_PRESET_VOICES) {
    if (preset.keywords.some((k) => norm.includes(k))) {
      return preset;
    }
  }
  return null;
}

const ARLEI_FIRST_PERSON_SYSTEM_PROMPT = `Você é o próprio acadêmico de Direito Arlei Silvério (orientando da Prof.ª Ana Cristina Zadra Valadares no Centro Universitário UniDomBosco - Curitiba/PR), falando em PRIMEIRA PESSOA durante a apresentação ao vivo do seu TCC:
"A Tributação dos Imóveis Não Edificados no IPTU de Curitiba: Análise Jurídica dos Critérios de Enquadramento, Transição em Obras e a Função Social da Propriedade Urbana".

Responda ao pedido com um parágrafo falado, fluido, natural e eloquente (entre 45 e 75 palavras, ideal para 20 a 30 segundos de áudio), sem usar listas, asteriscos ou markdown.
Sempre fundamente com precisão nos dispositivos do seu TCC: art. 42 da LC 40/2001 de Curitiba (regra dos 5% e exigência do CVCO/Habite-se), LC 136/2022 (PGV), arts. 145 § 1.º, 150 IV, 156 § 1.º e 182 § 4.º da CF/88, art. 118 do CTN (verdade material), precedente do TJPR (Ap. Cível 0004521-88.2021.8.16.0004, Rel. Des. Rogério Kanayama) e Tema 1.455 do STF (Rel. Min. Dias Toffoli, 2026).`;

export async function POST(req: Request) {
  try {
    const { command, presetId } = await req.json();

    // 1) Se pediu um preset específico por ID
    if (presetId) {
      const found = ARLEI_PRESET_VOICES.find((p) => p.id === presetId);
      if (found) {
        return NextResponse.json({
          title: found.title,
          text: found.text,
          audioUrl: found.audioUrl,
          audioBase64: null,
          source: 'Voz Clonada Arlei (Instantâneo)',
        });
      }
    }

    const cleanCmd = (command || '').trim();
    if (!cleanCmd) {
      return NextResponse.json({ error: 'Comando vazio' }, { status: 400 });
    }

    // 2) Verifica se o comando bate com um dos temas já gravados com a voz do Arlei
    const matchedPreset = matchPresetTopic(cleanCmd);
    if (matchedPreset) {
      return NextResponse.json({
        title: matchedPreset.title,
        text: matchedPreset.text,
        audioUrl: matchedPreset.audioUrl,
        audioBase64: null,
        source: 'Voz Clonada Arlei (Instantâneo)',
      });
    }

    // 3) Caso seja uma pergunta inédita/improvisada na apresentação, gera o texto em 1ª pessoa via GPT
    const openaiKey = process.env.OPENAI_API_KEY;
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    const elevenVoiceId = process.env.ELEVENLABS_VOICE_ID;

    let spokenText =
      'Como demonstramos em nossa pesquisa no Centro Universitário UniDomBosco sob orientação da Professora Ana Cristina Zadra Valadares, o artigo 42 da Lei Complementar 40 de 2001 de Curitiba viola a verdade material do artigo 118 do CTN e a capacidade contributiva ao tributar canteiros de obras ativos como lotes vagos, entendimento já pacificado pelo Desembargador Rogério Kanayama no TJPR e pelo Tema 1455 do STF.';

    if (openaiKey) {
      try {
        const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            temperature: 0.3,
            messages: [
              { role: 'system', content: ARLEI_FIRST_PERSON_SYSTEM_PROMPT },
              { role: 'user', content: cleanCmd },
            ],
          }),
        });
        if (chatRes.ok) {
          const data = await chatRes.json();
          const content = data?.choices?.[0]?.message?.content?.trim();
          if (content) spokenText = content;
        }
      } catch {
        // usa fallback
      }
    }

    // 4) Se houver chave da ElevenLabs configurada, usa o clone na ElevenLabs; senão, usa OpenAI TTS masculino
    let audioBase64: string | null = null;
    let source = 'Voz Neural Ao Vivo';

    if (elevenKey && elevenVoiceId) {
      try {
        const elRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': elevenKey,
            },
            body: JSON.stringify({
              text: spokenText,
              model_id: 'eleven_multilingual_v2',
              voice_settings: { stability: 0.55, similarity_boost: 0.85 },
            }),
          }
        );
        if (elRes.ok) {
          const buf = await elRes.arrayBuffer();
          audioBase64 = Buffer.from(buf).toString('base64');
          source = 'ElevenLabs Clone (Arlei)';
        }
      } catch {
        // fallback para OpenAI TTS
      }
    }

    if (!audioBase64 && openaiKey) {
      try {
        const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'onyx',
            speed: 1.03,
            input: spokenText,
          }),
        });
        if (ttsRes.ok) {
          const buf = await ttsRes.arrayBuffer();
          audioBase64 = Buffer.from(buf).toString('base64');
          source = 'IA Voz Ao Vivo';
        }
      } catch {
        // fallback navegador
      }
    }

    return NextResponse.json({
      title: `Arlei IA: "${cleanCmd}"`,
      text: spokenText,
      audioUrl: null,
      audioBase64,
      source,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}

