# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Criativo Pet** — plataforma de criação de artes de marketing para petshops. Site estático single-file: toda a lógica (HTML + CSS + JS) está em `index.html`. Sem build, sem dependências npm.

## Development

Abrir direto no browser ou servir estático:
```bash
python3 -m http.server 8080
# acesse http://localhost:8080
```

Não há linting, testes ou build configurados.

## Architecture

### Arquivo único
`index.html` contém tudo: estilos inline (`<style>`), markup HTML e todo o JavaScript (`<script>`). Nenhum arquivo JS/CSS externo (exceto Google Fonts via CDN).

### Estado global principal
```js
cfg   // configuração do petshop (nome, wpp, cidade, insta, ghToken) — persiste em localStorage('petcfg')
ed    // estado do editor (arte selecionada, textos, cor, bgUrl, bgGrad, objects[])
uploads[]  // imagens carregadas localmente na sessão (não persistidas)
fotoGhMap  // cache de URLs GitHub → localStorage('fotoGhMap_v1')
```

### Renderização canvas
- Preview em `#editor-canvas` (proporção 1:1, responsivo)
- Export final: **1080×1080px** via `canvas.toDataURL('image/png')`
- `schedRender()` debounce 150ms → `renderArte(canvas)`
- Camadas de objetos (`ed.objects[]`) suportam drag, rotate, scale, flipH via `initCanvasInteraction()`

### Templates de arte
`ARTES[]` (~12 templates) cada um com: `id`, `t` (título), `s` (subtítulo), `c` (cor hex), `tag` (categoria de foto).  
`FOTO_IDS` mapeia cada tag para IDs de fotos Pexels; `FOTO_GH_STATIC` mapeia esses IDs para URLs raw do GitHub.

### Integração GitHub
- Repositório fixo: `lssgoiano-anagi/amigao-petshop-imagens`, branch `main`
- Token pessoal do usuário (Fine-grained, permissão `Contents: Read and Write`) salvo em `cfg.ghToken`
- Toda operação usa `https://api.github.com/repos/{GH_REPO}/contents/{path}` com `Authorization: Bearer`
- Pastas gerenciadas: `imagens/galeria/`, `imagens/pets/`, `imagens/racao/`, `imagens/acessorios/`, `imagens/fundos/`

### Processamento de imagem (modal "Tratar")
- **Remover fundo**: chamada a API externa (via `removerFundoImagem()`)
- **Melhorar qualidade**: sharpening client-side via canvas (unsharp mask + contrast/saturate CSS filters)
- Resultado pode ser salvo no GitHub ou usado localmente sem salvar

## Assets

| Pasta | Conteúdo |
|---|---|
| `imagens/galeria/` | Fotos JPG para modelos prontos |
| `imagens/pets/` | Fotos JPG de pets (camada) |
| `imagens/racao/` | SVGs de produtos de ração (camada) |
| `imagens/acessorios/` | SVGs de acessórios pet (camada) |
| `imagens/fundos/` | SVGs de fundos coloridos |
| `marcote.png` | Mascote/logo exibido no header e nas artes |

## Design System

```css
--verde: #2ECC71     /* cor primária */
--verde-esc: #1a9e52 /* primária escura */
--azul: #3498DB
--laranja: #F39C12
--roxo: #9B59B6
--vermelho: #E74C3C
--bg: #f0faf4
```

Fontes: `Nunito` (corpo/UI) e `Fredoka One` (títulos/marca) via Google Fonts.

## Deploy

Site estático puro — qualquer host funciona. Opções recomendadas:
- **GitHub Pages**: Settings → Pages → Source: branch main
- **Netlify**: arrastar pasta para app.netlify.com/drop
- **Domínio**: Registro.br para `.com.br` (~R$40/ano)
