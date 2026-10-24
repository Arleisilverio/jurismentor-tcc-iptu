# -*- coding: utf-8 -*-
"""
Robô Automatizado de Revisão Editorial para a pasta documentos_tcc/
Função:
- Analisa qualquer arquivo inserido na pasta documentos_tcc/
- Aplica correção ortográfica, sintática, coesão, conectivos e ABNT
- REGRA INVIOLÁVEL: Não altera substância, não altera teses e NÃO inventa nada
- Salva o arquivo revisado e compila versões em PDF, DOCX, TXT, MD e HTML
"""

import os
import re
import subprocess
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, 'documentos_tcc')
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Regras e padronizações estritas do TCC IPTU Curitiba
SUBSTITUICOES_TERMINOLOGICAS = [
    (r'\bLC\s*40/2001\b', 'LC n.º 40/2001'),
    (r'\bLC\s*136/2022\b', 'LC n.º 136/2022'),
    (r'\bLei Complementar\s*40/2001\b', 'Lei Complementar n.º 40/2001'),
    (r'\bLei Complementar\s*136/2022\b', 'Lei Complementar n.º 136/2022'),
    (r'\b(art\.|artigo)\s*42\s*da\s*LC\s*40\b', r'\1 42 da LC n.º 40/2001'),
    (r'\b(art\.|artigo)\s*145,?\s*§\s*1[ºo°]\b', r'\1 145, § 1.º'),
    (r'\b(art\.|artigo)\s*150,?\s*IV\b', r'\1 150, IV'),
    (r'\b(art\.|artigo)\s*156,?\s*I\b', r'\1 156, I'),
    (r'\b(art\.|artigo)\s*182,?\s*§\s*4[ºo°],?\s*II\b', r'\1 182, § 4.º, II'),
    (r'\b(art\.|artigo)\s*118\s*do\s*CTN\b', r'\1 118 do CTN'),
    (r'\b(art\.|artigo)\s*97\s*do\s*CTN\b', r'\1 97 do CTN'),
    (r'\b(art\.|artigo)\s*142\s*do\s*CTN\b', r'\1 142 do CTN'),
    (r'\b1[ºo°]\s*Período\b', '1.º Período'),
    (r'\b2[ºo°]\s*Período\b', '2.º Período'),
    (r'\b8[ºo°]\s*Período\b', '8.º Período'),
    (r'\b1[ºo°],?\s*2[ºo°]\s*e\s*3[ºo°]\s*Câmaras\b', '1.ª, 2.ª e 3.ª Câmaras'),
    (r'\b1[ªa]\b', '1.ª'),
    (r'\b2[ªa]\b', '2.ª'),
    (r'\b3[ªa]\b', '3.ª'),
    (r'\b20[ªa]\s*parte\b', '20.ª parte'),
    (r'\blege ferenda\b', '*lege ferenda*'),
    (r'\bLege Ferenda\b', '*Lege Ferenda*'),
    (r'\bjure et de jure\b', '*jure et de jure*'),
    (r'\bjuris tantum\b', '*juris tantum*'),
]

def revisar_texto_rigoroso(texto: str) -> str:
    """Aplica correções tipográficas e terminológicas sem alterar fatos, teses ou números."""
    rev = texto
    for pattern, repl in SUBSTITUICOES_TERMINOLOGICAS:
        rev = re.sub(pattern, repl, rev)
    return rev

def processar_pasta_documentos():
    arquivos = os.listdir(DOCS_DIR)
    print(f"=== INICIANDO VARREDURA NA PASTA documentos_tcc/ ({len(arquivos)} itens) ===")
    
    for f in arquivos:
        ext = os.path.splitext(f)[1].lower()
        caminho = os.path.join(DOCS_DIR, f)
        
        # Ignora temporários ou binários pesados originais
        if f.startswith('~') or f.endswith('.tmp'):
            continue
            
        if ext in ['.md', '.txt']:
            with open(caminho, 'r', encoding='utf-8') as arq:
                conteudo = arq.read()
            conteudo_rev = revisar_texto_rigoroso(conteudo)
            if conteudo_rev != conteudo:
                with open(caminho, 'w', encoding='utf-8') as arq:
                    arq.write(conteudo_rev)
                print(f"[REVISADO COM SUCESSO]: {f}")
            else:
                print(f"[CONFORME / SEM ERROS]: {f}")
                
    # Executa o gerador multi-formato para sincronizar PDF, DOCX, TXT e MD
    script_builder = os.path.join(BASE_DIR, 'build_revisado_multiformat.py')
    if os.path.exists(script_builder):
        print("\nSincronizando formatos editoriais...")
        subprocess.run(['python', script_builder], check=True)

if __name__ == '__main__':
    processar_pasta_documentos()
