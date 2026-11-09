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
    audioUrl: '/audio/arlei/abertura-original.mp3?v=2',
    text: 'Bom dia aos ilustres professores da banca examinadora e à minha orientadora, excelentíssima professora de Direito Tributário do Centro Universitário UniDomBosco, Ana Cristina Zadra Valadares. Meu nome é Arlei Silvério, e nesta pesquisa analisaremos a tributação dos imóveis não edificados no IPTU de Curitiba, demonstrando que o alvará de construção válido e o canteiro de obras em andamento cumprem a função social da propriedade urbana.',
    keywords: ['abertura', 'ana cristina', 'valadares', 'orientadora', 'apresente-se', 'apresentacao inicial'],
  },
  {
    id: 'lc-40-2001',
    title: 'Art. 42 da LC 40/2001 de Curitiba e a Regra dos 5%',
    audioUrl: '/audio/arlei/lc-40-2001.mp3?v=2',
    text: 'Sobre a Lei Complementar 40 de 2001 de Curitiba: o artigo 42, inciso I, alínea b, cria uma presunção absoluta de que todo imóvel onde a área construída seja menor que 5% do terreno é considerado não edificado, pagando alíquota de até 3%. Na nossa pesquisa, demonstramos que aplicar essa regra contra quem possui alvará de construção válido e obra em andamento desvirtua a extrafiscalidade e pune quem já está cumprindo a função social da propriedade.',
    keywords: ['lc 40', '40/2001', '40 de 2001', 'artigo 42', 'art 42', '5%', 'cinco por cento', 'vigesima parte', 'habite-se', 'cvco', '136'],
  },
  {
    id: 'cf-156-182',
    title: 'Matriz Constitucional: Art. 156 vs. Art. 182 da CF/88',
    audioUrl: '/audio/arlei/cf-156-182.mp3?v=2',
    text: 'A diferença constitucional é decisiva: o artigo 156, parágrafo 1º, inciso II da Constituição autoriza alíquotas diferenciadas de acordo com a localização e o uso do imóvel, que foi o tema julgado pelo Supremo no Tema 523. Já o artigo 182, parágrafo 4º, trata do IPTU progressivo no tempo como sanção por subutilização, que exige notificação prévia, prazo para parcelar ou edificar e lei específica.',
    keywords: ['156', '182', 'constituicao', 'constitucional', 'estatuto da cidade', 'emenda 29', 'progressivo no tempo', 'confisco', 'capacidade contributiva'],
  },
  {
    id: 'tjpr-stf',
    title: 'A Resposta dos Tribunais: TJPR (2ª Câmara Cível) e STF (Tema 1.455)',
    audioUrl: '/audio/arlei/tjpr-stf.mp3?v=2',
    text: 'O Tribunal de Justiça do Paraná, no precedente histórico relatado pelo Desembargador Rodrigo Otávio Rodrigues Gomes do Amaral na 2ª Câmara Cível, reconheceu que um imóvel com 127 mil metros quadrados de obras em execução e mais de R$ 24 milhões investidos cumpre plenamente sua função social, afastando a regra dos 5% de Curitiba. Além disso, o Supremo Tribunal Federal afetou o Tema 1.455 para definir o alcance dessa seletividade.',
    keywords: ['tjpr', 'kanayama', 'rodrigo', 'amaral', 'tribunal', 'jurisprudencia', '1455', '1.455', 'toffoli', 'stf', 'supremo', 'verdade material', '118'],
  },
  {
    id: 'propostas-lege-ferenda',
    title: 'As Três Propostas de Lege Ferenda para Curitiba',
    audioUrl: '/audio/arlei/propostas-lege-ferenda.mp3?v=2',
    text: 'Para modernizar a legislação tributária de Curitiba sem renúncia de receita, propomos três medidas na Lei Complementar 40 de 2001: primeiro, suspender a alíquota agravada durante a vigência do alvará de construção com obra comprovadamente iniciada; segundo, converter a regra dos 5% em presunção relativa, admitindo vistoria técnica; e terceiro, excluir as áreas de preservação permanente da base de cálculo da taxa de ocupação.',
    keywords: ['propostas', 'tres propostas', '3 propostas', 'lege ferenda', 'solucoes', 'aliquota transitoria', 'desdobro', 'laudo tecnico', 'art', 'curitiba'],
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

