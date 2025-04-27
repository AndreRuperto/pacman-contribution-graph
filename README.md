# 👻 SVG-Pacman-Contributions

Transforme seu gráfico de contribuições do GitHub em um jogo animado de Pac-Man! Veja como o Pac-Man devora suas contribuições enquanto desvia dos fantasmas em uma experiência nostálgica de arcade.

<picture>
  <source media="(prefers-color-scheme: dark)"
          srcset="https://raw.githubusercontent.com/AndreRuperto/AndreRuperto/output/dist/pacman-contribution-graph-dark.svg">
  <img alt="Pac-Man contribution graph"
       src="https://raw.githubusercontent.com/AndreRuperto/AndreRuperto/output/dist/pacman-contribution-graph-dark.svg">
</picture>

Esta versão se concentra especificamente na geração de animações SVG otimizadas, com melhorias significativas na jogabilidade e na aparência visual.

## 🎮 Funcionalidades

- **Integração com GitHub**: Busca automaticamente seus dados de contribuição via API GraphQL
- **Jogabilidade do Pac-Man**: Mecânicas clássicas do Pac-Man onde commits são pontos comestíveis
- **Animação SVG Aprimorada**: Exporta um SVG animado com melhorias visuais e comportamentais
- **GitHub Action**: Fácil de adicionar ao README do seu perfil ou site
- **Múltiplos Temas**: Suporta temas GitHub claro/escuro e GitLab claro/escuro

## 🚀 Como Usar

### GitHub Action

- O arquivo YAML deve ser criado no caminho .github/workflows/pacman.yml
- Você deve criar uma branch chamada output para o GitHub armazenar os SVGs gerados

```yaml
name: Atualizar Pac-Man Contribution
on:
  schedule:
    - cron: "0 0 * * *"  # Executa diariamente à meia-noite
  workflow_dispatch:     # Permite execução manual
jobs:
  build:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      
      - name: Gerar Gráfico de Contribuição Pac-Man
        uses: AndreRuperto/pacman-contribution-graph@main
        with:
          github_user_name: ${{ github.repository_owner }}
          github_token: ${{ secrets.PAT_TOKEN }}
          theme: github-dark
          
      - name: Publicar pacman-contribution-graph.svg na branch output
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Adicione ao README do seu perfil GitHub:

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/AndreRuperto/AndreRuperto/output/pacman-contribution-graph-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/AndreRuperto/AndreRuperto/output/pacman-contribution-graph.svg">
  <img alt="Pac-Man contribution graph" src="https://raw.githubusercontent.com/AndreRuperto/AndreRuperto/output/pacman-contribution-graph.svg">
</picture>
```

## ⚠️ Token do GitHub (OBRIGATÓRIO)

O token de acesso pessoal do GitHub é necessário para o funcionamento correto da aplicação. Este token é usado para acessar a API GraphQL do GitHub, que fornece os dados detalhados das suas contribuições.

### Por que é necessário?
- A API GraphQL do GitHub exige autenticação
- O token automático do GitHub Actions (`GITHUB_TOKEN`) tem limitações de taxa (apenas 1.000 pontos/hora vs. 5.000 pontos/hora para PATs)
- Alguns tipos de tokens (como os de acesso refinado) não funcionam com a API GraphQL
- Sem o token adequado, não é possível buscar o histórico de contribuições completo

### Como configurar (passo a passo):

#### 1. Criar o token no GitHub

1. Acesse suas configurações no GitHub → Developer settings → Personal access tokens → Tokens (classic)
   - Ou acesse diretamente: https://github.com/settings/tokens
   
2. Clique em "Generate new token (classic)"
   
3. Dê um nome descritivo ao token, como "pacman-contributions"
   
4. Defina uma data de expiração adequada (sugiro pelo menos 30 dias)
   
5. Para escopo, selecione apenas:
   - `repo` (para acesso às contribuições em repositórios privados)
   - `read:user` (para informações básicas do perfil)
   
6. Clique em "Generate token"
   
7. **IMPORTANTE**: Copie o token gerado imediatamente e salve-o em local seguro. Você não poderá vê-lo novamente!

#### 2. Adicionar o token como Secret no repositório

1. No repositório onde você usará a GitHub Action, vá para Settings → Secrets and variables → Actions
   
2. Clique em "New repository secret"
   
3. Configure o secret:
   - **Name**: `PAT_TOKEN` (ou outro nome de sua preferência)
   - **Value**: Cole o token que você gerou e copiou anteriormente
   
4. Clique em "Add secret"

> **LEMBRE-SE**: Nunca compartilhe seu token pessoal ou o adicione diretamente no código. Sempre use o sistema de secrets do GitHub para manter seus tokens seguros.

5. Executar o Workflow Manualmente
Depois de configurar tudo:

Vá para a aba "Actions" no seu repositório
Clique em "Atualizar Pac-Man Contribution"
Clique em "Run workflow" > "Run workflow"

