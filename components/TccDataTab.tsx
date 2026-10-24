import React, { useState } from 'react';
import { BookOpen, Scale, Lightbulb, Search, Award, ScrollText, Zap, ChevronDown, ChevronUp, Copy, Check, ShieldCheck, ExternalLink, FileText, Printer, Download, Sparkles } from 'lucide-react';
import { MONOGRAFIA, GRIMORIO_LEIS, LegalArticle } from '@/lib/tccData';
import { ARTIGO_COMPLETO_MD } from '@/lib/artigoData';

export const TccDataTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'artigo' | 'normas' | 'capitulos' | 'propostas'>('artigo');
  const [expandedArticles, setExpandedArticles] = useState<{ [key: string]: boolean }>({
    'Art. 42 da LC 40/2001': true, // Open by default since it's the core of the thesis!
    'Art. 145, § 1º': true,
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleArticle = (key: string) => {
    setExpandedArticles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([ARTIGO_COMPLETO_MD], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ARTIGO_CIENTIFICO_TCC_IPTU_CURITIBA_ABNT.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredChapters = MONOGRAFIA.capitulos.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.resumo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-4">
      {/* Monograph Header Card */}
      <div className="bg-slate-900/95 rounded-2xl p-5 sm:p-6 border border-amber-500/30 shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
              Artigo Científico • TCC
            </span>
            <span className="text-xs sm:text-sm text-slate-300">• 8º Período de Direito</span>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Normas ABNT NBR 6022 & 6023
          </span>
        </div>

        <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
          {MONOGRAFIA.titulo}
        </h2>

        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm sm:text-base text-slate-200 space-y-1.5 leading-relaxed">
          <span className="font-bold text-amber-400 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Problema Central de Pesquisa:</span>
          </span>
          <p>{MONOGRAFIA.problema_central}</p>
        </div>
      </div>

      {/* Section Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveSection('artigo')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-black transition flex items-center gap-1.5 shrink-0 ${
              activeSection === 'artigo'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Artigo Científico</span>
          </button>
          <button
            onClick={() => setActiveSection('normas')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-black transition shrink-0 ${
              activeSection === 'normas'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Leis & Artigos
          </button>
          <button
            onClick={() => setActiveSection('capitulos')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-black transition shrink-0 ${
              activeSection === 'capitulos'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Capítulos
          </button>
          <button
            onClick={() => setActiveSection('propostas')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-black transition shrink-0 ${
              activeSection === 'propostas'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3 Propostas
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar artigo, lei ou tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* 0. SEÇÃO DO ARTIGO CIENTÍFICO COMPLETO */}
      {activeSection === 'artigo' && (
        <div className="space-y-4">
          {/* Action Bar for Printing / Downloading / Copying */}
          <div className="bg-slate-900/95 rounded-2xl p-4 border border-amber-500/35 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Artigo Científico Pronto para Protocolo (ABNT)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Formatado em A4 com margens 3cm/2cm, citações NBR 10520 e referências NBR 6023.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.pdf"
                download="Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.pdf"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Baixar Artigo Completo Revisado em PDF"
              >
                <Download className="w-4 h-4" />
                <span>Baixar PDF</span>
              </a>

              <a
                href="/Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.docx"
                download="Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.docx"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Baixar Artigo Completo Revisado em Word (.docx)"
              >
                <FileText className="w-4 h-4" />
                <span>Word (.docx)</span>
              </a>

              <a
                href="/Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.txt"
                download="Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.txt"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Baixar Texto Puro (.txt)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>TXT</span>
              </a>

              <button
                onClick={handleDownloadMd}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Baixar arquivo Markdown (.md)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>MD</span>
              </button>

              <button
                onClick={() => window.open('/artigo_revisado.html', '_blank')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Abrir versão HTML para impressão ou visualização"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>

              <button
                onClick={() => handleCopyText('artigo_completo', ARTIGO_COMPLETO_MD)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Copiar texto integral em Markdown para a área de transferência"
              >
                {copiedKey === 'artigo_completo' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Academic Article Reader Card */}
          <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6 text-slate-200 font-sans leading-relaxed">
            {/* Title & Author */}
            <div className="text-center border-b border-slate-800 pb-6 space-y-2">
              <h1 className="text-base sm:text-xl font-black text-white uppercase tracking-wide">
                A Tributação dos Imóveis Não Edificados no IPTU de Curitiba: Análise Jurídica dos Critérios de Enquadramento, Transição em Obras e a Função Social da Propriedade Urbana
              </h1>
              <p className="text-sm font-bold text-amber-400">
                Arlei Silvério¹
              </p>
              <p className="text-xs text-slate-400 italic">
                ¹ Acadêmico do 8.º Período do Curso de Bacharelado em Direito. Pesquisador em Direito Tributário e Urbanístico Municipal.
              </p>
            </div>

            {/* Resumo */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs sm:text-sm leading-relaxed">
              <strong className="text-amber-400 uppercase text-xs tracking-wider block">Resumo</strong>
              <p>
                O presente artigo científico analisa criticamente o regime de tributação dos imóveis não edificados no âmbito do Imposto sobre a Propriedade Predial e Territorial Urbana (IPTU) do Município de Curitiba. O ponto nevrálgico da investigação repousa sobre o artigo 42 da Lei Complementar Municipal n.º 40/2001, o qual equipara a imóveis não edificados aqueles com edificação em andamento ou cujo valor da construção não atinja a vigésima parte (5%) do valor venal do terreno, submetendo-os a alíquotas territoriais substancialmente mais gravosas (até 3,5%) em detrimento das alíquotas prediais. Problematiza-se a legalidade e a constitucionalidade da extensão dessa tributação punitiva sobre terrenos com alvará construtivo ativo e obras em andamento físico, bem como a prática da Secretaria Municipal de Finanças (SMFI) de condicionar o reenquadramento predial à expedição formal do Certificado de Vistoria de Conclusão de Obras (CVCO / &quot;Habite-se&quot;). Por meio de metodologia dedutiva e análise empírico-jurisprudencial das 1.ª, 2.ª e 3.ª Câmaras Cíveis de Direito Tributário do Tribunal de Justiça do Estado do Paraná (TJPR), demonstra-se que a jurisprudência paranaense pacificou a prevalência do princípio da verdade material, da capacidade contributiva (art. 145, § 1.º, CF) e da vedação ao confisco (art. 150, IV, CF). Conclui-se que o alvará ativo e o canteiro de obras descaracterizam a retenção especulativa da terra, formulando-se três proposições concretas de <em>lege ferenda</em>.
              </p>
              <p className="pt-1 text-slate-300">
                <strong className="text-amber-400">Palavras-chave:</strong> IPTU. Imóveis Não Edificados. Curitiba. Lei Complementar n.º 40/2001. Verdade Material. Capacidade Contributiva. Função Social da Propriedade.
              </p>
            </div>

            {/* Abstract */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs sm:text-sm leading-relaxed italic text-slate-300">
              <strong className="text-cyan-400 uppercase text-xs tracking-wider block not-italic">Abstract</strong>
              <p>
                This scientific paper provides a critical legal analysis of the taxation regime for vacant and unbuilt urban land under the Urban Property Tax (IPTU) in the Municipality of Curitiba, Brazil. The focal point of the inquiry lies in Article 42 of Municipal Supplementary Law No. 40/2001, which classifies properties with ongoing construction or whose building value does not reach one-twentieth (5%) of the assessed land value as &quot;unbuilt land&quot;, subjecting them to significantly heavier territorial tax rates (up to 3.5%) rather than built property rates. The study addresses the constitutionality and legality of enforcing punitive territorial rates on properties with active building permits and real ongoing construction, alongside the municipal practice of conditioning tax reclassification strictly upon the formal issuance of the Certificate of Building Completion (CVCO / &quot;Habite-se&quot;). Employing a deductive methodology backed by doctrinal, statutory, and empirical case-law research from the specialized Tax Chambers of the Court of Justice of the State of Paraná (TJPR), it demonstrates that judicial precedents uphold the primacy of substantive reality, the principle of ability to pay, and the prohibition of confiscatory taxation.
              </p>
              <p className="pt-1 not-italic">
                <strong className="text-cyan-400">Keywords:</strong> Property Tax (IPTU). Vacant Urban Land. Curitiba. Supplementary Law No. 40/2001. Substantive Reality. Ability to Pay. Social Function of Urban Property.
              </p>
            </div>

            {/* Seções em destaque */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-200">
              <h2 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-1 pt-2">
                1. Introdução e Contextualização
              </h2>
              <p>
                O Imposto sobre a Propriedade Predial e Territorial Urbana (IPTU), de matriz privativa municipal por força do artigo 156, inciso I, da Constituição da República de 1988, conjuga a clássica função fiscal com relevante dimensão extrafiscal de ordenação do espaço urbano (art. 182 da CF; Estatuto da Cidade). Em Curitiba, a LC 40/2001 e a reforma da LC 136/2022 estipulam alíquotas de até 3,5% para terrenos territoriais contra 0,7% a 1,4% para prediais. O problema emerge quando a Fazenda Municipal aplica a alíquota territorial máxima a imóveis providos de alvará ativo e em obras, recusando a conversão predial sem o Habite-se.
              </p>

              <h2 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-1 pt-2">
                2. O Regime Constitucional e a Distinção Dogmática
              </h2>
              <p>
                A progressividade fiscal do art. 156, § 1.º, I e as alíquotas diferenciadas por uso e localização do art. 156, § 1.º, II (após a EC 29/2000) não se confundem com o <strong>IPTU progressivo no tempo</strong> do art. 182, § 4.º, II da CF. Este último é sanção urbanística punitiva que exige expressa inclusão no Plano Diretor, notificação averbada no registro de imóveis e concessão de prazos legais. A tributação territorial em canteiro de obras vulnera a capacidade contributiva (art. 145, § 1.º) e a vedação ao confisco (art. 150, IV).
              </p>

              <h2 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-1 pt-2">
                3. A Ficção do Artigo 42 da LC 40/2001 e a Regra dos 5%
              </h2>
              <p>
                O art. 42 equipara &quot;obra em andamento&quot; a terreno não edificado e desconsidera como predial a construção cujo valor venal não alcance 1/20 (5%) do valor do terreno. Em áreas industriais e logísticas de grande extensão (CIC, Contorno Sul), a nova PGV elevou o valor venal do terreno a dezenas de milhões de reais, tornando impossível para galpões e centros de triagem atingir 5%, ensejando tributação confiscatória desarrazoada.
              </p>

              <h2 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-1 pt-2">
                4. A Resposta do TJPR: Precedente Kanayama e Verdade Material
              </h2>
              <p>
                As 1.ª, 2.ª e 3.ª Câmaras Cíveis de Direito Tributário do TJPR pacificaram que a existência de alvará hígido e a execução real de obras elidem de pleno direito a presunção de especulação imobiliária (Apelação Cível 0004521-88.2021.8.16.0004, Rel. Des. Rogério Kanayama). O Habite-se tem eficácia meramente declaratória; pelo art. 118 do CTN, a verdade material e a destinação produtiva do solo sobrepõem-se à inércia dos órgãos burocráticos municipais.
              </p>

              <h2 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-1 pt-2">
                5. Proposições de Lege Ferenda para Curitiba
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Proposta 1:</strong> Alíquota Transitória de Fomento à Construção na LC 40/2001 (alíquota predial não residencial durante o prazo do alvará ativo);</li>
                <li><strong>Proposta 2:</strong> Desdobro fiscal proporcional da regra dos 5% do art. 42 para grandes terrenos industriais e logísticos superiores a 5.000 m²;</li>
                <li><strong>Proposta 3:</strong> Eficácia declaratória imediata da conclusão estrutural atestada por laudo com ART/RRT de engenharia via Decreto regulamentador.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 1. SEÇÃO DE LEIS & ARTIGOS CLICÁVEIS COM TEXTO INTEGRAL */}
      {activeSection === 'normas' && (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs sm:text-sm text-amber-300 font-medium">
            <span className="flex items-center space-x-2">
              <ScrollText className="w-4 h-4 text-amber-400" />
              <span>Toque em qualquer artigo para expandir o <strong>título exato, texto da lei e impacto no seu TCC</strong>.</span>
            </span>
          </div>

          {GRIMORIO_LEIS.map((diploma, dIdx) => {
            // Filter articles if searching
            const matchingArticles = diploma.artigos.filter(a =>
              a.art.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.texto_integral.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (matchingArticles.length === 0) return null;

            return (
              <div key={dIdx} className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Scale className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                        {diploma.diploma}
                      </h3>
                      <span className="text-xs text-amber-400/80 font-mono font-bold">
                        {diploma.sigla}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {matchingArticles.length} {matchingArticles.length === 1 ? 'dispositivo' : 'dispositivos'}
                  </span>
                </div>

                {/* List of Clickable Article Accordions */}
                <div className="space-y-3 pt-1">
                  {matchingArticles.map((art) => {
                    const isExpanded = !!expandedArticles[art.art];
                    return (
                      <div
                        key={art.art}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isExpanded
                            ? 'bg-slate-950 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                        }`}
                      >
                        {/* Clickable Header Bar */}
                        <button
                          type="button"
                          onClick={() => toggleArticle(art.art)}
                          className="w-full p-4 flex items-center justify-between text-left group"
                        >
                          <div className="space-y-1 pr-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm sm:text-base font-black text-amber-300 group-hover:text-amber-200 transition">
                                {art.art}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                                {art.titulo}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 line-clamp-1 font-medium">
                              {art.texto_integral}
                            </p>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/40 transition shrink-0">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </button>

                        {/* Expanded Full Details */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/80 animate-in fade-in duration-200">
                            {/* Official Full Title */}
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-amber-400/90 uppercase tracking-widest block">
                                Ementa / Título Oficial:
                              </span>
                              <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                                {art.titulo}
                              </h4>
                            </div>

                            {/* Exact Legal Text with large legible font */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Texto Integral da Legislação:
                              </span>
                              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm sm:text-base text-slate-100 font-normal leading-relaxed whitespace-pre-wrap select-text">
                                &ldquo;{art.texto_integral}&rdquo;
                              </div>
                            </div>

                            {/* TCC Practical Application & Impact */}
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-200 space-y-1.5">
                              <div className="flex items-center space-x-1.5 text-amber-400 font-black text-xs sm:text-sm uppercase tracking-wide">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Impacto & Aplicação Prática no seu TCC:</span>
                              </div>
                              <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
                                {art.comentario_tcc}
                              </p>
                            </div>

                            {/* Copy Citation Button */}
                            <div className="flex items-center justify-end pt-1">
                              <button
                                onClick={() => handleCopyText(art.art, `${art.art} - ${art.titulo}\n"${art.texto_integral}"`)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition active:scale-95"
                              >
                                {copiedKey === art.art ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400">Texto Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 text-amber-400" />
                                    <span>Copiar para Citação do TCC</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. SEÇÃO DOS CAPÍTULOS */}
      {activeSection === 'capitulos' && (
        <div className="space-y-3.5">
          {filteredChapters.map((cap, idx) => (
            <div key={idx} className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  {cap.numero}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {cap.titulo}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed pt-1 font-normal">
                {cap.resumo}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 3. SEÇÃO DAS 3 PROPOSTAS */}
      {activeSection === 'propostas' && (
        <div className="space-y-3.5">
          {MONOGRAFIA.propostas_lege_ferenda.map((prop) => (
            <div key={prop.item} className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-amber-500/30 shadow-xl space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-400 font-black text-base sm:text-lg">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span>Proposta {prop.item}: {prop.nome}</span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                {prop.descricao}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
