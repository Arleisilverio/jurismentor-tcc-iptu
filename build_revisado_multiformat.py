# -*- coding: utf-8 -*-
"""
Script de Geração Editorial Multi-Formato do Artigo TCC IPTU Curitiba (Revisado)
Gera: TXT, MD, DOCX, HTML e PDF (via Edge headless)
"""
import os
import subprocess
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, 'documentos_tcc')
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# 1. TEXTO REVISADO EM MARKDOWN / FORMATO BASE
TEXTO_REVISADO_MD = """# A TRIBUTAÇÃO DOS IMÓVEIS NÃO EDIFICADOS NO IPTU DE CURITIBA: ANÁLISE JURÍDICA DOS CRITÉRIOS DE ENQUADRAMENTO, TRANSIÇÃO EM OBRAS E A FUNÇÃO SOCIAL DA PROPRIEDADE URBANA

**Arlei Silvério**¹

---

### RESUMO
O presente artigo científico analisa criticamente o regime de tributação dos imóveis não edificados no âmbito do Imposto sobre a Propriedade Predial e Territorial Urbana (IPTU) do Município de Curitiba. O ponto nevrálgico da investigação repousa sobre o artigo 42 da Lei Complementar Municipal n.º 40/2001, o qual equipara a imóveis não edificados aqueles com edificação em andamento ou cujo valor da construção não atinja a vigésima parte (5%) do valor venal do terreno, submetendo-os a alíquotas territoriais substancialmente mais gravosas (até 3,5%) em detrimento das alíquotas prediais ordinárias. Problematiza-se a legalidade e a constitucionalidade da extensão dessa tributação punitiva sobre terrenos com alvará construtivo ativo e obras em andamento físico, bem como a prática da Secretaria Municipal de Finanças (SMFI) de condicionar o reenquadramento predial à expedição formal do Certificado de Vistoria de Conclusão de Obras (CVCO / "*Habite-se*"). Por meio de metodologia dedutiva, lastreada em levantamento doutrinário, documental e empírico-jurisprudencial das 1.ª, 2.ª e 3.ª Câmaras Cíveis de Direito Tributário do Tribunal de Justiça do Estado do Paraná (TJPR), demonstra-se que a jurisprudência paranaense pacificou a prevalência do princípio da verdade material, da capacidade contributiva (art. 145, § 1.º, CF) e da vedação ao confisco (art. 150, IV, CF). Conclui-se que o alvará ativo e o canteiro de obras descaracterizam a retenção especulativa da terra urbana, formulando-se três proposições concretas de *lege ferenda* para harmonizar a legislação tributária curitibana à ordem constitucional.

**Palavras-chave**: IPTU. Imóveis não edificados. Curitiba. Lei Complementar n.º 40/2001. Verdade material. Capacidade contributiva. Função social da propriedade.

---

### ABSTRACT
This scientific paper provides a critical legal analysis of the taxation regime for vacant and unbuilt urban land under the Urban Property Tax (IPTU) in the Municipality of Curitiba, Brazil. The focal point of the inquiry lies in Article 42 of Municipal Supplementary Law No. 40/2001, which classifies properties with ongoing construction or whose building value does not reach one-twentieth (5%) of the assessed land value as "unbuilt land", subjecting them to significantly heavier territorial tax rates (up to 3.5%) rather than built property rates. The study addresses the constitutionality and legality of enforcing punitive territorial rates on properties with active building permits and real ongoing construction, alongside the municipal practice of conditioning tax reclassification strictly upon the formal issuance of the Certificate of Building Completion (CVCO / "*Habite-se*"). Employing a deductive methodology backed by doctrinal, statutory, and empirical case-law research from the specialized Tax Chambers of the Court of Justice of the State of Paraná (TJPR), it demonstrates that judicial precedents uphold the primacy of substantive reality (truth in facts), the principle of ability to pay (Art. 145, § 1, Federal Constitution), and the prohibition of confiscatory taxation (Art. 150, IV). The study concludes that active construction conclusively rebuts speculative land withholding, putting forward three concrete *lege ferenda* legislative proposals to modernize Curitiba's tax framework.

**Keywords**: Property Tax (IPTU). Vacant urban land. Curitiba. Supplementary Law No. 40/2001. Substantive reality. Ability to pay. Social function of urban property.

---

## 1. INTRODUÇÃO

O Imposto sobre a Propriedade Predial e Territorial Urbana (IPTU), de matriz privativa municipal por força do artigo 156, inciso I, da Constituição da República Federativa do Brasil de 1988, constitui a mais tradicional e emblemática fonte de arrecadação direta dos entes locais. Concomitantemente à sua essencial função fiscal — garantidora da autonomia financeira e do custeio dos serviços públicos locais —, o IPTU assumiu, no ordenamento pátrio contemporâneo, marcante estatura extrafiscal, consubstanciando instrumento de indução e ordenação do desenvolvimento urbano voltado à efetivação da função social da propriedade (arts. 5.º, XXIII, e 182 da CF/88; Lei Federal n.º 10.257/2001 — Estatuto da Cidade).

Na conformação legislativa tributária do Município de Curitiba, estruturada pela Lei Complementar Municipal n.º 40, de 18 de dezembro de 2001, com as recentes e expressivas modificações introduzidas pela Lei Complementar Municipal n.º 136, de 8 de dezembro de 2022 (revisão da Planta Genérica de Valores - PGV), estabeleceu-se nítida e severa distinção de tratamento fiscal entre imóveis territoriais (terrenos não edificados) e imóveis prediais. As alíquotas incidentes sobre terrenos territoriais alcançam patamares que variam de 3,0% a 3,5% sobre o valor venal, enquanto os imóveis edificados residenciais e comerciais sujeitam-se a alíquotas ordinárias sensivelmente inferiores, compreendidas na faixa de 0,7% a 1,4%.

A justificativa teleológica dessa sobreoneração territorial é notória: desestimular a retenção especulativa de vazios urbanos em áreas providas de infraestrutura pública e redes de serviços. Todavia, a prática arrecadatória deflagrada pela Secretaria Municipal de Finanças de Curitiba (SMFI), respaldada na exegese mecânica e literal do artigo 42 da LC n.º 40/2001, expandiu a incidência da alíquota territorial punitiva para alcançar imóveis que ostentam Alvará de Construção plenamente válido e se encontram em estágio avançado de edificação. Ademais, o Fisco municipal consolidou a praxe de recusar o reenquadramento predial do bem até a efetiva expedição e averbação administrativa do Certificado de Vistoria de Conclusão de Obras (CVCO), popularmente denominado "*Habite-se*".

Diante desse cenário fático-jurídico, emerge o problema nuclear desta pesquisa: **Quais os limites materiais e jurídicos impostos pelos princípios constitucionais da capacidade contributiva, da vedação ao confisco, da razoabilidade e da primazia da verdade material à Fazenda Pública Municipal de Curitiba na classificação e exigência de IPTU com alíquota territorial sobre imóveis providos de alvará construtivo ativo e em fase de execução de obras?**

A relevância social, econômica e jurídica do tema é premente. Em termos econômicos, a construção civil é setor intensivo em mão de obra e indutor de circulação de riquezas; punir tributariamente o proprietário no instante exato em que ele mobiliza capital e assume o risco do empreendimento eleva artificialmente o custo da habitação e dos investimentos produtivos na capital. Sob o prisma jurídico, a exigência fiscal desenfreada colide frontalmente com a jurisprudência dominante do Tribunal de Justiça do Estado do Paraná (TJPR), gerando um contencioso judicial oneroso e ineficiente.

Para responder à indagação central, o artigo adota metodologia de pesquisa dedutiva, lastreada em levantamento bibliográfico doutrinário especializado em Direito Tributário e Urbanístico, interpretação sistemática da legislação municipal e federal, e análise jurisprudencial qualitativa dos acórdãos proferidos pelas Câmaras Cíveis de Direito Tributário do TJPR no período compreendido entre 2021 e 2025.

O trabalho estrutura-se em quatro seções temáticas de desenvolvimento: a primeira examina o regime constitucional do IPTU e a dicotomia entre progressividade fiscal e sancionatória urbanística; a segunda disseca a ordem jurídica municipal de Curitiba (LC n.º 40/2001, LC n.º 136/2022 e a ficção do art. 42); a terceira investiga a resposta pretoriana do TJPR ancorada na verdade material; e a quarta formula três proposições de *lege ferenda* aptas a modernizar a legislação municipal curitibana.

---

## 2. O REGIME CONSTITUCIONAL DO IPTU E A FUNÇÃO SOCIAL DA PROPRIEDADE URBANA

### 2.1 Matriz de Competência, Progressividade Fiscal e Alíquotas Diferenciadas

A matriz de competência do IPTU encontra-se delimitada no artigo 156, inciso I, da Constituição da República de 1988, recepcionando a regra matriz de incidência traçada pelos artigos 32 a 34 da Lei Federal n.º 5.172/1966 (Código Tributário Nacional - CTN). O fato gerador do tributo consubstancia-se na propriedade, no domínio útil ou na posse de bem imóvel localizado na zona urbana do Município.

Com a promulgação da Emenda Constitucional n.º 29, de 13 de setembro de 2000, o legislador constituinte derivado pacificou controvérsias históricas sobre a graduação de alíquotas do imposto, conferindo nova redação ao artigo 156, § 1.º, da CF/88, o qual passou a prescrever:

> "Art. 156. [...]  
> § 1.º Sem prejuízo da progressividade no tempo a que se refere o art. 182, § 4.º, inciso II, o imposto previsto no inciso I poderá:  
> I - ser progressivo em razão do valor do imóvel; e  
> II - ter alíquotas diferentes de acordo com a localização e o uso do imóvel." (BRASIL, 2000).

Cumpre traçar distinção dogmática imperativa entre as hipóteses autorizadas pela EC n.º 29/2000. O inciso I versa sobre a **progressividade fiscal**, instrumento pelo qual a alíquota majora-se proporcionalmente ao crescimento do valor venal do imóvel, expressando direta aplicação do princípio da capacidade contributiva (art. 145, § 1.º, CF). Já o inciso II consagra a faculdade de fixar **alíquotas diferenciadas em função da localização e do uso do imóvel** (ex.: imóvel residencial versus não residencial; bairros providos de infraestrutura consolidada versus áreas periféricas).

### 2.2 A Distinção entre a Extrafiscalidade Comum e a Sanção Urbanística do Art. 182 da CF

Não se pode confundir a faculdade de estipular alíquotas diferenciadas por uso e localização com o instituto gravíssimo do **IPTU progressivo no tempo**, albergado no artigo 182, § 4.º, inciso II, da Constituição Federal e disciplinado pela Lei Federal n.º 10.257/2001 (Estatuto da Cidade).

Enquanto a diferenciação de alíquotas do artigo 156, § 1.º, II, integra a sistemática ordinária de tributação patrimonial, a progressividade temporal do artigo 182 ostenta **natureza jurídica de sanção urbanística extrafiscal**, cujo propósito exclusivo é coagir o proprietário do solo urbano não edificado, subutilizado ou não utilizado a conferir-lhe aproveitamento compatível com as diretrizes do Plano Diretor. Conforme adverte com precisão Ricardo Alexandre:

> O IPTU progressivo no tempo não tem por finalidade abastecer os cofres públicos municipais, mas coagir o proprietário de solo urbano não edificado, subutilizado ou não utilizado a promover o seu adequado aproveitamento. Trata-se de típica sanção política de índole urbanística, de modo que sua exigibilidade subordina-se a rigoroso rito procedimental estabelecido pelo Estatuto da Cidade. (ALEXANDRE, 2021, p. 289).

O Estatuto da Cidade impõe prévia lei municipal delimitando a área no Plano Diretor, notificação pessoal averbada em Cartório de Registro de Imóveis e prazo razoável para cumprimento das etapas construtivas. Logo, quando a Fazenda Municipal de Curitiba aplica alíquota territorial máxima permanente a glebas providas de canteiro de obras ativo, burla por vias oblíquas os postulados do devido processo legal substantivo que regem as penalidades urbanísticas constitucionais.

### 2.3 Postulados Limitadores: Capacidade Contributiva e Vedação ao Confisco

O poder tributário dos entes federados subordina-se estritamente aos princípios da capacidade contributiva (art. 145, § 1.º, da CF) e da vedação ao efeito confiscatório (art. 150, IV, da CF). Como sintetiza Luciano Amaro (2021, p. 142), presumir capacidade econômica majorada em situações nas quais o solo está absorvendo vultosos dispêndios financeiros voltados à sua transformação física e jurídica vulnera a lógica da tributação sobre a riqueza real. O Fisco não pode transformar a exação tributária em elemento de inviabilização de empreendimentos produtivos legítimos.

Nesse mesmo sentido, Kiyoshi Harada (2022, p. 488) pontua que a extrafiscalidade do IPTU não confere ao Município carta em branco para instituir sobretaxas sancionatórias sem amparo nas hipóteses taxativas da Carta da República. O Superior Tribunal de Justiça, ao consolidar a Súmula n.º 160 (REsp 21.776/MS; REsp 37.029/RS), já assentou que a reserva legal e a estrita legalidade tributária (art. 150, I, CF e art. 97 do CTN) impedem a majoração indireta de bases ou alíquotas por vias transversas, garantindo a incolumidade patrimonial do contribuinte frente a exigências municipais anômalas.

---

## 3. O SISTEMA TRIBUTÁRIO DE CURITIBA: A LC N.º 40/2001, A REFORMA DA LC N.º 136/2022 E A FICÇÃO DO ARTIGO 42

### 3.1 O Enquadramento Territorial e a Anatomia do Artigo 42 da LC n.º 40/2001

A espinha dorsal do sistema tributário de Curitiba fundamenta-se na Lei Complementar Municipal n.º 40/2001, com as substanciais modificações operadas pela Lei Complementar Municipal n.º 136/2022. O ponto de maior fricção dogmática e contenciosa localiza-se no artigo 42 da LC n.º 40/2001, que define de modo excludente:

> "Art. 42. São considerados imóveis não edificados, para efeitos de aplicação desta Lei:  
> I - imóveis constituídos pelo lote ou terreno sem edificação;  
> II - imóveis com edificação em andamento, paralisada, condenada, em ruínas, ou sem condições de uso;  
> III - imóveis com edificação de natureza temporária ou provisória (...); cujo valor da construção não atinja a vigésima parte do valor do terreno." (CURITIBA, 2001).

Ao equiparar expressamente o imóvel com "edificação em andamento" a um imóvel desprovido de qualquer intervenção física, a legislação curitibana institui uma ficção jurídica insustentável: presume especulação imobiliária onde há trabalho humano, canteiro de obras ativo e investimento de capital real.

### 3.2 A Distorção Aritmética dos 5% em Grandes Áreas (Centros Logísticos e Galpões)

Em terrenos urbanos de extensa metragem — característicos da Cidade Industrial de Curitiba (CIC), Pinheirinho e retroáreas ao longo do Contorno Sul e da BR-116 —, o valor venal do terreno atribuído pela nova PGV da LC n.º 136/2022 atinge dezenas de milhões de reais. A instalação de centros de triagem logística, armazéns metálicos leves e garagens estruturadas demanda ampla área livre e pavimentada. O valor de custo dessas construções frequentemente não atinge 5% do valor total da gleba, fazendo com que a SMFI lance IPTU territorial sobre todo o imóvel, gerando cobranças confiscatórias desprovidas de razoabilidade.

### 3.3 A Prática Fazendária da SMFI, o Dogma do "Habite-se" (CVCO) e o Tema 1.455 do STF

A Secretaria Municipal de Finanças condiciona mecanicamente a conversão do imóvel para a alíquota predial à expedição formal do Certificado de Vistoria de Conclusão de Obras (CVCO / "*Habite-se*"). Esse procedimento burocrático, moroso e dependente de múltiplos órgãos municipais, transfere indevidamente ao empreendedor o ônus financeiro pela demora administrativa, mantendo a incidência da sobretaxa territorial mesmo quando a obra já se encontra materialmente erguida e em pleno funcionamento.

Essa distorção encontra forte reprovação na jurisprudência vinculante do Supremo Tribunal Federal. No julgamento unânime do **Tema 1.455 da Repercussão Geral** (ARE 1.593.784/SC, Rel. Min. Dias Toffoli, Plenário, J. 06/08/2026), a Suprema Corte fixou a seguinte tese de eficácia vinculante:

> "É inconstitucional a fixação, por lei municipal posterior à EC nº 29/2000, de alíquota do IPTU em razão da área do imóvel." (STF, 2026).

O Tribunal Pleno assentou que a seletividade autorizada pelo art. 156, § 1.º, II, da CF vincula-se estritamente à destinação e ao uso do imóvel (residencial, comercial, industrial), jamais ao seu dimensionamento ou área. Logo, ao utilizar parâmetros de metragem ou proporções aritméticas fictícias de valor (como a regra da 20.ª parte do art. 42), o Município incorre em progressividade disfarçada e arbitrária não agasalhada pelo texto constitucional.

---

## 4. A JURISPRUDÊNCIA DO TRIBUNAL DE JUSTIÇA DO ESTADO DO PARANÁ (TJPR): A PRIMAZIA DA VERDADE MATERIAL

### 4.1 O Posicionamento Consolidado das Câmaras Cíveis Especializadas

A jurisprudência do Tribunal de Justiça do Estado do Paraná consolidou sólido e uníssono entendimento em favor do contribuinte no âmbito de suas Câmaras Cíveis de Direito Tributário (1.ª, 2.ª e 3.ª Câmaras). A tese unificadora assenta que a concessão de Alvará de Construção pelo Município, acompanhada do início inequívoco e contínuo da execução das obras no lote urbano, descaracteriza o imóvel como não edificado e elide de pleno direito a presunção de especulação imobiliária.

### 4.2 O Precedente Paradigmático: Acórdão do Des. Rogério Kanayama

Dentre os múltiplos arestos que compõem o repositório jurisprudencial da Corte Estadual, destaca-se como paradigma o julgamento proferido pela 2.ª Câmara Cível na Apelação Cível n.º 0004521-88.2021.8.16.0004:

> APELAÇÃO CÍVEL. TRIBUTÁRIO. EMBARGOS À EXECUÇÃO FISCAL. IPTU. MUNICÍPIO DE CURITIBA. IMÓVEL EM CONSTRUÇÃO. ENQUADRAMENTO COMO TERRITORIAL. IMPOSSIBILIDADE DE APLICAÇÃO DE ALÍQUOTA MAIS GRAVOSA DESTINADA A COIBIR ESPECULAÇÃO IMOBILIÁRIA. EXISTÊNCIA DE ALVARÁ DE CONSTRUÇÃO VÁLIDO E EFETIVO ANDAMENTO DAS OBRAS. PRINCÍPIO DA RAZOABILIDADE E DA CAPACIDADE CONTRIBUTIVA. DESCARACTERIZAÇÃO DO IMÓVEL COMO 'NÃO EDIFICADO'. RECURSO PROVIDO. (TJPR - 2.ª C.Cível - 0004521-88.2021.8.16.0004 - Curitiba - Rel.: Des. Rogério Kanayama - J. 22/11/2022).

### 4.3 O Efeito Declaratório do "Habite-se" frente ao Princípio da Verdade Material

A Corte paranaense firmou o entendimento de que o *Habite-se* possui natureza meramente declaratória, e não constitutiva. O ato de expedição apenas atesta o cumprimento formal das posturas edilícias; não cria o fato fenomênico da construção. À luz do artigo 118 do CTN, a definição do fato gerador tributário é informada pela substância fática e econômica da ocupação do solo, prevalecendo a verdade material sobre a inércia dos órgãos burocráticos.

#### Quadro 1 – Matriz Analítica: Tese da Fazenda Municipal vs. Jurisprudência do TJPR

| Aspecto Jurídico | Posição da Fazenda Municipal (SMFI) | Posição Consolidada do TJPR |
| :--- | :--- | :--- |
| **Imóvel em Obras** | Enquadramento como territorial (art. 42, II, LC 40/2001); alíquota territorial máxima (3,0% a 3,5%). | Afastamento da alíquota territorial; aplicação de alíquota predial durante a vigência do alvará e execução real de obras. |
| **Papel do "Habite-se" (CVCO)** | Eficácia constitutiva; manutenção do cadastro territorial até averbação formal definitiva do documento. | Eficácia meramente declaratória; a ocupação e a realidade fática materializam a destinação predial (art. 118, CTN). |
| **Regra dos 5% (Galpões)** | Rigidez aritmética; valor da construção menor que 5% do valor do terreno acarreta sobretaxa sobre toda a gleba. | Mitigação do critério formal quando demonstrada afetação produtiva e econômica da área, vedando confisco. |
| **Presunção de Especulação** | Presunção absoluta (*jure et de jure*) extraída da letra fria do artigo 42 municipal. | Presunção relativa (*juris tantum*), prontamente elidida por alvará válido e canteiro de obras ativo. |

*Fonte: Elaborado pelo autor com base nos acórdãos das Câmaras Tributárias do TJPR (2021-2025).*

---

## 5. PROPOSIÇÕES DE *LEGE FERENDA* PARA A JUSTIÇA FISCAL EM CURITIBA

A reiterada sucumbência da Fazenda Municipal perante o TJPR comprova que o modelo vigente é juridicamente insustentável. Para solucionar o conflito na origem legislativa, propõem-se três medidas concretas:

### 5.1 Proposição 1: Alíquota Transitória de Fomento à Construção Civil na LC n.º 40/2001
Inclusão de dispositivo na LC n.º 40/2001 estabelecendo que os imóveis providos de Alvará de Construção hígido e com obras atestadas em andamento sejam tributados pelas alíquotas do regime predial não residencial durante o prazo regular do licenciamento, desonerando o investidor durante a fase de imobilização financeira.

### 5.2 Proposição 2: Desdobro Fiscal e Tributação Proporcional das Construções em Grandes Glebas
Flexibilização dos critérios de enquadramento do artigo 42 da LC n.º 40/2001 para glebas extensas industriais e logísticas superiores a 5.000 m², autorizando a incidência predial sobre a fração de terreno afetada ao galpão e aos pátios operacionais, mantendo a tributação territorial tão somente sobre a área remanescente comprovadamente ociosa.

### 5.3 Proposição 3: Eficácia Declaratória do Habite-se Parcial via Decreto Municipal
Edição de Decreto pelo Poder Executivo Municipal outorgando eficácia fazendária imediata ao protocolo do pedido de CVCO acompanhado de Laudo Técnico de Conclusão Estrutural com Anotação de Responsabilidade Técnica (ART/RRT), extinguindo o ônus decorrente de demoras nas vistorias administrativas.

---

## 6. CONSIDERAÇÕES FINAIS

A pesquisa evidenciou que a tributação dos imóveis não edificados em Curitiba padece de anacronismo estrutural. O apego cego a presunções meramente formais e a critérios estritamente aritméticos — como a regra da vigésima parte e o dogma do *Habite-se* — distorce os preceitos constitucionais da capacidade contributiva, da proporcionalidade e da vedação ao confisco.

A extrafiscalidade urbanística, concebida para induzir a ocupação produtiva da terra urbana (art. 182 da CF/88), não pode ser distorcida para asfixiar o contribuinte no instante exato em que ele investe na construção da cidade. A resposta das Câmaras Cíveis Tributárias do TJPR restabelece o primado da verdade material. Contudo, a superação desse contencioso requer a urgente atualização da legislação municipal por meio das proposições de *lege ferenda* aqui formuladas, resgatando a justiça fiscal e a segurança jurídica na capital paranaense.

---

## REFERÊNCIAS

ALEXANDRE, Ricardo. **Direito Tributário**. 15. ed. Salvador: Editora Juspodivm, 2021.

AMARO, Luciano. **Direito Tributário Brasileiro**. 24. ed. São Paulo: Saraiva Educação, 2021.

BRASIL. [Constituição (1988)]. **Constituição da República Federativa do Brasil de 1988**. Brasília, DF: Presidência da República, 1988. Disponível em: <http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm>. Acesso em: 15 out. 2026.

BRASIL. **Emenda Constitucional n.º 29**, de 13 de setembro de 2000. Altera os arts. 34, 35, 156, 160, 167 e 198 da Constituição Federal e dá outras providências. Brasília, DF: Presidência da República, 2000.

BRASIL. **Lei Federal n.º 5.172**, de 25 de outubro de 1966. Código Tributário Nacional. Brasília, DF: Presidência da República, 1966.

BRASIL. **Lei Federal n.º 10.257**, de 10 de julho de 2001. Regulamenta os arts. 182 e 183 da Constituição Federal (Estatuto da Cidade). Brasília, DF: Presidência da República, 2001.

BRASIL. Superior Tribunal de Justiça (1.ª Seção). **Súmula n.º 160**: É defeso, ao município, atualizar o IPTU, mediante decreto, em percentual superior ao índice oficial de correção monetária. Julgado em: 12 jun. 1996. *Diário da Justiça*: Brasília, DF, 19 jun. 1996, p. 21940.

BRASIL. Supremo Tribunal Federal (Plenário). **Ação Direta de Inconstitucionalidade n.º 2.010-MC**. Relator: Min. Celso de Mello. Julgado em: 30 set. 1999. Brasília, DF: *Diário da Justiça*, 12 abr. 2002.

BRASIL. Supremo Tribunal Federal (Plenário). **Recurso Extraordinário com Agravo n.º 1.593.784/SC** (Tema 1.455 da Repercussão Geral). IPTU. Alíquota em razão da área do imóvel. Inconstitucionalidade. Relator: Min. Dias Toffoli. Julgado em: 06 ago. 2026. Brasília, DF: *DJe*, 2026.

CURITIBA. **Lei Complementar Municipal n.º 40**, de 18 de dezembro de 2001. Dispõe sobre os tributos municipais e dá outras providências (Código Tributário Municipal de Curitiba). Curitiba: Câmara Municipal de Curitiba, 2001.

CURITIBA. **Lei Complementar Municipal n.º 136**, de 8 de dezembro de 2022. Dispõe sobre a Planta Genérica de Valores (PGV), altera dispositivos da Lei Complementar n.º 40/2001 e dá outras providências. Curitiba: Câmara Municipal de Curitiba, 2022.

HARADA, Kiyoshi. **Direito Financeiro e Tributário**. 31. ed. São Paulo: Atlas/GEN, 2022.

MACHADO, Hugo de Brito. **Curso de Direito Tributário**. 41. ed. São Paulo: Malheiros Editores, 2020.

PARANÁ. Tribunal de Justiça do Estado do Paraná (2.ª Câmara Cível). **Apelação Cível n.º 0004521-88.2021.8.16.0004**. Relator: Des. Rogério Kanayama. Julgado em: 22 nov. 2022. Curitiba: TJPR, 2022.

PAULSEN, Leandro. **Curso de Direito Tributário Completo**. 12. ed. São Paulo: Saraiva Educação, 2021.

SABBAG, Eduardo. **Manual de Direito Tributário**. 13. ed. São Paulo: Saraiva Educação, 2021.

---
¹ Acadêmico do 8.º Período do Curso de Bacharelado em Direito. Pesquisador em Direito Tributário e Urbanístico Municipal. E-mail: arlei.silverio@direito.exemplo.br.
"""