Isso iniciará o processo de geração do SVG e depois você poderá ver a animação funcionando no seu README!
Essa implementação permitirá que seu gráfico de contribuições do Pac-Man seja atualizado automaticamente todos os dias, mantendo-o sempre atual com suas contribuições mais recentes.

### Desenvolvimento Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/AndreRuperto/svg-pacman-contributions.git
   cd svg-pacman-contributions
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. Gere um SVG para um nome de usuário do GitHub:
   ```bash
   # Crie um arquivo .env com GITHUB_TOKEN=seu_token_aqui (OBRIGATÓRIO)
   pnpm run svg
   ```

4. O SVG será gerado na pasta `dist`

## 🎯 Como Funciona

A aplicação usa seus dados de contribuição do GitHub para:

1. Criar uma grade onde cada célula representa um dia de contribuição
2. Utilizar os níveis de intensidade de contribuição fornecidos pela API do GitHub:

- NONE: Dias sem contribuições (espaços vazios no jogo)
- FIRST_QUARTILE: Dias com poucas contribuições (pontos pequenos, 1 ponto no jogo)
- SECOND_QUARTILE: Dias com contribuições moderadas (pontos médios, 2 pontos)
- THIRD_QUARTILE: Dias com muitas contribuições (pontos grandes, 5 pontos)
- FOURTH_QUARTILE: Dias com contribuições excepcionais (power pellets que ativam o modo de comer fantasmas)

Esses níveis são relativos ao padrão de contribuições de cada usuário e calculados automaticamente pelo GitHub, portanto a densidade de elementos no jogo refletirá o perfil único de cada um.

3. Pac-Man navega pela grade usando algoritmos de pathfinding
4. Fantasmas perseguem o Pac-Man com comportamentos únicos (como no jogo original)
5. Toda a jogabilidade é gravada e exportada como um SVG animado

## 📋 Opções de Configuração

| Opção | Descrição | Padrão |
|--------|-------------|---------|
| `username` | Nome de usuário do GitHub | (obrigatório) |
| `theme` | Tema de cores | `github-dark` |
| `outputDirectory` | Pasta de saída do SVG | `dist` |
| `githubToken` | Token do GitHub para acesso à API | (obrigatório) |

## 🧩 Melhorias Implementadas

Esta versão inclui várias melhorias em relação à implementação original:

- **Fantasmas Aprimorados**: Novas imagens e animações mais fiéis ao jogo original
- **Olhos Direcionais**: Os olhos dos fantasmas se movem de acordo com a direção em que estão indo
- **Power-up Aperfeiçoado**: Melhor lógica e feedback visual durante o modo de power-up
- **Casa dos Fantasmas**: Design melhorado para a área inicial dos fantasmas
- **Otimização SVG**: Geração de SVG mais eficiente e com animações mais suaves

## 👻 Fantasmas atualizados
Cada fantasma ganhou novas imagens e personalidades fiéis aos do jogo.

| Fantasma | Pré-visualização |
|:--------:|:----------------:|
| **Blinky** (vermelho) | <p align="center"><img src="src/assets/gifs/red_flip.gif" height="40" alt="Blinky"></p> |
| **Pinky** (rosa)      | <p align="center"><img src="src/assets/gifs/pink_flip.gif" height="40" alt="Pinky"></p> |
| **Inky** (ciano)      | <p align="center"><img src="src/assets/gifs/cyan_flip.gif" height="40" alt="Inky"></p> |
| **Clyde** (laranja)   | <p align="center"><img src="src/assets/gifs/orange_flip.gif" height="40" alt="Clyde"></p> |

## 🔧 Desenvolvimento

Construído com TypeScript e Node.js, o projeto consiste em:

- `src/`: Lógica principal do jogo e renderização
- `scripts/`: Ferramentas para gerar SVGs
- `github-action/`: Integração com GitHub Action

## 🙏 Créditos

Este projeto é uma versão especializada baseada no [Pac-Man Contribution Graph](https://github.com/abozanona/pacman-contribution-graph) criado por [abozanona](https://github.com/abozanona). Enquanto o projeto original oferece tanto visualizações SVG quanto Canvas, esta versão foca exclusivamente em melhorias à renderização SVG e na experiência de jogabilidade automatizada.

## 🤝 Como contribuir
Ficou com vontade de adicionar um novo tema, melhorar a IA dos fantasmas ou otimizar o SVG?  
Pull requests são **muito** bem-vindos!  

1. **Fork** o repositório  
2. Crie sua branch: `git checkout -b feat/minha-melhoria`  
3. Faça commits claros e concisos  
4. Abra um PR explicando o que mudou e _por quê_  

Se tiver dúvidas, abra uma _issue_. 👊

---

<p align="center">
  Esses fantasmas trabalham muito! Deixe um cafuné antes de sair.<br>
  <img src="src/assets/gifs/pink_pet_cafune.gif" alt="Fantasma sendo acariciado" height="80">
</p>