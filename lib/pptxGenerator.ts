import pptxgen from 'pptxgenjs';
import { MONOGRAFIA, GRIMORIO_LEIS } from '@/lib/tccData';

export interface PresentationConfig {
  tema: string;
  objetivo: 'defesa' | 'seminario' | 'aula' | 'estudo';
  quantidadeSlides: 5 | 10 | 15 | 20;
  profundidade: 'sintese' | 'intermediario' | 'aprofundado';
  estiloVisual: 'editorial' | 'infografico' | 'executivo';
  autor?: string;
  instituicao?: string;
}

export async function generateAcademicPptx(config: PresentationConfig): Promise<Blob> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = config.autor || 'Arlei Silvério - 8º Período de Direito';
  pptx.company = config.instituicao || 'Orientador Fiscal Curitiba';
  pptx.title = config.tema || MONOGRAFIA.titulo;

  // Design Tokens (NotebookLM Editorial Legal-Tech Palette)
  const C_BG = '0A1128';        // Dark Navy Slate
  const C_SURFACE = '131E3A';   // Elevated Card Slate
  const C_CARD = '1A274E';      // Inner Card
  const C_GOLD = 'F59E0B';      // Cyber Gold
  const C_YELLOW = 'FACC15';    // Bright Yellow
  const C_WHITE = 'F8FAFC';     // Bright White
  const C_MUTED = '94A3B8';     // Muted Slate Text
  const C_CYAN = '06B6D4';      // Cyan Accent
  const C_EMERALD = '10B981';   // Emerald Accent
  const C_ROSE = 'F43F5E';      // Rose / Alert Accent

  const FONT_HEAD = 'Calibri';
  const FONT_BODY = 'Calibri';

  // Helper to add dark editorial canvas background to each slide
  const createBaseSlide = (category: string, slideNumber: number, totalSlides: number) => {
    const slide = pptx.addSlide();
    // Dark background
    slide.background = { color: C_BG };

    // Top subtle golden header accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.08,
      fill: { color: C_GOLD }
    });

    // Top Category Badge
    slide.addText(category.toUpperCase(), {
      x: 0.8, y: 0.35, w: 6.0, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, bold: true,
      color: C_GOLD, charSpacing: 2
    });

    // Footer with TCC Title and Slide Count
    slide.addText(`TCC: IMÓVEIS NÃO EDIFICADOS • CURITIBA/PR`, {
      x: 0.8, y: 7.0, w: 7.0, h: 0.3,
      fontSize: 10, fontFace: FONT_BODY,
      color: C_MUTED
    });

    slide.addText(`${slideNumber} / ${totalSlides}`, {
      x: 11.5, y: 7.0, w: 1.0, h: 0.3,
      fontSize: 10, fontFace: FONT_BODY, bold: true,
      color: C_GOLD, align: 'right'
    });

    return slide;
  };

  const total = config.quantidadeSlides;

  // ==========================================
  // SLIDE 1: CAPA EDITORIAL NOTEBOOKLM
  // ==========================================
  {
    const s = pptx.addSlide();
    s.background = { color: C_BG };

    // Decorative top border
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.12, fill: { color: C_GOLD } });

    // Decorative card container
    s.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 1.0, w: 11.73, h: 5.4,
      fill: { color: C_SURFACE },
      line: { color: C_GOLD, width: 1.5 }
    });

    // Badge
    s.addText("MONOGRAFIA JURÍDICA // DIREITO TRIBUTÁRIO E URBANÍSTICO", {
      x: 1.3, y: 1.4, w: 10.5, h: 0.35,
      fontSize: 12, fontFace: FONT_HEAD, bold: true,
      color: C_CYAN, charSpacing: 3
    });

    // Main Title
    s.addText("A TRIBUTAÇÃO DOS IMÓVEIS NÃO EDIFICADOS NO IPTU DE CURITIBA", {
      x: 1.3, y: 1.9, w: 10.5, h: 1.3,
      fontSize: 26, fontFace: FONT_HEAD, bold: true,
      color: C_WHITE, lineSpacing: 32
    });

    // Subtitle
    s.addText("Análise Jurídica dos Critérios de Enquadramento, Transição em Obras e a Função Social da Propriedade Urbana", {
      x: 1.3, y: 3.3, w: 10.5, h: 0.7,
      fontSize: 16, fontFace: FONT_BODY,
      color: C_YELLOW, italic: true
    });

    // Separator line
    s.addShape(pptx.ShapeType.line, {
      x: 1.3, y: 4.3, w: 10.5, h: 0,
      line: { color: C_GOLD, width: 1.5 }
    });

    // Metadata Footer
    s.addText([
      { text: "Orientando: ", options: { bold: true, color: C_GOLD } },
      { text: `${config.autor || 'Bacharelando em Direito - 8º Período'}\n`, options: { color: C_WHITE } },
      { text: "Área de Concentração: ", options: { bold: true, color: C_GOLD } },
      { text: "Direito Municipal, Tributário e Urbanístico • Curitiba/PR", options: { color: C_WHITE } }
    ], {
      x: 1.3, y: 4.6, w: 6.5, h: 1.2,
      fontSize: 12, fontFace: FONT_BODY, lineSpacing: 18
    });

    s.addText([
      { text: "Objetivo: ", options: { bold: true, color: C_CYAN } },
      { text: `${config.objetivo === 'defesa' ? 'Defesa Perante Banca Examinadora' : 'Seminário de Pesquisa Acadêmica'}\n`, options: { color: C_WHITE } },
      { text: "Ano de Apresentação: ", options: { bold: true, color: C_CYAN } },
      { text: "2026", options: { color: C_WHITE } }
    ], {
      x: 8.0, y: 4.6, w: 4.0, h: 1.2,
      fontSize: 12, fontFace: FONT_BODY, lineSpacing: 18
    });
  }

  // ==========================================
  // SLIDE 2: O PROBLEMA CENTRAL DE PESQUISA
  // ==========================================
  {
    const s = createBaseSlide("01. CONTEXTO & PROBLEMA DE PESQUISA", 2, total);

    s.addText("O Impasse Fático e Tributário em Curitiba", {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, bold: true, color: C_WHITE
    });

    // Left Box: A Premissa Legítima do IPTU Territorial
    s.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 1.6, w: 5.6, h: 4.8,
      fill: { color: C_SURFACE },
      line: { color: C_CYAN, width: 1.5 }
    });

    s.addText("A FINALIDADE LEGÍTIMA DA EXTRAFISCALIDADE", {
      x: 1.1, y: 1.9, w: 5.0, h: 0.35,
      fontSize: 13, fontFace: FONT_HEAD, bold: true, color: C_CYAN
    });

    s.addText([
      { text: "• Coibir a Retenção Especulativa:\n", options: { bold: true, color: C_GOLD } },
      { text: "A majoração da alíquota territorial tem por escopo forçar a utilização do solo urbano provido de infraestrutura.\n\n", options: { color: C_WHITE } },
      { text: "• Função Social da Propriedade (CF, art. 182):\n", options: { bold: true, color: C_GOLD } },
      { text: "A terra nua ociosa encarece os serviços públicos e empurra a população para as periferias urbanas.\n\n", options: { color: C_WHITE } },
      { text: "• Destinação Fática Esperada:\n", options: { bold: true, color: C_GOLD } },
      { text: "Espera-se que o proprietário parcele, edifique ou utilize o imóvel para fins residenciais ou comerciais.", options: { color: C_WHITE } }
    ], {
      x: 1.1, y: 2.4, w: 5.0, h: 3.7,
      fontSize: 12, fontFace: FONT_BODY, lineSpacing: 18
    });

    // Right Box: A Distorção Fática Praticada pelo Fisco
    s.addShape(pptx.ShapeType.rect, {
      x: 6.8, y: 1.6, w: 5.6, h: 4.8,
      fill: { color: C_SURFACE },
      line: { color: C_ROSE, width: 1.5 }
    });

    s.addText("A DISTORÇÃO FAZENDÁRIA DA SMFI", {
      x: 7.1, y: 1.9, w: 5.0, h: 0.35,
      fontSize: 13, fontFace: FONT_HEAD, bold: true, color: C_ROSE
    });

    s.addText([
      { text: "• Tributação de Canteiro Ativo como Terreno Vago:\n", options: { bold: true, color: C_YELLOW } },
      { text: "A Prefeitura de Curitiba aplica alíquota territorial cheia sobre lotes que possuem Alvará de Obras regular e canteiros ativos.\n\n", options: { color: C_WHITE } },
      { text: "• Condicionamento ao CVCO ('Habite-se'):\n", options: { bold: true, color: C_YELLOW } },
      { text: "O Fisco recusa a alteração cadastral predial até a expedição final da certidão, penalizando o contribuinte pela morosidade administrativa.\n\n", options: { color: C_WHITE } },
      { text: "• Problema Central da Monografia:\n", options: { bold: true, color: C_YELLOW } },
      { text: "Pode o Fisco presumir especulação imobiliária enquanto o cidadão desvela recursos, gera empregos e edifica o solo?", options: { color: C_WHITE } }
    ], {
      x: 7.1, y: 2.4, w: 5.0, h: 3.7,
      fontSize: 12, fontFace: FONT_BODY, lineSpacing: 18
    });
  }

  // ==========================================
  // SLIDE 3: HIPÓTESE & MATRIZ METODOLÓGICA
  // ==========================================
  {
    const s = createBaseSlide("02. METODOLOGIA & HIPÓTESE", 3, total);

    s.addText("Hipótese Científica e Objetivos da Pesquisa", {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, bold: true, color: C_WHITE
    });

    // Top Card: Hipótese Confirmada
    s.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 1.6, w: 11.6, h: 2.2,
      fill: { color: C_SURFACE },
      line: { color: C_GOLD, width: 1.5 }
    });

    s.addText("HIPÓTESE CONFIRMADA AO LONGO DA INVESTIGAÇÃO", {
      x: 1.1, y: 1.8, w: 11.0, h: 0.35,
      fontSize: 12, fontFace: FONT_HEAD, bold: true, color: C_GOLD
    });

    s.addText(
      "\"A manutenção da exação territorial com alíquota punitiva durante o iter construtivo regular, lastreada na presunção mecânica do art. 42 da LC 40/2001 e na exigência formal do Habite-se, viola frontalmente os princípios constitucionais da capacidade contributiva (art. 145, § 1º), do não confisco (art. 150, IV) e da verdade material, desvirtuando a extrafiscalidade urbanística em indevida sanção arrecadatória.\"",
      {
        x: 1.1, y: 2.2, w: 11.0, h: 1.4,
        fontSize: 13, fontFace: FONT_BODY, italic: true, color: C_WHITE, lineSpacing: 20
      }
    );

    // Bottom 3 Cards: Objetivos Específicos
    const objectives = [
      { num: "I", tit: "Investigação Normativa", txt: "Examinar a dicotomia predial vs. territorial na LC 40/2001 e LC 136/2022 de Curitiba." },
      { num: "II", tit: "Análise Jurisprudencial", txt: "Mapear o posicionamento unânime das Câmaras Cíveis Tributárias do TJPR contra a SMFI." },
      { num: "III", tit: "Propostas de Lege Ferenda", txt: "Formular 3 alterações legislativas e regulamentares para pacificar a matéria na Capital." }
    ];

    objectives.forEach((obj, idx) => {
      const xPos = 0.8 + idx * 4.0;
      s.addShape(pptx.ShapeType.rect, {
        x: xPos, y: 4.1, w: 3.6, h: 2.4,
        fill: { color: C_SURFACE },
        line: { color: C_CYAN, width: 1.0 }
      });

      s.addText(obj.num, {
        x: xPos + 0.3, y: 4.3, w: 0.8, h: 0.4,
        fontSize: 16, fontFace: FONT_HEAD, bold: true, color: C_CYAN
      });

      s.addText(obj.tit, {
        x: xPos + 0.3, y: 4.8, w: 3.0, h: 0.4,
        fontSize: 13, fontFace: FONT_HEAD, bold: true, color: C_GOLD
      });

      s.addText(obj.txt, {
        x: xPos + 0.3, y: 5.3, w: 3.0, h: 1.0,
        fontSize: 11, fontFace: FONT_BODY, color: C_WHITE, lineSpacing: 16
      });
    });
  }

  // ==========================================
  // SLIDE 4: MATRIZ CONSTITUCIONAL DO IPTU
  // ==========================================
  {
    const s = createBaseSlide("03. DIREITO CONSTITUCIONAL TRIBUTÁRIO", 4, total);

    s.addText("O IPTU na Ordem Constitucional: Art. 156 vs. Art. 182", {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, bold: true, color: C_WHITE
    });

    // 4 Columns for Constitutional Devices
    const constArticles = [
      {
        art: "Art. 145, § 1º, CF",
        tit: "Capacidade Contributiva",
        txt: "Os impostos devem ser graduados segundo a capacidade econômica real do contribuinte. Quem despende capital em obras não tem riqueza ociosa."
      },
      {
        art: "Art. 150, IV, CF",
        tit: "Vedação ao Confisco",
        txt: "É vedado utilizar tributo com efeito de confisco. Alíquota punitiva sobre terreno que abriga galpão produtivo aniquila a atividade econômica."
      },
      {
        art: "Art. 156, § 1º, II",
        tit: "Alíquotas Diferenciadas",
        txt: "Autoriza alíquotas diferentes por localização e uso do imóvel (EC 29/2000). Trata-se de tributação fiscal ordinária da receita pública."
      },
      {
        art: "Art. 182, § 4º, II",
        tit: "IPTU no Tempo (Sanção)",
        txt: "Extrafiscalidade urbanística coercitiva. Exige inclusão em área do Plano Diretor, notificação pessoal e descumprimento de prazos."
      }
    ];

    constArticles.forEach((item, idx) => {
      const xPos = 0.8 + idx * 3.0;
      s.addShape(pptx.ShapeType.rect, {
        x: xPos, y: 1.6, w: 2.75, h: 4.8,
        fill: { color: C_SURFACE },
        line: { color: idx === 3 ? C_ROSE : C_GOLD, width: 1.2 }
      });

      s.addText(item.art, {
        x: xPos + 0.2, y: 1.9, w: 2.35, h: 0.35,
        fontSize: 13, fontFace: FONT_HEAD, bold: true,
        color: idx === 3 ? C_ROSE : C_GOLD
      });

      s.addText(item.tit, {
        x: xPos + 0.2, y: 2.4, w: 2.35, h: 0.6,
        fontSize: 13, fontFace: FONT_HEAD, bold: true, color: C_WHITE
      });

      s.addText(item.txt, {
        x: xPos + 0.2, y: 3.2, w: 2.35, h: 3.0,
        fontSize: 11, fontFace: FONT_BODY, color: C_WHITE, lineSpacing: 18
      });
    });
  }

  // ==========================================
  // SLIDE 5: O CÓDIGO TRIBUTÁRIO DE CURITIBA (LC 40/2001 E ART. 42)
  // ==========================================
  {
    const s = createBaseSlide("04. LEGISLAÇÃO MUNICIPAL DE CURITIBA", 5, total);

    s.addText("O Artigo 42 da LC 40/2001 e a Regra da Vigésima Parte (5%)", {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, bold: true, color: C_WHITE
    });

    // Quote Box: Texto da Lei
    s.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 1.6, w: 11.6, h: 2.0,
      fill: { color: C_SURFACE },
      line: { color: C_GOLD, width: 1.5 }
    });

    s.addText("TEXTO LITERAL DO ARTIGO 42 DA LEI COMPLEMENTAR MUNICIPAL N.º 40/2001 (CURITIBA):", {
      x: 1.1, y: 1.8, w: 11.0, h: 0.3,
      fontSize: 11, fontFace: FONT_HEAD, bold: true, color: C_GOLD, charSpacing: 1
    });

    s.addText(
      "\"Art. 42. Não se considera edificado o imóvel cujo valor da construção não alcance a 20ª (vigésima) parte do valor venal do respectivo terreno (...); ou cujas construções sejam de caráter provisório ou precário, ou com edificações em andamento ou paralisadas.\"",
      {
        x: 1.1, y: 2.2, w: 11.0, h: 1.2,
        fontSize: 13, fontFace: FONT_BODY, bold: true, color: C_YELLOW, lineSpacing: 20
      }
    );

    // Two Analytical Columns Below
    s.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 3.9, w: 5.6, h: 2.6,
      fill: { color: C_SURFACE },
      line: { color: C_CYAN, width: 1.2 }
    });

    s.addText("1. A FICÇÃO DO 'NÃO EDIFICADO'", {
      x: 1.1, y: 4.1, w: 5.0, h: 0.3,
      fontSize: 12, fontFace: FONT_HEAD, bold: true, color: C_CYAN
    });

    s.addText(
      "Equipara o imóvel com edificação em andamento a um lote baldio. O Fisco curitibano ignora a materialidade do canteiro de obras e condiciona a alteração à averbação final do 'Habite-se' (CVCO), penalizando a empresa pela morosidade de fiscalização da própria Prefeitura.",
      {
        x: 1.1, y: 4.5, w: 5.0, h: 1.8,
        fontSize: 11, fontFace: FONT_BODY, color: C_WHITE, lineSpacing: 17
      }
    );

    s.addShape(pptx.ShapeType.rect, {
      x: 6.8, y: 3.9, w: 5.6, h: 2.6,
      fill: { color: C_SURFACE },
      line: { color: C_ROSE, width: 1.2 }
    });

    s.addText("2. A BARREIRA DA 20ª PARTE (5%)", {
      x: 7.1, y: 4.1, w: 5.0, h: 0.3,
      fontSize: 12, fontFace: FONT_HEAD, bold: true, color: C_ROSE
    });

    s.addText(
      "Com a nova Planta Genérica de Valores (LC 136/2022), grandes terrenos industriais atingiram valores venais milionários. A exigência contábil de que galpões atinjam 5% do valor total da terra nas fases iniciais impede o enquadramento predial, gerando tributação desproporcional.",
      {
        x: 7.1, y: 4.5, w: 5.0, h: 1.8,
        fontSize: 11, fontFace: FONT_BODY, color: C_WHITE, lineSpacing: 17
      }
    );
  }

  // ==========================================
  // SLIDE 6: TABELA COMPARATIVA IPTU TERRITORIAL VS PREDIAL
  // ==========================================
  {
    const s = createBaseSlide("05. QUADRO COMPARATIVO TRIBUTÁRIO", 6, total);

    s.addText("Confronto de Regimes: Imóvel Territorial vs. Imóvel Predial", {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, bold: true, color: C_WHITE
    });

    // Comparison Table using PptxGenJS native tables
    const tableData = [
      [
        { text: "CRITÉRIO DE ANÁLISE", options: { bold: true, color: C_GOLD, fill: { color: C_CARD } } },
        { text: "IMÓVEL TERRITORIAL (NÃO EDIFICADO)", options: { bold: true, color: C_ROSE, fill: { color: C_CARD } } },
        { text: "IMÓVEL PREDIAL (EDIFICADO EM USO)", options: { bold: true, color: C_CYAN, fill: { color: C_CARD } } }
      ],
      [
        { text: "Fato Gerador Presumido", options: { bold: true, color: C_WHITE } },
        { text: "Propriedade de solo urbano sem aproveitamento; presunção de especulação imobiliária.", options: { color: C_MUTED } },
        { text: "Propriedade de solo com edificação habitável ou produtiva.", options: { color: C_WHITE } }
      ],
      [
        { text: "Alíquota Aplicável (LC 40/01)", options: { bold: true, color: C_WHITE } },
        { text: "Alíquota majorada mais gravosa da tabela fazendária (viés indutor/punitivo).", options: { color: C_MUTED } },
        { text: "Alíquota ordinária moderada (residencial ou comercial/industrial).", options: { color: C_WHITE } }
      ],
      [
        { text: "Tratamento de Obras Ativas", options: { bold: true, color: C_WHITE } },
        { text: "Fisco equipara a terreno vago até expedição e averbação do CVCO.", options: { color: C_ROSE } },
        { text: "TJPR determina enquadramento predial a partir do alvará e início real.", options: { color: C_EMERALD, bold: true } }
      ],
      [
        { text: "Impacto no Empreendedor", options: { bold: true, color: C_WHITE } },
        { text: "Sobretaxa de IPTU justamente na fase em que imobiliza capital na construção.", options: { color: C_ROSE } },
        { text: "Tributação compatível com a capacidade econômica e fomento à cidade.", options: { color: C_CYAN } }
      ]
    ];

    s.addTable(tableData, {
      x: 0.8, y: 1.6, w: 11.6, h: 4.8,
      fill: { color: C_SURFACE },
      fontSize: 11, fontFace: FONT_BODY,
      border: { pt: 1, color: '334155' },
      align: 'left', valign: 'middle'
    });
  }

  // ==========================================
  // SLIDE 7: JURISPRUDÊNCIA DO TJPR (ACÓRDÃO KANAYAMA)
  // ==========================================
  {
    const s = createBaseSlide("06. JURISPRUDÊNCIA VINCULANTE & PARADIGMÁTICA", 7, total);

    s.addText("O Posicionamento Pretoriano do TJPR: Precedente Kanayama", {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, bold: true, color: C_WHITE
    });

    // Card: Precedente do TJPR
    s.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 1.6, w: 11.6, h: 3.0,
      fill: { color: C_SURFACE },
      line: { color: C_GOLD, width: 1.5 }
    });

    s.addText("TJPR • 2ª CÂMARA CÍVEL • APELAÇÃO CÍVEL N.º 0004521-88.2021.8.16.0004 (CURITIBA)", {
      x: 1.1, y: 1.8, w: 11.0, h: 0.35,
      fontSize: 12, fontFace: FONT_HEAD, bold: true, color: C_GOLD
    });

    s.addText(
      "\"APELAÇÃO CÍVEL. TRIBUTÁRIO. EMBARGOS À EXECUÇÃO FISCAL. IPTU. MUNICÍPIO DE CURITIBA. IMÓVEL EM CONSTRUÇÃO. ENQUADRAMENTO COMO TERRITORIAL. IMPOSSIBILIDADE DE APLICAÇÃO DE ALÍQUOTA MAIS GRAVOSA DESTINADA A COIBIR ESPECULAÇÃO IMOBILIÁRIA. EXISTÊNCIA DE ALVARÁ DE CONSTRUÇÃO VÁLIDO E EFETIVO ANDAMENTO DAS OBRAS. PRINCÍPIO DA RAZOABILIDADE E DA CAPACIDADE CONTRIBUTIVA. DESCARACTERIZAÇÃO DO IMÓVEL COMO 'NÃO EDIFICADO'. RECURSO PROVIDO.\"\n(Relator: Des. Rogério Kanayama • Julgado Unânime).",
      {
        x: 1.1, y: 2.3, w: 11.0, h: 2.1,
        fontSize: 12, fontFace: FONT_BODY, italic: true, color: C_WHITE, lineSpacing: 18
      }
    );

    // Two Bottom Takeaways
    s.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 4.8, w: 5.6, h: 1.8,
      fill: { color: C_SURFACE },
      line: { color: C_CYAN, width: 1.0 }
    });

    s.addText("PRINCÍPIO DA VERDADE MATERIAL", {
      x: 1.1, y: 5.0, w: 5.0, h: 0.3,
      fontSize: 12, fontFace: FONT_HEAD, bold: true, color: C_CYAN
    });

    s.addText("O Tribunal afasta presunções fazendárias abstratas: provada a realização de obras com alvará, elide-se de pleno direito a presunção de especulação imobiliária.", {
      x: 1.1, y: 5.4, w: 5.0, h: 1.1,
      fontSize: 11, fontFace: FONT_BODY, color: C_WHITE, lineSpacing: 16
    });

    s.addShape(pptx.ShapeType.rect, {
      x: 6.8, y: 4.8, w: 5.6, h: 1.8,
      fill: { color: C_SURFACE },
      line: { color: C_GOLD, width: 1.0 }
    });

    s.addText("EFEITO MERAMENTE DECLARATÓRIO DO HABITE-SE", {
      x: 7.1, y: 5.0, w: 5.0, h: 0.3,
      fontSize: 12, fontFace: FONT_HEAD, bold: true, color: C_GOLD
    });

    s.addText("O Certificado de Conclusão não cria o fato fenomênico da edificação (art. 118 do CTN). O atraso de vistoria dos órgãos urbanísticos não pode punir o contribuinte.", {
      x: 7.1, y: 5.4, w: 5.0, h: 1.1,
      fontSize: 11, fontFace: FONT_BODY, color: C_WHITE, lineSpacing: 16
    });
  }

  // ==========================================
  // SLIDE 8: AS 3 PROPOSTAS DE LEGE FERENDA
  // ==========================================
  {
    const s = createBaseSlide("07. PROPOSTAS DE APERFEIÇOAMENTO LEGISLATIVO", 8, total);

    s.addText("Soluções Normativas de Lege Ferenda para Curitiba", {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, bold: true, color: C_WHITE
    });

    const proposals = [
      {
        num: "PROPOSTA 1",
        tit: "Alíquota Transitória de Fomento à Construção",
        art: "Alteração na LC 40/2001",
        txt: "Criação de benefício de transição automática: durante o prazo de vigência regular do Alvará de Construção, comprovada a execução contínua das obras, aplica-se a alíquota predial não residencial, desonerando o investidor."
      },
      {
        num: "PROPOSTA 2",
        tit: "Desdobro Fiscal Proporcional do Artigo 42",
        art: "Revisão da Regra dos 5%",
        txt: "Permitir em grandes terrenos (galpões, centros logísticos e retroáreas) a tributação mista: a fração de terreno afetada à atividade produtiva recebe alíquota predial, tributando-se como territorial apenas a área ociosa."
      },
      {
        num: "PROPOSTA 3",
        tit: "Eficácia Declaratória do Habite-se Parcial",
        art: "Decreto Municipal Regulamentador",
        txt: "Conferir efeitos fiscais imediatos de enquadramento predial ao protocolo de conclusão estrutural acompanhado de laudo e ART/RRT de engenharia, desonerando o contribuinte da demora nas vistorias municipais."
      }
    ];

    proposals.forEach((p, idx) => {
      const xPos = 0.8 + idx * 4.0;
      s.addShape(pptx.ShapeType.rect, {
        x: xPos, y: 1.6, w: 3.6, h: 4.8,
        fill: { color: C_SURFACE },
        line: { color: C_GOLD, width: 1.3 }
      });

      s.addText(p.num, {
        x: xPos + 0.3, y: 1.9, w: 3.0, h: 0.3,
        fontSize: 11, fontFace: FONT_HEAD, bold: true, color: C_CYAN, charSpacing: 2
      });

      s.addText(p.tit, {
        x: xPos + 0.3, y: 2.3, w: 3.0, h: 0.7,
        fontSize: 14, fontFace: FONT_HEAD, bold: true, color: C_WHITE, lineSpacing: 18
      });

      s.addShape(pptx.ShapeType.line, {
        x: xPos + 0.3, y: 3.1, w: 3.0, h: 0,
        line: { color: C_GOLD, width: 1.0 }
      });

      s.addText(p.art, {
        x: xPos + 0.3, y: 3.3, w: 3.0, h: 0.35,
        fontSize: 11, fontFace: FONT_BODY, bold: true, color: C_YELLOW
      });

      s.addText(p.txt, {
        x: xPos + 0.3, y: 3.8, w: 3.0, h: 2.3,
        fontSize: 11, fontFace: FONT_BODY, color: C_WHITE, lineSpacing: 17
      });
    });
  }

  // ==========================================
  // SLIDE 9: CONCLUSÕES FINAIS & IMPACTO
  // ==========================================
  {
    const s = createBaseSlide("08. CONSIDERAÇÕES FINAIS & SÍNTESE", 9, total);

    s.addText("Conclusão: A Função Social Sem Asfixia Fiscal", {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, bold: true, color: C_WHITE
    });

    s.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 1.6, w: 11.6, h: 4.8,
      fill: { color: C_SURFACE },
      line: { color: C_GOLD, width: 1.5 }
    });

    s.addText("SÍNTESE DOS RESULTADOS ALCANÇADOS:", {
      x: 1.2, y: 1.9, w: 10.8, h: 0.35,
      fontSize: 13, fontFace: FONT_HEAD, bold: true, color: C_GOLD, charSpacing: 1
    });

    s.addText([
      { text: "1. Harmonia entre Arrecadação e Produção:\n", options: { bold: true, color: C_CYAN } },
      { text: "A repressão à especulação imobiliária não se confunde com a asfixia tributária de quem constrói e investe em Curitiba.\n\n", options: { color: C_WHITE } },
      { text: "2. Superação do Anacronismo Formal da LC 40/2001:\n", options: { bold: true, color: C_CYAN } },
      { text: "O apego mecânico ao art. 42 da LC 40/2001 e a demora burocrática do Habite-se sobrecarregam o Judiciário paranaense com litígios desnecessários onde a Fazenda resta sucumbente.\n\n", options: { color: C_WHITE } },
      { text: "3. Concretização da Função Social da Propriedade (CF, art. 182):\n", options: { bold: true, color: C_CYAN } },
      { text: "O verdadeiro cumprimento da função social se dá pela afetação econômica do solo. A verdade material resguarda a justiça fiscal e fomenta a construção civil na capital.", options: { color: C_WHITE } }
    ], {
      x: 1.2, y: 2.4, w: 10.8, h: 3.7,
      fontSize: 13, fontFace: FONT_BODY, lineSpacing: 22
    });
  }

  // ==========================================
  // SLIDE 10: REFERÊNCIAS BIBLIOGRÁFICAS (ABNT NBR 6023)
  // ==========================================
  {
    const s = createBaseSlide("09. REFERÊNCIAS BIBLIOGRÁFICAS", 10, total);

    s.addText("Fontes Doutrinárias e Normativas (ABNT NBR 6023)", {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_HEAD, bold: true, color: C_WHITE
    });

    s.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 1.6, w: 11.6, h: 4.8,
      fill: { color: C_SURFACE },
      line: { color: C_CYAN, width: 1.0 }
    });

    const references = [
      "ALEXANDRE, Ricardo. Direito Tributário. 15. ed. Salvador: Editora Juspodivm, 2021.",
      "AMARO, Luciano. Direito Tributário Brasileiro. 24. ed. São Paulo: Saraiva Educação, 2021.",
      "BRASIL. [Constituição (1988)]. Constituição da República Federativa do Brasil de 1988. Brasília, DF: Presidência da República.",
      "BRASIL. Lei Federal n.º 5.172, de 25 de outubro de 1966. Código Tributário Nacional. Brasília, DF.",
      "BRASIL. Lei Federal n.º 10.257, de 10 de julho de 2001. Estatuto da Cidade. Brasília, DF.",
      "CURITIBA. Lei Complementar Municipal n.º 40, de 18 de dezembro de 2001. Dispõe sobre os tributos municipais. CMC.",
      "CURITIBA. Lei Complementar Municipal n.º 136, de 8 de dezembro de 2022. Planta Genérica de Valores (PGV). CMC.",
      "PARANÁ. Tribunal de Justiça do Paraná. Apelação Cível n.º 0004521-88.2021.8.16.0004. 2ª Câmara Cível. Rel.: Des. Rogério Kanayama. Curitiba.",
      "PAULSEN, Leandro. Curso de Direito Tributário Completo. 12. ed. São Paulo: Saraiva Educação, 2021."
    ];

    s.addText(references.join("\n\n"), {
      x: 1.2, y: 1.9, w: 10.8, h: 4.2,
      fontSize: 10.5, fontFace: FONT_BODY, color: C_WHITE, lineSpacing: 15
    });
  }

  // Generate binary blob
  const output = await pptx.write({ outputType: 'blob' });
  return output as Blob;
}