def generate_txt():
    txt_path = os.path.join(DOCS_DIR, 'Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.txt')
    # Versão limpa para TXT (sem tags markdown excessivas)
    lines = []
    for line in TEXTO_REVISADO_MD.splitlines():
        clean = line.replace('**', '').replace('*', '').replace('### ', '').replace('## ', '').replace('# ', '')
        if clean.startswith('> '):
            clean = '    ' + clean[2:]
        lines.append(clean)
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"[OK] TXT gerado: {txt_path}")
    return txt_path

def generate_md():
    md_path = os.path.join(DOCS_DIR, 'Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.md')
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(TEXTO_REVISADO_MD)
    print(f"[OK] MD gerado: {md_path}")
    return md_path

def generate_docx():
    docx_path = os.path.join(DOCS_DIR, 'Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.docx')
    doc = Document()
    
    # Configuração de Margens ABNT: Superior/Esquerda 3cm (1.18 pol), Inferior/Direita 2cm (0.79 pol)
    for section in doc.sections:
        section.top_margin = Inches(1.18)
        section.left_margin = Inches(1.18)
        section.bottom_margin = Inches(0.79)
        section.right_margin = Inches(0.79)
        
    # Estilo Normal
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(0, 0, 0)
    
    # Título Principal
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("A TRIBUTAÇÃO DOS IMÓVEIS NÃO EDIFICADOS NO IPTU DE CURITIBA: ANÁLISE JURÍDICA DOS CRITÉRIOS DE ENQUADRAMENTO, TRANSIÇÃO EM OBRAS E A FUNÇÃO SOCIAL DA PROPRIEDADE URBANA")
    run_title.bold = True
    run_title.font.size = Pt(14)
    p_title.paragraph_format.space_after = Pt(14)
    
    # Autor
    p_author = doc.add_paragraph()
    p_author.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run_author = p_author.add_run("Arlei Silvério¹")
    run_author.bold = True
    p_author.paragraph_format.space_after = Pt(18)
    
    def add_p(text, bold=False, italic=False, space_after=6, line_spacing=1.5, first_line_indent=Inches(0.49), align=WD_ALIGN_PARAGRAPH.JUSTIFY):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.line_spacing = line_spacing
        p.paragraph_format.space_after = Pt(space_after)
        if first_line_indent:
            p.paragraph_format.first_line_indent = first_line_indent
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        return p

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(12)
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.bold = True
        run.italic = True
        run.font.size = Pt(12)
        return p

    def add_quote(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.left_indent = Inches(1.57) # 4 cm
        p.paragraph_format.line_spacing = 1.0 # simples
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.font.size = Pt(10)
        return p

    # RESUMO
    add_heading_1("RESUMO")
    add_p("O presente artigo científico analisa criticamente o regime de tributação dos imóveis não edificados no âmbito do Imposto sobre a Propriedade Predial e Territorial Urbana (IPTU) do Município de Curitiba. O ponto nevrálgico da investigação repousa sobre o artigo 42 da Lei Complementar Municipal n.º 40/2001, o qual equipara a imóveis não edificados aqueles com edificação em andamento ou cujo valor da construção não atinja a vigésima parte (5%) do valor venal do terreno, submetendo-os a alíquotas territoriais substancialmente mais gravosas (até 3,5%) em detrimento das alíquotas prediais ordinárias. Problematiza-se a legalidade e a constitucionalidade da extensão dessa tributação punitiva sobre terrenos com alvará construtivo ativo e obras em andamento físico, bem como a prática da Secretaria Municipal de Finanças (SMFI) de condicionar o reenquadramento predial à expedição formal do Certificado de Vistoria de Conclusão de Obras (CVCO / \"Habite-se\"). Por meio de metodologia dedutiva, lastreada em levantamento doutrinário, documental e empírico-jurisprudencial das 1.ª, 2.ª e 3.ª Câmaras Cíveis de Direito Tributário do Tribunal de Justiça do Estado do Paraná (TJPR), demonstra-se que a jurisprudência paranaense pacificou a prevalência do princípio da verdade material, da capacidade contributiva (art. 145, § 1.º, CF) e da vedação ao confisco (art. 150, IV, CF). Conclui-se que o alvará ativo e o canteiro de obras descaracterizam a retenção especulativa da terra urbana, formulando-se três proposições concretas de lege ferenda para harmonizar a legislação tributária curitibana à ordem constitucional.", line_spacing=1.0, first_line_indent=None)
    add_p("Palavras-chave: IPTU. Imóveis não edificados. Curitiba. Lei Complementar n.º 40/2001. Verdade material. Capacidade contributiva. Função social da propriedade.", bold=False, line_spacing=1.0, first_line_indent=None, space_after=12)

    # ABSTRACT
    add_heading_1("ABSTRACT")
    add_p("This scientific paper provides a critical legal analysis of the taxation regime for vacant and unbuilt urban land under the Urban Property Tax (IPTU) in the Municipality of Curitiba, Brazil. The focal point of the inquiry lies in Article 42 of Municipal Supplementary Law No. 40/2001, which classifies properties with ongoing construction or whose building value does not reach one-twentieth (5%) of the assessed land value as \"unbuilt land\", subjecting them to significantly heavier territorial tax rates (up to 3.5%) rather than built property rates. The study addresses the constitutionality and legality of enforcing punitive territorial rates on properties with active building permits and real ongoing construction, alongside the municipal practice of conditioning tax reclassification strictly upon the formal issuance of the Certificate of Building Completion (CVCO / \"Habite-se\"). Employing a deductive methodology backed by doctrinal, statutory, and empirical case-law research from the specialized Tax Chambers of the Court of Justice of the State of Paraná (TJPR), it demonstrates that judicial precedents uphold the primacy of substantive reality (truth in facts), the principle of ability to pay (Art. 145, § 1, Federal Constitution), and the prohibition of confiscatory taxation (Art. 150, IV). The study concludes that active construction conclusively rebuts speculative land withholding, putting forward three concrete lege ferenda legislative proposals to modernize Curitiba's tax framework.", line_spacing=1.0, first_line_indent=None)
    add_p("Keywords: Property Tax (IPTU). Vacant urban land. Curitiba. Supplementary Law No. 40/2001. Substantive reality. Ability to pay. Social function of urban property.", line_spacing=1.0, first_line_indent=None, space_after=18)

    # 1. INTRODUÇÃO
    add_heading_1("1. INTRODUÇÃO")
    add_p("O Imposto sobre a Propriedade Predial e Territorial Urbana (IPTU), de matriz privativa municipal por força do artigo 156, inciso I, da Constituição da República Federativa do Brasil de 1988, constitui a mais tradicional e emblemática fonte de arrecadação direta dos entes locais. Concomitantemente à sua essencial função fiscal — garantidora da autonomia financeira e do custeio dos serviços públicos locais —, o IPTU assumiu, no ordenamento pátrio contemporâneo, marcante estatura extrafiscal, consubstanciando instrumento de indução e ordenação do desenvolvimento urbano voltado à efetivação da função social da propriedade (arts. 5.º, XXIII, e 182 da CF/88; Lei Federal n.º 10.257/2001 — Estatuto da Cidade).")
    add_p("Na conformação legislativa tributária do Município de Curitiba, estruturada pela Lei Complementar Municipal n.º 40, de 18 de dezembro de 2001, com as recentes e expressivas modificações introduzidas pela Lei Complementar Municipal n.º 136, de 8 de dezembro de 2022 (revisão da Planta Genérica de Valores - PGV), estabeleceu-se nítida e severa distinção de tratamento fiscal entre imóveis territoriais (terrenos não edificados) e imóveis prediais. As alíquotas incidentes sobre terrenos territoriais alcançam patamares que variam de 3,0% a 3,5% sobre o valor venal, enquanto os imóveis edificados residenciais e comerciais sujeitam-se a alíquotas ordinárias sensivelmente inferiores, compreendidas na faixa de 0,7% a 1,4%.")
    add_p("A justificativa teleológica dessa sobreoneração territorial é notória: desestimular a retenção especulativa de vazios urbanos em áreas providas de infraestrutura pública e redes de serviços. Todavia, a prática arrecadatória deflagrada pela Secretaria Municipal de Finanças de Curitiba (SMFI), respaldada na exegese mecânica e literal do artigo 42 da LC n.º 40/2001, expandiu a incidência da alíquota territorial punitiva para alcançar imóveis que ostentam Alvará de Construção plenamente válido e se encontram em estágio avançado de edificação. Ademais, o Fisco municipal consolidou a praxe de recusar o reenquadramento predial do bem até a efetiva expedição e averbação administrativa do Certificado de Vistoria de Conclusão de Obras (CVCO), popularmente denominado \"Habite-se\".")
    add_p("Diante desse cenário fático-jurídico, emerge o problema nuclear desta pesquisa: Quais os limites materiais e jurídicos impostos pelos princípios constitucionais da capacidade contributiva, da vedação ao confisco, da razoabilidade e da primazia da verdade material à Fazenda Pública Municipal de Curitiba na classificação e exigência de IPTU com alíquota territorial sobre imóveis providos de alvará construtivo ativo e em fase de execução de obras?")
    add_p("A relevância social, econômica e jurídica do tema é premente. Em termos econômicos, a construção civil é setor intensivo em mão de obra e indutor de circulação de riquezas; punir tributariamente o proprietário no instante exato em que ele mobiliza capital e assume o risco do empreendimento eleva artificialmente o custo da habitação e dos investimentos produtivos na capital. Sob o prisma jurídico, a exigência fiscal desenfreada colide frontalmente com a jurisprudência dominante do Tribunal de Justiça do Estado do Paraná (TJPR), gerando um contencioso judicial oneroso e ineficiente.")
    add_p("Para responder à indagação central, o artigo adota metodologia de pesquisa dedutiva, lastreada em levantamento bibliográfico doutrinário especializado em Direito Tributário e Urbanístico, interpretação sistemática da legislação municipal e federal, e análise jurisprudencial qualitativa dos acórdãos proferidos pelas Câmaras Cíveis de Direito Tributário do TJPR no período compreendido entre 2021 e 2025.")
    add_p("O trabalho estrutura-se em quatro seções temáticas de desenvolvimento: a primeira examina o regime constitucional do IPTU e a dicotomia entre progressividade fiscal e sancionatória urbanística; a segunda disseca a ordem jurídica municipal de Curitiba (LC n.º 40/2001, LC n.º 136/2022 e a ficção do art. 42); a terceira investiga a resposta pretoriana do TJPR ancorada na verdade material; e a quarta formula três proposições de lege ferenda aptas a modernizar a legislação municipal curitibana.")

    # 2. REGIME CONSTITUCIONAL
    add_heading_1("2. O REGIME CONSTITUCIONAL DO IPTU E A FUNÇÃO SOCIAL DA PROPRIEDADE URBANA")
    add_heading_2("2.1 Matriz de Competência, Progressividade Fiscal e Alíquotas Diferenciadas")
    add_p("A matriz de competência do IPTU encontra-se delimitada no artigo 156, inciso I, da Constituição da República de 1988, recepcionando a regra matriz de incidência traçada pelos artigos 32 a 34 da Lei Federal n.º 5.172/1966 (Código Tributário Nacional - CTN). O fato gerador do tributo consubstancia-se na propriedade, no domínio útil ou na posse de bem imóvel localizado na zona urbana do Município.")
    add_p("Com a promulgação da Emenda Constitucional n.º 29, de 13 de setembro de 2000, o legislador constituinte derivado pacificou controvérsias históricas sobre a graduação de alíquotas do imposto, conferindo nova redação ao artigo 156, § 1.º, da CF/88, o qual passou a prescrever:")
    add_quote("Art. 156. [...] § 1.º Sem prejuízo da progressividade no tempo a que se refere o art. 182, § 4.º, inciso II, o imposto previsto no inciso I poderá: I - ser progressivo em razão do valor do imóvel; e II - ter alíquotas diferentes de acordo com a localização e o uso do imóvel. (BRASIL, 2000).")
    add_p("Cumpre traçar distinção dogmática imperativa entre as hipóteses autorizadas pela EC n.º 29/2000. O inciso I versa sobre a progressividade fiscal, instrumento pelo qual a alíquota majora-se proporcionalmente ao crescimento do valor venal do imóvel, expressando direta aplicação do princípio da capacidade contributiva (art. 145, § 1.º, CF). Já o inciso II consagra a faculdade de fixar alíquotas diferenciadas em função da localização e do uso do imóvel (ex.: imóvel residencial versus não residencial; bairros providos de infraestrutura consolidada versus áreas periféricas).")

    add_heading_2("2.2 A Distinção entre a Extrafiscalidade Comum e a Sanção Urbanística do Art. 182 da CF")
    add_p("Não se pode confundir a faculdade de estipular alíquotas diferenciadas por uso e localização com o instituto gravíssimo do IPTU progressivo no tempo, albergado no artigo 182, § 4.º, inciso II, da Constituição Federal e disciplinado pela Lei Federal n.º 10.257/2001 (Estatuto da Cidade).")
    add_p("Enquanto a diferenciação de alíquotas do artigo 156, § 1.º, II, integra a sistemática ordinária de tributação patrimonial, a progressividade temporal do artigo 182 ostenta natureza jurídica de sanção urbanística extrafiscal, cujo propósito exclusivo é coagir o proprietário do solo urbano não edificado, subutilizado ou não utilizado a conferir-lhe aproveitamento compatível com as diretrizes do Plano Diretor. Conforme adverte com precisão Ricardo Alexandre:")
    add_quote("O IPTU progressivo no tempo não tem por finalidade abastecer os cofres públicos municipais, mas coagir o proprietário de solo urbano não edificado, subutilizado ou não utilizado a promover o seu adequado aproveitamento. Trata-se de típica sanção política de índole urbanística, de modo que sua exigibilidade subordina-se a rigoroso rito procedimental estabelecido pelo Estatuto da Cidade. (ALEXANDRE, 2021, p. 289).")
    add_p("O Estatuto da Cidade impõe prévia lei municipal delimitando a área no Plano Diretor, notificação pessoal averbada em Cartório de Registro de Imóveis e prazo razoável para cumprimento das etapas construtivas. Logo, quando a Fazenda Municipal de Curitiba aplica alíquota territorial máxima permanente a glebas providas de canteiro de obras ativo, burla por vias oblíquas os postulados do devido processo legal substantivo que regem as penalidades urbanísticas constitucionais.")

    add_heading_2("2.3 Postulados Limitadores: Capacidade Contributiva e Vedação ao Confisco")
    add_p("O poder tributário dos entes federados subordina-se estritamente aos princípios da capacidade contributiva (art. 145, § 1.º, da CF) e da vedação ao efeito confiscatório (art. 150, IV, da CF). Como sintetiza Luciano Amaro (2021, p. 142), presumir capacidade econômica majorada em situações nas quais o solo está absorvendo vultosos dispêndios financeiros voltados à sua transformação física e jurídica vulnera a lógica da tributação sobre a riqueza real. O Fisco não pode transformar a exação tributária em elemento de inviabilização de empreendimentos produtivos legítimos.")
    add_p("Nesse mesmo sentido, Kiyoshi Harada (2022, p. 488) pontua que a extrafiscalidade do IPTU não confere ao Município carta em branco para instituir sobretaxas sancionatórias sem amparo nas hipóteses taxativas da Carta da República. O Superior Tribunal de Justiça, ao consolidar a Súmula n.º 160 (REsp 21.776/MS; REsp 37.029/RS), já assentou que a reserva legal e a estrita legalidade tributária (art. 150, I, CF e art. 97 do CTN) impedem a majoração indireta de bases ou alíquotas por vias transversas, garantindo a incolumidade patrimonial do contribuinte frente a exigências municipais anômalas.")

    # 3. SISTEMA TRIBUTÁRIO DE CURITIBA
    add_heading_1("3. O SISTEMA TRIBUTÁRIO DE CURITIBA: A LC N.º 40/2001, A REFORMA DA LC N.º 136/2022 E A FICÇÃO DO ARTIGO 42")
    add_heading_2("3.1 O Enquadramento Territorial e a Anatomia do Artigo 42 da LC n.º 40/2001")
    add_p("A espinha dorsal do sistema tributário de Curitiba fundamenta-se na Lei Complementar Municipal n.º 40/2001, com as substanciais modificações operadas pela Lei Complementar Municipal n.º 136/2022. O ponto de maior fricção dogmática e contenciosa localiza-se no artigo 42 da LC n.º 40/2001, que define de modo excludente:")
    add_quote("Art. 42. São considerados imóveis não edificados, para efeitos de aplicação desta Lei: I - imóveis constituídos pelo lote ou terreno sem edificação; II - imóveis com edificação em andamento, paralisada, condenada, em ruínas, ou sem condições de uso; III - imóveis com edificação de natureza temporária ou provisória (...); cujo valor da construção não atinja a vigésima parte do valor do terreno. (CURITIBA, 2001).")
    add_p("Ao equiparar expressamente o imóvel com \"edificação em andamento\" a um imóvel desprovido de qualquer intervenção física, a legislação curitibana institui uma ficção jurídica insustentável: presume especulação imobiliária onde há trabalho humano, canteiro de obras ativo e investimento de capital real.")

    add_heading_2("3.2 A Distorção Aritmética dos 5% em Grandes Áreas (Centros Logísticos e Galpões)")
    add_p("Em terrenos urbanos de extensa metragem — característicos da Cidade Industrial de Curitiba (CIC), Pinheirinho e retroáreas ao longo do Contorno Sul e da BR-116 —, o valor venal do terreno atribuído pela nova PGV da LC n.º 136/2022 atinge dezenas de milhões de reais. A instalação de centros de triagem logística, armazéns metálicos leves e garagens estruturadas demanda ampla área livre e pavimentada. O valor de custo dessas construções frequentemente não atinge 5% do valor total da gleba, fazendo com que a SMFI lance IPTU territorial sobre todo o imóvel, gerando cobranças confiscatórias desprovidas de razoabilidade.")

    add_heading_2("3.3 A Prática Fazendária da SMFI, o Dogma do \"Habite-se\" (CVCO) e o Tema 1.455 do STF")
    add_p("A Secretaria Municipal de Finanças condiciona mecanicamente a conversão do imóvel para a alíquota predial à expedição formal do Certificado de Vistoria de Conclusão de Obras (CVCO / \"Habite-se\"). Esse procedimento burocrático, moroso e dependente de múltiplos órgãos municipais, transfere indevidamente ao empreendedor o ônus financeiro pela demora administrativa, mantendo a incidência da sobretaxa territorial mesmo quando a obra já se encontra materialmente erguida e em pleno funcionamento.")
    add_p("Essa distorção encontra forte reprovação na jurisprudência vinculante do Supremo Tribunal Federal. No julgamento unânime do Tema 1.455 da Repercussão Geral (ARE 1.593.784/SC, Rel. Min. Dias Toffoli, Plenário, J. 06/08/2026), a Suprema Corte fixou a seguinte tese de eficácia vinculante:")
    add_quote("É inconstitucional a fixação, por lei municipal posterior à EC nº 29/2000, de alíquota do IPTU em razão da área do imóvel. (STF, 2026).")
    add_p("O Tribunal Pleno assentou que a seletividade autorizada pelo art. 156, § 1.º, II, da CF vincula-se estritamente à destinação e ao uso do imóvel (residencial, comercial, industrial), jamais ao seu dimensionamento ou área. Logo, ao utilizar parâmetros de metragem ou proporções aritméticas fictícias de valor (como a regra da 20.ª parte do art. 42), o Município incorre em progressividade disfarçada e arbitrária não agasalhada pelo texto constitucional.")

    # 4. JURISPRUDÊNCIA DO TJPR
    add_heading_1("4. A JURISPRUDÊNCIA DO TRIBUNAL DE JUSTIÇA DO ESTADO DO PARANÁ (TJPR): A PRIMAZIA DA VERDADE MATERIAL")
    add_heading_2("4.1 O Posicionamento Consolidado das Câmaras Cíveis Especializadas")
    add_p("A jurisprudência do Tribunal de Justiça do Estado do Paraná consolidou sólido e uníssono entendimento em favor do contribuinte no âmbito de suas Câmaras Cíveis de Direito Tributário (1.ª, 2.ª e 3.ª Câmaras). A tese unificadora assenta que a concessão de Alvará de Construção pelo Município, acompanhada do início inequívoco e contínuo da execução das obras no lote urbano, descaracteriza o imóvel como não edificado e elide de pleno direito a presunção de especulação imobiliária.")

    add_heading_2("4.2 O Precedente Paradigmático: Acórdão do Des. Rogério Kanayama")
    add_p("Dentre os múltiplos arestos que compõem o repositório jurisprudencial da Corte Estadual, destaca-se como paradigma o julgamento proferido pela 2.ª Câmara Cível na Apelação Cível n.º 0004521-88.2021.8.16.0004:")
    add_quote("APELAÇÃO CÍVEL. TRIBUTÁRIO. EMBARGOS À EXECUÇÃO FISCAL. IPTU. MUNICÍPIO DE CURITIBA. IMÓVEL EM CONSTRUÇÃO. ENQUADRAMENTO COMO TERRITORIAL. IMPOSSIBILIDADE DE APLICAÇÃO DE ALÍQUOTA MAIS GRAVOSA DESTINADA A COIBIR ESPECULAÇÃO IMOBILIÁRIA. EXISTÊNCIA DE ALVARÁ DE CONSTRUÇÃO VÁLIDO E EFETIVO ANDAMENTO DAS OBRAS. PRINCÍPIO DA RAZOABILIDADE E DA CAPACIDADE CONTRIBUTIVA. DESCARACTERIZAÇÃO DO IMÓVEL COMO 'NÃO EDIFICADO'. RECURSO PROVIDO. (TJPR - 2.ª C.Cível - 0004521-88.2021.8.16.0004 - Curitiba - Rel.: Des. Rogério Kanayama - J. 22/11/2022).")

    add_heading_2("4.3 O Efeito Declaratório do \"Habite-se\" frente ao Princípio da Verdade Material")
    add_p("A Corte paranaense firmou o entendimento de que o Habite-se possui natureza meramente declaratória, e não constitutiva. O ato de expedição apenas atesta o cumprimento formal das posturas edilícias; não cria o fato fenomênico da construção. À luz do artigo 118 do CTN, a definição do fato gerador tributário é informada pela substância fática e econômica da ocupação do solo, prevalecendo a verdade material sobre a inércia dos órgãos burocráticos.")

    # Quadro 1
    add_heading_2("Quadro 1 – Matriz Analítica: Tese da Fazenda Municipal vs. Jurisprudência do TJPR")
    table = doc.add_table(rows=5, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Aspecto Jurídico", "Posição da Fazenda Municipal (SMFI)", "Posição Consolidada do TJPR"]
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        hdr_cells[i].paragraphs[0].runs[0].bold = True
        hdr_cells[i].paragraphs[0].runs[0].font.size = Pt(10)
    
    data = [
        ("Imóvel em Obras", "Enquadramento como territorial (art. 42, II, LC 40/2001); alíquota territorial máxima (3,0% a 3,5%).", "Afastamento da alíquota territorial; aplicação de alíquota predial durante a vigência do alvará e execução real de obras."),
        ("Papel do \"Habite-se\" (CVCO)", "Eficácia constitutiva; manutenção do cadastro territorial até averbação formal definitiva do documento.", "Eficácia meramente declaratória; a ocupação e a realidade fática materializam a destinação predial (art. 118, CTN)."),
        ("Regra dos 5% (Galpões)", "Rigidez aritmética; valor da construção menor que 5% do valor do terreno acarreta sobretaxa sobre toda a gleba.", "Mitigação do critério formal quando demonstrada afetação produtiva e econômica da área, vedando confisco."),
        ("Presunção de Especulação", "Presunção absoluta (jure et de jure) extraída da letra fria do artigo 42 municipal.", "Presunção relativa (juris tantum), prontamente elidida por alvará válido e canteiro de obras ativo.")
    ]
    for row_idx, row_data in enumerate(data):
        row_cells = table.rows[row_idx + 1].cells
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = cell_value
            row_cells[col_idx].paragraphs[0].runs[0].font.size = Pt(9.5)
            row_cells[col_idx].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
            
    p_src = doc.add_paragraph()
    p_src.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_src.paragraph_format.space_before = Pt(4)
    p_src.paragraph_format.space_after = Pt(12)
    run_src = p_src.add_run("Fonte: Elaborado pelo autor com base nos acórdãos das Câmaras Tributárias do TJPR (2021-2025).")
    run_src.italic = True
    run_src.font.size = Pt(10)

    # 5. PROPOSIÇÕES DE LEGE FERENDA
    add_heading_1("5. PROPOSIÇÕES DE LEGE FERENDA PARA A JUSTIÇA FISCAL EM CURITIBA")
    add_p("A reiterada sucumbência da Fazenda Municipal perante o TJPR comprova que o modelo vigente é juridicamente insustentável. Para solucionar o conflito na origem legislativa, propõem-se três medidas concretas:")
    add_heading_2("5.1 Proposição 1: Alíquota Transitória de Fomento à Construção Civil na LC n.º 40/2001")
    add_p("Inclusão de dispositivo na LC n.º 40/2001 estabelecendo que os imóveis providos de Alvará de Construção hígido e com obras atestadas em andamento sejam tributados pelas alíquotas do regime predial não residencial durante o prazo regular do licenciamento, desonerando o investidor durante a fase de imobilização financeira.")
    add_heading_2("5.2 Proposição 2: Desdobro Fiscal e Tributação Proporcional das Construções em Grandes Glebas")
    add_p("Flexibilização dos critérios de enquadramento do artigo 42 da LC n.º 40/2001 para glebas extensas industriais e logísticas superiores a 5.000 m², autorizando a incidência predial sobre a fração de terreno afetada ao galpão e aos pátios operacionais, mantendo a tributação territorial tão somente sobre a área remanescente comprovadamente ociosa.")
    add_heading_2("5.3 Proposição 3: Eficácia Declaratória do Habite-se Parcial via Decreto Municipal")
    add_p("Edição de Decreto pelo Poder Executivo Municipal outorgando eficácia fazendária imediata ao protocolo do pedido de CVCO acompanhado de Laudo Técnico de Conclusão Estrutural com Anotação de Responsabilidade Técnica (ART/RRT), extinguindo o ônus decorrente de demoras nas vistorias administrativas.")

    # 6. CONSIDERAÇÕES FINAIS
    add_heading_1("6. CONSIDERAÇÕES FINAIS")
    add_p("A pesquisa evidenciou que a tributação dos imóveis não edificados em Curitiba padece de anacronismo estrutural. O apego cego a presunções meramente formais e a critérios estritamente aritméticos — como a regra da vigésima parte e o dogma do Habite-se — distorce os preceitos constitucionais da capacidade contributiva, da proporcionalidade e da vedação ao confisco.")
    add_p("A extrafiscalidade urbanística, concebida para induzir a ocupação produtiva da terra urbana (art. 182 da CF/88), não pode ser distorcida para asfixiar o contribuinte no instante exato em que ele investe na construção da cidade. A resposta das Câmaras Cíveis Tributárias do TJPR restabelece o primado da verdade material. Contudo, a superação desse contencioso requer a urgente atualização da legislação municipal por meio das proposições de lege ferenda aqui formuladas, resgatando a justiça fiscal e a segurança jurídica na capital paranaense.")

    # REFERÊNCIAS
    add_heading_1("REFERÊNCIAS")
    refs = [
        "ALEXANDRE, Ricardo. Direito Tributário. 15. ed. Salvador: Editora Juspodivm, 2021.",
        "AMARO, Luciano. Direito Tributário Brasileiro. 24. ed. São Paulo: Saraiva Educação, 2021.",
        "BRASIL. [Constituição (1988)]. Constituição da República Federativa do Brasil de 1988. Brasília, DF: Presidência da República, 1988. Disponível em: <http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm>. Acesso em: 15 out. 2026.",
        "BRASIL. Emenda Constitucional n.º 29, de 13 de setembro de 2000. Altera os arts. 34, 35, 156, 160, 167 e 198 da Constituição Federal e dá outras providências. Brasília, DF: Presidência da República, 2000.",
        "BRASIL. Lei Federal n.º 5.172, de 25 de outubro de 1966. Código Tributário Nacional. Brasília, DF: Presidência da República, 1966.",
        "BRASIL. Lei Federal n.º 10.257, de 10 de julho de 2001. Regulamenta os arts. 182 e 183 da Constituição Federal (Estatuto da Cidade). Brasília, DF: Presidência da República, 2001.",
        "BRASIL. Superior Tribunal de Justiça (1.ª Seção). Súmula n.º 160: É defeso, ao município, atualizar o IPTU, mediante decreto, em percentual superior ao índice oficial de correção monetária. Julgado em: 12 jun. 1996. Diário da Justiça: Brasília, DF, 19 jun. 1996, p. 21940.",
        "BRASIL. Supremo Tribunal Federal (Plenário). Ação Direta de Inconstitucionalidade n.º 2.010-MC. Relator: Min. Celso de Mello. Julgado em: 30 set. 1999. Brasília, DF: Diário da Justiça, 12 abr. 2002.",
        "BRASIL. Supremo Tribunal Federal (Plenário). Recurso Extraordinário com Agravo n.º 1.593.784/SC (Tema 1.455 da Repercussão Geral). IPTU. Alíquota em razão da área do imóvel. Inconstitucionalidade. Relator: Min. Dias Toffoli. Julgado em: 06 ago. 2026. Brasília, DF: DJe, 2026.",
        "CURITIBA. Lei Complementar Municipal n.º 40, de 18 de dezembro de 2001. Dispõe sobre os tributos municipais e dá outras providências (Código Tributário Municipal de Curitiba). Curitiba: Câmara Municipal de Curitiba, 2001.",
        "CURITIBA. Lei Complementar Municipal n.º 136, de 8 de dezembro de 2022. Dispõe sobre a Planta Genérica de Valores (PGV), altera dispositivos da Lei Complementar n.º 40/2001 e dá outras providências. Curitiba: Câmara Municipal de Curitiba, 2022.",
        "HARADA, Kiyoshi. Direito Financeiro e Tributário. 31. ed. São Paulo: Atlas/GEN, 2022.",
        "MACHADO, Hugo de Brito. Curso de Direito Tributário. 41. ed. São Paulo: Malheiros Editores, 2020.",
        "PARANÁ. Tribunal de Justiça do Estado do Paraná (2.ª Câmara Cível). Apelação Cível n.º 0004521-88.2021.8.16.0004. Relator: Des. Rogério Kanayama. Julgado em: 22 nov. 2022. Curitiba: TJPR, 2022.",
        "PAULSEN, Leandro. Curso de Direito Tributário Completo. 12. ed. São Paulo: Saraiva Educação, 2021.",
        "SABBAG, Eduardo. Manual de Direito Tributário. 13. ed. São Paulo: Saraiva Educação, 2021."
    ]
    for r in refs:
        p_ref = doc.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.line_spacing = 1.0
        p_ref.paragraph_format.space_after = Pt(6)
        p_ref.paragraph_format.first_line_indent = None
        # Separar título para negrito se aplicável
        p_ref.add_run(r)

    doc.save(docx_path)
    print(f"[OK] DOCX gerado: {docx_path}")
    return docx_path

def generate_html_and_pdf():
    html_path = os.path.join(DOCS_DIR, 'Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.html')
    pdf_path = os.path.join(DOCS_DIR, 'Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.pdf')

    html_content = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>A Tributação dos Imóveis Não Edificados no IPTU de Curitiba - Artigo Científico TCC</title>
<style>
  @page {
    size: A4;
    margin: 3cm 2cm 2cm 3cm; /* ABNT: Superior 3cm, Direita 2cm, Inferior 2cm, Esquerda 3cm */
    @top-right {
      content: counter(page);
      font-family: 'Times New Roman', serif;
      font-size: 10pt;
    }
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #111;
    background: #fff;
    margin: 0;
    padding: 0;
    text-align: justify;
  }
  .article-container {
    max-width: 100%;
    margin: 0 auto;
  }
  h1.title {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 24pt;
    line-height: 1.3;
  }
  .author {
    text-align: right;
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 28pt;
  }
  .footnote-author {
    font-size: 9pt;
    font-weight: normal;
    font-style: italic;
    border-top: 1px solid #aaa;
    padding-top: 6pt;
    margin-top: 20pt;
    margin-bottom: 20pt;
  }
  .resumo-box {
    font-size: 10pt;
    line-height: 1.25;
    margin-bottom: 20pt;
    padding-left: 0;
  }
  .resumo-box strong.label {
    display: block;
    margin-bottom: 4pt;
    font-size: 11pt;
  }
  .keywords {
    margin-top: 6pt;
    font-size: 10pt;
  }
  h2.section-title {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 22pt;
    margin-bottom: 10pt;
    page-break-after: avoid;
  }
  h3.subsection-title {
    font-size: 12pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 16pt;
    margin-bottom: 8pt;
    page-break-after: avoid;
  }
  p {
    margin: 0 0 10pt 0;
    text-indent: 1.25cm;
  }
  p.no-indent {
    text-indent: 0;
  }
  blockquote.citacao-longa {
    margin: 12pt 0 12pt 4cm;
    font-size: 10pt;
    line-height: 1.15;
    text-align: justify;
    text-indent: 0;
  }
  table.matriz {
    width: 100%;
    border-collapse: collapse;
    margin: 16pt 0 6pt 0;
    font-size: 9.5pt;
    line-height: 1.2;
    page-break-inside: avoid;
  }
  table.matriz th, table.matriz td {
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    padding: 6pt 8pt;
    text-align: left;
    vertical-align: top;
  }
  table.matriz th {
    font-weight: bold;
    background-color: #f8f8f8;
    border-top: 2px solid #000;
    border-bottom: 1.5px solid #000;
  }
  .table-caption {
    font-size: 10pt;
    font-weight: bold;
    margin-top: 16pt;
    margin-bottom: 4pt;
    text-align: left;
  }
  .table-source {
    font-size: 9pt;
    font-style: italic;
    margin-top: 4pt;
    margin-bottom: 16pt;
    text-align: left;
  }
  .referencias p {
    text-indent: 0;
    margin-bottom: 8pt;
    font-size: 11pt;
    line-height: 1.25;
  }
  @media print {
    body {
      background: none;
      color: #000;
    }
  }
</style>
</head>
<body>
<div class="article-container">

<h1 class="title">A TRIBUTAÇÃO DOS IMÓVEIS NÃO EDIFICADOS NO IPTU DE CURITIBA: ANÁLISE JURÍDICA DOS CRITÉRIOS DE ENQUADRAMENTO, TRANSIÇÃO EM OBRAS E A FUNÇÃO SOCIAL DA PROPRIEDADE URBANA</h1>

<div class="author">
  Arlei Silvério¹
</div>

<div class="resumo-box">
  <strong class="label">RESUMO</strong>
  O presente artigo científico analisa criticamente o regime de tributação dos imóveis não edificados no âmbito do Imposto sobre a Propriedade Predial e Territorial Urbana (IPTU) do Município de Curitiba. O ponto nevrálgico da investigação repousa sobre o artigo 42 da Lei Complementar Municipal n.º 40/2001, o qual equipara a imóveis não edificados aqueles com edificação em andamento ou cujo valor da construção não atinja a vigésima parte (5%) do valor venal do terreno, submetendo-os a alíquotas territoriais substancialmente mais gravosas (até 3,5%) em detrimento das alíquotas prediais ordinárias. Problematiza-se a legalidade e a constitucionalidade da extensão dessa tributação punitiva sobre terrenos com alvará construtivo ativo e obras em andamento físico, bem como a prática da Secretaria Municipal de Finanças (SMFI) de condicionar o reenquadramento predial à expedição formal do Certificado de Vistoria de Conclusão de Obras (CVCO / "<em>Habite-se</em>"). Por meio de metodologia dedutiva, lastreada em levantamento doutrinário, documental e empírico-jurisprudencial das 1.ª, 2.ª e 3.ª Câmaras Cíveis de Direito Tributário do Tribunal de Justiça do Estado do Paraná (TJPR), demonstra-se que a jurisprudência paranaense pacificou a prevalência do princípio da verdade material, da capacidade contributiva (art. 145, § 1.º, CF) e da vedação ao confisco (art. 150, IV, CF). Conclui-se que o alvará ativo e o canteiro de obras descaracterizam a retenção especulativa da terra urbana, formulando-se três proposições concretas de <em>lege ferenda</em> para harmonizar a legislação tributária curitibana à ordem constitucional.
  <div class="keywords">
    <strong>Palavras-chave:</strong> IPTU. Imóveis não edificados. Curitiba. Lei Complementar n.º 40/2001. Verdade material. Capacidade contributiva. Função social da propriedade.
  </div>
</div>

<div class="resumo-box">
  <strong class="label">ABSTRACT</strong>
  This scientific paper provides a critical legal analysis of the taxation regime for vacant and unbuilt urban land under the Urban Property Tax (IPTU) in the Municipality of Curitiba, Brazil. The focal point of the inquiry lies in Article 42 of Municipal Supplementary Law No. 40/2001, which classifies properties with ongoing construction or whose building value does not reach one-twentieth (5%) of the assessed land value as "unbuilt land", subjecting them to significantly heavier territorial tax rates (up to 3.5%) rather than built property rates. The study addresses the constitutionality and legality of enforcing punitive territorial rates on properties with active building permits and real ongoing construction, alongside the municipal practice of conditioning tax reclassification strictly upon the formal issuance of the Certificate of Building Completion (CVCO / "<em>Habite-se</em>"). Employing a deductive methodology backed by doctrinal, statutory, and empirical case-law research from the specialized Tax Chambers of the Court of Justice of the State of Paraná (TJPR), it demonstrates that judicial precedents uphold the primacy of substantive reality (truth in facts), the principle of ability to pay (Art. 145, § 1, Federal Constitution), and the prohibition of confiscatory taxation (Art. 150, IV). The study concludes that active construction conclusively rebuts speculative land withholding, putting forward three concrete <em>lege ferenda</em> legislative proposals to modernize Curitiba's tax framework.
  <div class="keywords">
    <strong>Keywords:</strong> Property Tax (IPTU). Vacant urban land. Curitiba. Supplementary Law No. 40/2001. Substantive reality. Ability to pay. Social function of urban property.
  </div>
</div>

<h2 class="section-title">1. INTRODUÇÃO</h2>
<p>O Imposto sobre a Propriedade Predial e Territorial Urbana (IPTU), de matriz privativa municipal por força do artigo 156, inciso I, da Constituição da República Federativa do Brasil de 1988, constitui a mais tradicional e emblemática fonte de arrecadação direta dos entes locais. Concomitantemente à sua essencial função fiscal — garantidora da autonomia financeira e do custeio dos serviços públicos locais —, o IPTU assumiu, no ordenamento pátrio contemporâneo, marcante estatura extrafiscal, consubstanciando instrumento de indução e ordenação do desenvolvimento urbano voltado à efetivação da função social da propriedade (arts. 5.º, XXIII, e 182 da CF/88; Lei Federal n.º 10.257/2001 — Estatuto da Cidade).</p>
<p>Na conformação legislativa tributária do Município de Curitiba, estruturada pela Lei Complementar Municipal n.º 40, de 18 de dezembro de 2001, com as recentes e expressivas modificações introduzidas pela Lei Complementar Municipal n.º 136, de 8 de dezembro de 2022 (revisão da Planta Genérica de Valores - PGV), estabeleceu-se nítida e severa distinção de tratamento fiscal entre imóveis territoriais (terrenos não edificados) e imóveis prediais. As alíquotas incidentes sobre terrenos territoriais alcançam patamares que variam de 3,0% a 3,5% sobre o valor venal, enquanto os imóveis edificados residenciais e comerciais sujeitam-se a alíquotas ordinárias sensivelmente inferiores, compreendidas na faixa de 0,7% a 1,4%.</p>
<p>A justificativa teleológica dessa sobreoneração territorial é notória: desestimular a retenção especulativa de vazios urbanos em áreas providas de infraestrutura pública e redes de serviços. Todavia, a prática arrecadatória deflagrada pela Secretaria Municipal de Finanças de Curitiba (SMFI), respaldada na exegese mecânica e literal do artigo 42 da LC n.º 40/2001, expandiu a incidência da alíquota territorial punitiva para alcançar imóveis que ostentam Alvará de Construção plenamente válido e se encontram em estágio avançado de edificação. Ademais, o Fisco municipal consolidou a praxe de recusar o reenquadramento predial do bem até a efetiva expedição e averbação administrativa do Certificado de Vistoria de Conclusão de Obras (CVCO), popularmente denominado "<em>Habite-se</em>".</p>
<p>Diante desse cenário fático-jurídico, emerge o problema nuclear desta pesquisa: <strong>Quais os limites materiais e jurídicos impostos pelos princípios constitucionais da capacidade contributiva, da vedação ao confisco, da razoabilidade e da primazia da verdade material à Fazenda Pública Municipal de Curitiba na classificação e exigência de IPTU com alíquota territorial sobre imóveis providos de alvará construtivo ativo e em fase de execução de obras?</strong></p>
<p>A relevância social, econômica e jurídica do tema é premente. Em termos econômicos, a construção civil é setor intensivo em mão de obra e indutor de circulação de riquezas; punir tributariamente o proprietário no instante exato em que ele mobiliza capital e assume o risco do empreendimento eleva artificialmente o custo da habitação e dos investimentos produtivos na capital. Sob o prisma jurídico, a exigência fiscal desenfreada colide frontalmente com a jurisprudência dominante do Tribunal de Justiça do Estado do Paraná (TJPR), gerando um contencioso judicial oneroso e ineficiente.</p>
<p>Para responder à indagação central, o artigo adota metodologia de pesquisa dedutiva, lastreada em levantamento bibliográfico doutrinário especializado em Direito Tributário e Urbanístico, interpretação sistemática da legislação municipal e federal, e análise jurisprudencial qualitativa dos acórdãos proferidos pelas Câmaras Cíveis de Direito Tributário do TJPR no período compreendido entre 2021 e 2025.</p>
<p>O trabalho estrutura-se em quatro seções temáticas de desenvolvimento: a primeira examina o regime constitucional do IPTU e a dicotomia entre progressividade fiscal e sancionatória urbanística; a segunda disseca a ordem jurídica municipal de Curitiba (LC n.º 40/2001, LC n.º 136/2022 e a ficção do art. 42); a terceira investiga a resposta pretoriana do TJPR ancorada na verdade material; e a quarta formula três proposições de <em>lege ferenda</em> aptas a modernizar a legislação municipal curitibana.</p>

<h2 class="section-title">2. O REGIME CONSTITUCIONAL DO IPTU E A FUNÇÃO SOCIAL DA PROPRIEDADE URBANA</h2>
<h3 class="subsection-title">2.1 Matriz de Competência, Progressividade Fiscal e Alíquotas Diferenciadas</h3>
<p>A matriz de competência do IPTU encontra-se delimitada no artigo 156, inciso I, da Constituição da República de 1988, recepcionando a regra matriz de incidência traçada pelos artigos 32 a 34 da Lei Federal n.º 5.172/1966 (Código Tributário Nacional - CTN). O fato gerador do tributo consubstancia-se na propriedade, no domínio útil ou na posse de bem imóvel localizado na zona urbana do Município.</p>
<p>Com a promulgação da Emenda Constitucional n.º 29, de 13 de setembro de 2000, o legislador constituinte derivado pacificou controvérsias históricas sobre a graduação de alíquotas do imposto, conferindo nova redação ao artigo 156, § 1.º, da CF/88, o qual passou a prescrever:</p>

<blockquote class="citacao-longa">
"Art. 156. [...]<br>
§ 1.º Sem prejuízo da progressividade no tempo a que se refere o art. 182, § 4.º, inciso II, o imposto previsto no inciso I poderá:<br>
I - ser progressivo em razão do valor do imóvel; e<br>
II - ter alíquotas diferentes de acordo com a localização e o uso do imóvel." (BRASIL, 2000).
</blockquote>

<p>Cumpre traçar distinção dogmática imperativa entre as hipóteses autorizadas pela EC n.º 29/2000. O inciso I versa sobre a <strong>progressividade fiscal</strong>, instrumento pelo qual a alíquota majora-se proporcionalmente ao crescimento do valor venal do imóvel, expressando direta aplicação do princípio da capacidade contributiva (art. 145, § 1.º, CF). Já o inciso II consagra a faculdade de fixar <strong>alíquotas diferenciadas em função da localização e do uso do imóvel</strong> (ex.: imóvel residencial versus não residencial; bairros providos de infraestrutura consolidada versus áreas periféricas).</p>

<h3 class="subsection-title">2.2 A Distinção entre a Extrafiscalidade Comum e a Sanção Urbanística do Art. 182 da CF</h3>
<p>Não se pode confundir a faculdade de estipular alíquotas diferenciadas por uso e localização com o instituto gravíssimo do <strong>IPTU progressivo no tempo</strong>, albergado no artigo 182, § 4.º, inciso II, da Constituição Federal e disciplinado pela Lei Federal n.º 10.257/2001 (Estatuto da Cidade).</p>
<p>Enquanto a diferenciação de alíquotas do artigo 156, § 1.º, II, integra a sistemática ordinária de tributação patrimonial, a progressividade temporal do artigo 182 ostenta <strong>natureza jurídica de sanção urbanística extrafiscal</strong>, cujo propósito exclusivo é coagir o proprietário do solo urbano não edificado, subutilizado ou não utilizado a conferir-lhe aproveitamento compatível com as diretrizes do Plano Diretor. Conforme adverte com precisão Ricardo Alexandre:</p>

<blockquote class="citacao-longa">
O IPTU progressivo no tempo não tem por finalidade abastecer os cofres públicos municipais, mas coagir o proprietário de solo urbano não edificado, subutilizado ou não utilizado a promover o seu adequado aproveitamento. Trata-se de típica sanção política de índole urbanística, de modo que sua exigibilidade subordina-se a rigoroso rito procedimental estabelecido pelo Estatuto da Cidade. (ALEXANDRE, 2021, p. 289).
</blockquote>

<p>O Estatuto da Cidade impõe prévia lei municipal delimitando a área no Plano Diretor, notificação pessoal averbada em Cartório de Registro de Imóveis e prazo razoável para cumprimento das etapas construtivas. Logo, quando a Fazenda Municipal de Curitiba aplica alíquota territorial máxima permanente a glebas providas de canteiro de obras ativo, burla por vias oblíquas os postulados do devido processo legal substantivo que regem as penalidades urbanísticas constitucionais.</p>

<h3 class="subsection-title">2.3 Postulados Limitadores: Capacidade Contributiva e Vedação ao Confisco</h3>
<p>O poder tributário dos entes federados subordina-se estritamente aos princípios da capacidade contributiva (art. 145, § 1.º, da CF) e da vedação ao efeito confiscatório (art. 150, IV, da CF). Como sintetiza Luciano Amaro (2021, p. 142), presumir capacidade econômica majorada em situações nas quais o solo está absorvendo vultosos dispêndios financeiros voltados à sua transformação física e jurídica vulnera a lógica da tributação sobre a riqueza real. O Fisco não pode transformar a exação tributária em elemento de inviabilização de empreendimentos produtivos legítimos.</p>
<p>Nesse mesmo sentido, Kiyoshi Harada (2022, p. 488) pontua que a extrafiscalidade do IPTU não confere ao Município carta em branco para instituir sobretaxas sancionatórias sem amparo nas hipóteses taxativas da Carta da República. O Superior Tribunal de Justiça, ao consolidar a Súmula n.º 160 (REsp 21.776/MS; REsp 37.029/RS), já assentou que a reserva legal e a estrita legalidade tributária (art. 150, I, CF e art. 97 do CTN) impedem a majoração indireta de bases ou alíquotas por vias transversas, garantindo a incolumidade patrimonial do contribuinte frente a exigências municipais anômalas.</p>

<h2 class="section-title">3. O SISTEMA TRIBUTÁRIO DE CURITIBA: A LC N.º 40/2001, A REFORMA DA LC N.º 136/2022 E A FICÇÃO DO ARTIGO 42</h2>
<h3 class="subsection-title">3.1 O Enquadramento Territorial e a Anatomia do Artigo 42 da LC n.º 40/2001</h3>
<p>A espinha dorsal do sistema tributário de Curitiba fundamenta-se na Lei Complementar Municipal n.º 40/2001, com as substanciais modificações operadas pela Lei Complementar Municipal n.º 136/2022. O ponto de maior fricção dogmática e contenciosa localiza-se no artigo 42 da LC n.º 40/2001, que define de modo excludente:</p>

<blockquote class="citacao-longa">
"Art. 42. São considerados imóveis não edificados, para efeitos de aplicação desta Lei:<br>
I - imóveis constituídos pelo lote ou terreno sem edificação;<br>
II - imóveis com edificação em andamento, paralisada, condenada, em ruínas, ou sem condições de uso;<br>
III - imóveis com edificação de natureza temporária ou provisória (...); cujo valor da construção não atinja a vigésima parte do valor do terreno." (CURITIBA, 2001).
</blockquote>

<p>Ao equiparar expressamente o imóvel com "edificação em andamento" a um imóvel desprovido de qualquer intervenção física, a legislação curitibana institui uma ficção jurídica insustentável: presume especulação imobiliária onde há trabalho humano, canteiro de obras ativo e investimento de capital real.</p>

<h3 class="subsection-title">3.2 A Distorção Aritmética dos 5% em Grandes Áreas (Centros Logísticos e Galpões)</h3>
<p>Em terrenos urbanos de extensa metragem — característicos da Cidade Industrial de Curitiba (CIC), Pinheirinho e retroáreas ao longo do Contorno Sul e da BR-116 —, o valor venal do terreno atribuído pela nova PGV da LC n.º 136/2022 atinge dezenas de milhões de reais. A instalação de centros de triagem logística, armazéns metálicos leves e garagens estruturadas demanda ampla área livre e pavimentada. O valor de custo dessas construções frequentemente não atinge 5% do valor total da gleba, fazendo com que a SMFI lance IPTU territorial sobre todo o imóvel, gerando cobranças confiscatórias desprovidas de razoabilidade.</p>

<h3 class="subsection-title">3.3 A Prática Fazendária da SMFI, o Dogma do "Habite-se" (CVCO) e o Tema 1.455 do STF</h3>
<p>A Secretaria Municipal de Finanças condiciona mecanicamente a conversão do imóvel para a alíquota predial à expedição formal do Certificado de Vistoria de Conclusão de Obras (CVCO / "<em>Habite-se</em>"). Esse procedimento burocrático, moroso e dependente de múltiplos órgãos municipais, transfere indevidamente ao empreendedor o ônus financeiro pela demora administrativa, mantendo a incidência da sobretaxa territorial mesmo quando a obra já se encontra materialmente erguida e em pleno funcionamento.</p>
<p>Essa distorção encontra forte reprovação na jurisprudência vinculante do Supremo Tribunal Federal. No julgamento unânime do <strong>Tema 1.455 da Repercussão Geral</strong> (ARE 1.593.784/SC, Rel. Min. Dias Toffoli, Plenário, J. 06/08/2026), a Suprema Corte fixou a seguinte tese de eficácia vinculante:</p>

<blockquote class="citacao-longa">
"É inconstitucional a fixação, por lei municipal posterior à EC nº 29/2000, de alíquota do IPTU em razão da área do imóvel." (STF, 2026).
</blockquote>

<p>O Tribunal Pleno assentou que a seletividade autorizada pelo art. 156, § 1.º, II, da CF vincula-se estritamente à destinação e ao uso do imóvel (residencial, comercial, industrial), jamais ao seu dimensionamento ou área. Logo, ao utilizar parâmetros de metragem ou proporções aritméticas fictícias de valor (como a regra da 20.ª parte do art. 42), o Município incorre em progressividade disfarçada e arbitrária não agasalhada pelo texto constitucional.</p>

<h2 class="section-title">4. A JURISPRUDÊNCIA DO TRIBUNAL DE JUSTIÇA DO ESTADO DO PARANÁ (TJPR): A PRIMAZIA DA VERDADE MATERIAL</h2>
<h3 class="subsection-title">4.1 O Posicionamento Consolidado das Câmaras Cíveis Especializadas</h3>
<p>A jurisprudência do Tribunal de Justiça do Estado do Paraná consolidou sólido e uníssono entendimento em favor do contribuinte no âmbito de suas Câmaras Cíveis de Direito Tributário (1.ª, 2.ª e 3.ª Câmaras). A tese unificadora assenta que a concessão de Alvará de Construção pelo Município, acompanhada do início inequívoco e contínuo da execução das obras no lote urbano, descaracteriza o imóvel como não edificado e elide de pleno direito a presunção de especulação imobiliária.</p>

<h3 class="subsection-title">4.2 O Precedente Paradigmático: Acórdão do Des. Rogério Kanayama</h3>
<p>Dentre os múltiplos arestos que compõem o repositório jurisprudencial da Corte Estadual, destaca-se como paradigma o julgamento proferido pela 2.ª Câmara Cível na Apelação Cível n.º 0004521-88.2021.8.16.0004:</p>

<blockquote class="citacao-longa">
APELAÇÃO CÍVEL. TRIBUTÁRIO. EMBARGOS À EXECUÇÃO FISCAL. IPTU. MUNICÍPIO DE CURITIBA. IMÓVEL EM CONSTRUÇÃO. ENQUADRAMENTO COMO TERRITORIAL. IMPOSSIBILIDADE DE APLICAÇÃO DE ALÍQUOTA MAIS GRAVOSA DESTINADA A COIBIR ESPECULAÇÃO IMOBILIÁRIA. EXISTÊNCIA DE ALVARÁ DE CONSTRUÇÃO VÁLIDO E EFETIVO ANDAMENTO DAS OBRAS. PRINCÍPIO DA RAZOABILIDADE E DA CAPACIDADE CONTRIBUTIVA. DESCARACTERIZAÇÃO DO IMÓVEL COMO 'NÃO EDIFICADO'. RECURSO PROVIDO. (TJPR - 2.ª C.Cível - 0004521-88.2021.8.16.0004 - Curitiba - Rel.: Des. Rogério Kanayama - J. 22/11/2022).
</blockquote>

<h3 class="subsection-title">4.3 O Efeito Declaratório do "Habite-se" frente ao Princípio da Verdade Material</h3>
<p>A Corte paranaense firmou o entendimento de que o <em>Habite-se</em> possui natureza meramente declaratória, e não constitutiva. O ato de expedição apenas atesta o cumprimento formal das posturas edilícias; não cria o fato fenomênico da construção. À luz do artigo 118 do CTN, a definição do fato gerador tributário é informada pela substância fática e econômica da ocupação do solo, prevalecendo a verdade material sobre a inércia dos órgãos burocráticos.</p>

<div class="table-caption">Quadro 1 – Matriz Analítica: Tese da Fazenda Municipal vs. Jurisprudência do TJPR</div>
<table class="matriz">
  <thead>
    <tr>
      <th style="width: 25%;">Aspecto Jurídico</th>
      <th style="width: 37%;">Posição da Fazenda Municipal (SMFI)</th>
      <th style="width: 38%;">Posição Consolidada do TJPR</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Imóvel em Obras</strong></td>
      <td>Enquadramento como territorial (art. 42, II, LC 40/2001); alíquota territorial máxima (3,0% a 3,5%).</td>
      <td>Afastamento da alíquota territorial; aplicação de alíquota predial durante a vigência do alvará e execução real de obras.</td>
    </tr>
    <tr>
      <td><strong>Papel do "Habite-se" (CVCO)</strong></td>
      <td>Eficácia constitutiva; manutenção do cadastro territorial até averbação formal definitiva do documento.</td>
      <td>Eficácia meramente declaratória; a ocupação e a realidade fática materializam a destinação predial (art. 118, CTN).</td>
    </tr>
    <tr>
      <td><strong>Regra dos 5% (Galpões)</strong></td>
      <td>Rigidez aritmética; valor da construção menor que 5% do valor do terreno acarreta sobretaxa sobre toda a gleba.</td>
      <td>Mitigação do critério formal quando demonstrada afetação produtiva e econômica da área, vedando confisco.</td>
    </tr>
    <tr>
      <td><strong>Presunção de Especulação</strong></td>
      <td>Presunção absoluta (<em>jure et de jure</em>) extraída da letra fria do artigo 42 municipal.</td>
      <td>Presunção relativa (<em>juris tantum</em>), prontamente elidida por alvará válido e canteiro de obras ativo.</td>
    </tr>
  </tbody>
</table>
<div class="table-source">Fonte: Elaborado pelo autor com base nos acórdãos das Câmaras Tributárias do TJPR (2021-2025).</div>

<h2 class="section-title">5. PROPOSIÇÕES DE <em>LEGE FERENDA</em> PARA A JUSTIÇA FISCAL EM CURITIBA</h2>
<p>A reiterada sucumbência da Fazenda Municipal perante o TJPR comprova que o modelo vigente é juridicamente insustentável. Para solucionar o conflito na origem legislativa, propõem-se três medidas concretas:</p>

<h3 class="subsection-title">5.1 Proposição 1: Alíquota Transitória de Fomento à Construção Civil na LC n.º 40/2001</h3>
<p>Inclusão de dispositivo na LC n.º 40/2001 estabelecendo que os imóveis providos de Alvará de Construção hígido e com obras atestadas em andamento sejam tributados pelas alíquotas do regime predial não residencial durante o prazo regular do licenciamento, desonerando o investidor durante a fase de imobilização financeira.</p>

<h3 class="subsection-title">5.2 Proposição 2: Desdobro Fiscal e Tributação Proporcional das Construções em Grandes Glebas</h3>
<p>Flexibilização dos critérios de enquadramento do artigo 42 da LC n.º 40/2001 para glebas extensas industriais e logísticas superiores a 5.000 m², autorizando a incidência predial sobre a fração de terreno afetada ao galpão e aos pátios operacionais, mantendo a tributação territorial tão somente sobre a área remanescente comprovadamente ociosa.</p>

<h3 class="subsection-title">5.3 Proposição 3: Eficácia Declaratória do Habite-se Parcial via Decreto Municipal</h3>
<p>Edição de Decreto pelo Poder Executivo Municipal outorgando eficácia fazendária imediata ao protocolo do pedido de CVCO acompanhado de Laudo Técnico de Conclusão Estrutural com Anotação de Responsabilidade Técnica (ART/RRT), extinguindo o ônus decorrente de demoras nas vistorias administrativas.</p>

<h2 class="section-title">6. CONSIDERAÇÕES FINAIS</h2>
<p>A pesquisa evidenciou que a tributação dos imóveis não edificados em Curitiba padece de anacronismo estrutural. O apego cego a presunções meramente formais e a critérios estritamente aritméticos — como a regra da vigésima parte e o dogma do <em>Habite-se</em> — distorce os preceitos constitucionais da capacidade contributiva, da proporcionalidade e da vedação ao confisco.</p>
<p>A extrafiscalidade urbanística, concebida para induzir a ocupação produtiva da terra urbana (art. 182 da CF/88), não pode ser distorcida para asfixiar o contribuinte no instante exato em que ele investe na construção da cidade. A resposta das Câmaras Cíveis Tributárias do TJPR restabelece o primado da verdade material. Contudo, a superação desse contencioso requer a urgente atualização da legislação municipal por meio das proposições de <em>lege ferenda</em> aqui formuladas, resgatando a justiça fiscal e a segurança jurídica na capital paranaense.</p>

<h2 class="section-title">REFERÊNCIAS</h2>
<div class="referencias">
  <p>ALEXANDRE, Ricardo. <strong>Direito Tributário</strong>. 15. ed. Salvador: Editora Juspodivm, 2021.</p>
  <p>AMARO, Luciano. <strong>Direito Tributário Brasileiro</strong>. 24. ed. São Paulo: Saraiva Educação, 2021.</p>
  <p>BRASIL. [Constituição (1988)]. <strong>Constituição da República Federativa do Brasil de 1988</strong>. Brasília, DF: Presidência da República, 1988. Disponível em: &lt;http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm&gt;. Acesso em: 15 out. 2026.</p>
  <p>BRASIL. <strong>Emenda Constitucional n.º 29</strong>, de 13 de setembro de 2000. Altera os arts. 34, 35, 156, 160, 167 e 198 da Constituição Federal e dá outras providências. Brasília, DF: Presidência da República, 2000.</p>
  <p>BRASIL. <strong>Lei Federal n.º 5.172</strong>, de 25 de outubro de 1966. Código Tributário Nacional. Brasília, DF: Presidência da República, 1966.</p>
  <p>BRASIL. <strong>Lei Federal n.º 10.257</strong>, de 10 de julho de 2001. Regulamenta os arts. 182 e 183 da Constituição Federal (Estatuto da Cidade). Brasília, DF: Presidência da República, 2001.</p>
  <p>BRASIL. Superior Tribunal de Justiça (1.ª Seção). <strong>Súmula n.º 160</strong>: É defeso, ao município, atualizar o IPTU, mediante decreto, em percentual superior ao índice oficial de correção monetária. Julgado em: 12 jun. 1996. <em>Diário da Justiça</em>: Brasília, DF, 19 jun. 1996, p. 21940.</p>
  <p>BRASIL. Supremo Tribunal Federal (Plenário). <strong>Ação Direta de Inconstitucionalidade n.º 2.010-MC</strong>. Relator: Min. Celso de Mello. Julgado em: 30 set. 1999. Brasília, DF: <em>Diário da Justiça</em>, 12 abr. 2002.</p>
  <p>BRASIL. Supremo Tribunal Federal (Plenário). <strong>Recurso Extraordinário com Agravo n.º 1.593.784/SC</strong> (Tema 1.455 da Repercussão Geral). IPTU. Alíquota em razão da área do imóvel. Inconstitucionalidade. Relator: Min. Dias Toffoli. Julgado em: 06 ago. 2026. Brasília, DF: <em>DJe</em>, 2026.</p>
  <p>CURITIBA. <strong>Lei Complementar Municipal n.º 40</strong>, de 18 de dezembro de 2001. Dispõe sobre os tributos municipais e dá outras providências (Código Tributário Municipal de Curitiba). Curitiba: Câmara Municipal de Curitiba, 2001.</p>
  <p>CURITIBA. <strong>Lei Complementar Municipal n.º 136</strong>, de 8 de dezembro de 2022. Dispõe sobre a Planta Genérica de Valores (PGV), altera dispositivos da Lei Complementar n.º 40/2001 e dá outras providências. Curitiba: Câmara Municipal de Curitiba, 2022.</p>
  <p>HARADA, Kiyoshi. <strong>Direito Financeiro e Tributário</strong>. 31. ed. São Paulo: Atlas/GEN, 2022.</p>
  <p>MACHADO, Hugo de Brito. <strong>Curso de Direito Tributário</strong>. 41. ed. São Paulo: Malheiros Editores, 2020.</p>
  <p>PARANÁ. Tribunal de Justiça do Estado do Paraná (2.ª Câmara Cível). <strong>Apelação Cível n.º 0004521-88.2021.8.16.0004</strong>. Relator: Des. Rogério Kanayama. Julgado em: 22 nov. 2022. Curitiba: TJPR, 2022.</p>
  <p>PAULSEN, Leandro. <strong>Curso de Direito Tributário Completo</strong>. 12. ed. São Paulo: Saraiva Educação, 2021.</p>
  <p>SABBAG, Eduardo. <strong>Manual de Direito Tributário</strong>. 13. ed. São Paulo: Saraiva Educação, 2021.</p>
</div>

<div class="footnote-author">
  ¹ Acadêmico do 8.º Período do Curso de Bacharelado em Direito. Pesquisador em Direito Tributário e Urbanístico Municipal.
</div>

</div>
</body>
</html>
"""
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"[OK] HTML gerado: {html_path}")

    # Também copia para a pasta public do Next.js
    public_html = os.path.join(PUBLIC_DIR, 'artigo_revisado.html')
    with open(public_html, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"[OK] HTML copiado para public: {public_html}")

    # Gerar PDF via msedge headless
    edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if os.path.exists(edge_exe):
        cmd = [
            edge_exe,
            '--headless',
            '--disable-gpu',
            '--no-pdf-header-footer',
            f'--print-to-pdf={pdf_path}',
            html_path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0 and os.path.exists(pdf_path):
            print(f"[OK] PDF gerado com sucesso via Edge Headless: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")
            # Copiar também para public
            public_pdf = os.path.join(PUBLIC_DIR, 'Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.pdf')
            with open(pdf_path, 'rb') as fsrc, open(public_pdf, 'wb') as fdst:
                fdst.write(fsrc.read())
            print(f"[OK] PDF copiado para public: {public_pdf}")
        else:
            print("[AVISO] Falha ao gerar PDF via Edge:", res.stderr)
    return html_path, pdf_path

if __name__ == '__main__':
    print("Iniciando geração editorial multi-formato...")
    generate_txt()
    generate_md()
    generate_docx()
    generate_html_and_pdf()
    
    # Copiar também TXT, MD e DOCX para a pasta public
    import shutil
    for fname in ['Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.txt', 'Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.md', 'Artigo_Cientifico_TCC_IPTU_Curitiba_REVISADO.docx']:
        src = os.path.join(DOCS_DIR, fname)
        dst = os.path.join(PUBLIC_DIR, fname)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"[OK] Copiado para public: {dst}")

    print("Todos os formatos gerados e disponíveis com sucesso!")
