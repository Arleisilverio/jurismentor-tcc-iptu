import tccKnowledge from '@/data/tcc_knowledge.json';
import tccPresentation from '@/data/tcc_presentation.json';
import bancaQuestions from '@/data/banca_questions.json';

export interface Chapter {
  numero: string;
  titulo: string;
  resumo: string;
}

export interface Proposal {
  item: number;
  nome: string;
  descricao: string;
}

export interface LegalDevice {
  diploma: string;
  artigos: {
    art: string;
    tema: string;
  }[];
}

export interface PresentationSlide {
  slide: number;
  titulo: string;
  tempo_sugerido: string;
  objetivo: string;
  fala_sugerida: string;
  pontos_chave: string[];
  evitar: string;
}

export interface BancaQuestion {
  id: number;
  pergunta: string;
  examinador_perfil: string;
  nivel_dificuldade: string;
  resposta_ideal: string;
  armadilha_a_evitar: string;
  fundamentos: string[];
}

export const MONOGRAFIA = tccKnowledge.monografia;
export const SLIDES: PresentationSlide[] = tccPresentation.apresentacao.slides;
export const PERGUNTAS_BANCA: BancaQuestion[] = bancaQuestions.perguntas_banca;

export const QUICK_PROMPTS = [
  "Explique a regra dos 5% do art. 42 da LC 40/2001",
  "Qual a diferença do art. 156 para o 182 da CF/88?",
  "Como o TJPR decide sobre obras em andamento?",
  "Quais são as 3 propostas de alteração legislativa?",
  "Faça uma pergunta difícil simulando a banca examinadora",
  "Como rebater a tese da Procuradoria do Município?"
];
