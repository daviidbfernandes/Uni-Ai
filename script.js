'use strict';

/* ═══════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════ */
const state = {
  page:            'home',
  user:            null,
  apiKey:          '',
  library:         [],
  currentItem:     null,
  ncLastText:      '',
  ncLastType:      '',
  ncLastResponse:  '',
  ncQuizData:      null,
  ncQuizAnswers:   {},
  abortCtrl:       null,
};

const pdfState = { text: '', pages: 0, fileName: '', size: 0 };
let   loadingMsgTimer = null;

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const API_URL    = 'https://api.anthropic.com/v1/messages';
const MODEL      = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 3000;
const TIMEOUT_MS = 60000;
const LS_USER    = 'uniai_user';
const LS_LIB     = 'uniai_library';
const SS_KEY     = 'uniai_api_key';
const DEMO_KEY   = 'DEMO';

/* ═══════════════════════════════════════════════════════════
   DEMO MODE RESPONSES
═══════════════════════════════════════════════════════════ */
const DEMO_RESPONSES = {
  summarize: `## 📋 Resumo Geral

A Inteligência Artificial (IA) é um campo da ciência da computação que busca criar sistemas capazes de realizar tarefas que normalmente exigiriam inteligência humana. O Machine Learning (Aprendizado de Máquina) é uma subárea fundamental da IA que permite que computadores aprendam padrões a partir de dados sem serem explicitamente programados para cada situação.

Os algoritmos de ML podem ser classificados em três categorias: **aprendizado supervisionado**, onde o modelo aprende com exemplos rotulados; **aprendizado não supervisionado**, onde o modelo descobre padrões em dados sem rótulos; e **aprendizado por reforço**, onde o agente aprende através de recompensas e penalidades.

As redes neurais artificiais, inspiradas no cérebro humano, revolucionaram o campo ao permitir o processamento de grandes volumes de dados complexos — imagens, texto e áudio — com precisão antes impossível.

## 🎯 Conceitos-Chave

- **Algoritmo**: Conjunto de instruções que define como o modelo aprende a partir dos dados
- **Treinamento**: Processo onde o modelo ajusta seus parâmetros com base nos dados de entrada
- **Overfitting**: Quando o modelo memoriza os dados de treino e falha em generalizar para dados novos
- **Gradient Descent**: Técnica de otimização que minimiza o erro do modelo iterativamente
- **Redes Neurais**: Estruturas de camadas interconectadas que processam informações em paralelo
- **Validação**: Conjunto separado de dados usado para avaliar o desempenho durante o treino

## 📌 Destaques Importantes

- O sucesso de um modelo depende fundamentalmente da qualidade e quantidade dos dados utilizados
- A escolha do algoritmo deve considerar o problema, os dados disponíveis e os recursos computacionais
- A divisão treino/validação/teste é essencial para uma avaliação honesta do modelo

## 💡 Conexões e Aplicações

Este conteúdo se conecta diretamente com Estatística, Álgebra Linear e Cálculo. Na prática, é aplicado em reconhecimento de imagens, processamento de linguagem natural, sistemas de recomendação, diagnósticos médicos e veículos autônomos.

## ✅ O que você precisa saber (para a prova)

1. Diferença entre aprendizado supervisionado, não supervisionado e por reforço
2. O que é overfitting e como preveni-lo (regularização, dropout, mais dados)
3. Como funciona o Gradient Descent e por que ele minimiza o erro
4. A estrutura de uma rede neural: neurônios, camadas, funções de ativação
5. Por que a qualidade dos dados é mais importante que a complexidade do algoritmo`,

  questions: `## 📝 Questões de Revisão

**Questão 1:** Explique a diferença entre aprendizado supervisionado e não supervisionado, fornecendo um exemplo prático de cada um.

**Questão 2:** O que é overfitting em Machine Learning? Quais são as principais estratégias para prevenir esse problema em modelos de redes neurais profundas?

**Questão 3:** Descreva como o algoritmo Gradient Descent funciona para minimizar a função de perda de um modelo. Por que a taxa de aprendizado (learning rate) é um hiperparâmetro crítico?

**Questão 4:** Compare as vantagens e desvantagens das redes neurais artificiais em relação aos algoritmos clássicos de Machine Learning, como SVM e Random Forest.

**Questão 5:** Explique o conceito de transferência de aprendizado (transfer learning) e como ele pode ser aplicado para resolver problemas com poucos dados disponíveis.

---

## ✅ Gabarito Comentado

**Questão 1 — Resposta:**
No aprendizado supervisionado, o modelo é treinado com dados rotulados. Exemplo: classificar e-mails como spam. No aprendizado não supervisionado, o modelo recebe apenas dados sem rótulos e descobre padrões por conta própria. Exemplo: segmentação de clientes em grupos com base em comportamento de compra, sem categorias predefinidas.

**Questão 2 — Resposta:**
Overfitting ocorre quando o modelo memoriza os dados de treino, incluindo seus ruídos, prejudicando sua generalização. Estratégias de prevenção: Regularização L1/L2, Dropout, Early Stopping, Data Augmentation e coleta de mais dados reais.

**Questão 3 — Resposta:**
O Gradient Descent calcula o gradiente da função de perda em relação a cada parâmetro. Em cada iteração, os parâmetros são atualizados na direção oposta ao gradiente. A learning rate controla o tamanho do passo: muito alta causa divergência; muito baixa torna o treinamento lento.

**Questão 4 — Resposta:**
Redes neurais são superiores em dados não estruturados e grandes volumes. Contudo, exigem muito poder computacional e são menos interpretáveis. SVM e Random Forest funcionam bem com dados estruturados e conjuntos menores, são mais interpretáveis, mas dependem de engenharia manual de features.

**Questão 5 — Resposta:**
Transfer learning usa um modelo pré-treinado em uma tarefa grande como ponto de partida para outra tarefa. Congela-se as camadas iniciais (que aprendem features genéricas) e treina-se apenas as últimas para a nova tarefa, reduzindo drasticamente a necessidade de dados e tempo de treinamento.`,

  explain: `## 🧠 Do que se trata?

Inteligência Artificial é a capacidade de máquinas realizarem tarefas que normalmente precisariam de inteligência humana — como reconhecer rostos, entender texto ou tomar decisões. Machine Learning é a técnica que permite isso acontecer: em vez de programar regras manualmente, a máquina *aprende* com exemplos.

## 🔍 Como funciona?

1. **Coleta de dados**: Você reúne muitos exemplos (fotos, textos, números)
2. **Treinamento**: O algoritmo analisa esses exemplos e ajusta parâmetros internos
3. **Validação**: Você testa o modelo com dados novos para ver se aprendeu de verdade
4. **Ajuste**: Corrige erros e repete até o modelo funcionar bem
5. **Implantação**: O modelo treinado é usado em produção para fazer previsões

## 💡 Analogia do Dia a Dia

Imagine ensinar uma criança a reconhecer gatos: você mostra centenas de fotos dizendo "isso é gato" ou "isso não é gato". Com o tempo ela aprende a identificar gatos sozinha, mesmo em fotos novas. É exatamente assim que o Machine Learning funciona — mas com dados e matemática no lugar de fotos e conversas.

## 📚 Exemplo Concreto

O filtro de spam do seu e-mail usa ML. Ele foi treinado com milhões de e-mails marcados como spam ou não-spam. Hoje, quando chega um e-mail novo, ele analisa padrões (palavras, remetente, estrutura) e decide automaticamente onde colocar — sem precisar de regras manuais.

## ⚠️ Cuidado com estes erros comuns

- **Confundir IA com "mágica"**: Todo resultado de ML é baseado em matemática e dados, não em intuição
- **Ignorar a qualidade dos dados**: "Lixo entra, lixo sai" — dados ruins geram modelos ruins
- **Achar que mais complexidade = melhor resultado**: Modelos simples muitas vezes superam redes neurais complexas

## ✅ Em Resumo — 3 coisas para lembrar

1. ML aprende padrões de dados, não segue regras programadas manualmente
2. A qualidade dos dados determina o teto do desempenho do modelo
3. Overfitting é o maior inimigo: o modelo que "decora" não generaliza`,

  quiz: `{"title":"Quiz: Inteligência Artificial e Machine Learning","questions":[{"q":"O que melhor descreve o conceito de overfitting em Machine Learning?","opts":["O modelo aprende tão bem os dados de treino que não generaliza para dados novos","O modelo é treinado com dados insuficientes e não aprende padrões relevantes","O algoritmo demora muito para convergir durante o processo de treinamento","O modelo usa mais parâmetros do que o necessário para resolver o problema"],"ans":0,"exp":"Overfitting ocorre quando o modelo memoriza os dados de treino, incluindo seus ruídos, em vez de aprender os padrões gerais. Isso gera excelente desempenho no treino, mas desempenho ruim em dados novos. As outras opções descrevem underfitting (B), lentidão de convergência (C) e complexidade excessiva (D)."},{"q":"Qual é um exemplo correto de aprendizado NÃO supervisionado?","opts":["Classificar e-mails em spam e não-spam com base em e-mails já classificados","Prever o preço de imóveis com base em características como área e localização","Agrupar clientes em segmentos com base em padrões de compra sem categorias predefinidas","Treinar um agente para jogar xadrez usando recompensas e penalidades"],"ans":2,"exp":"A segmentação de clientes por clustering é aprendizado não supervisionado: o algoritmo descobre estruturas nos dados sem exemplos rotulados. A opção A é supervisionado (dados rotulados), B é regressão supervisionada e D é aprendizado por reforço."},{"q":"Qual é a principal função do Gradient Descent no treinamento de modelos?","opts":["Aumentar a velocidade de processamento dos dados de entrada no modelo","Minimizar a função de perda ajustando iterativamente os parâmetros do modelo","Dividir automaticamente os dados em conjuntos de treino e teste balanceados","Selecionar automaticamente as features mais relevantes para o problema"],"ans":1,"exp":"O Gradient Descent calcula o gradiente da função de perda em relação a cada parâmetro e os ajusta na direção que reduz o erro. É o principal algoritmo de otimização para treinar redes neurais. As outras opções descrevem: aceleração de hardware (A), divisão de dados (C) e feature selection (D)."},{"q":"O que é Transfer Learning e qual seu principal benefício?","opts":["Transferir dados de um banco de dados para outro para aumentar o conjunto de treino","Usar um modelo pré-treinado em uma tarefa grande como ponto de partida para outra tarefa","Mover um modelo treinado de um servidor para outro sem perda de performance","Compartilhar pesos entre diferentes camadas da mesma rede neural"],"ans":1,"exp":"Transfer Learning reutiliza conhecimento de um modelo treinado em dados abundantes para uma tarefa nova com poucos dados. Seu principal benefício é reduzir dramaticamente a necessidade de dados e tempo de treinamento, pois as camadas iniciais já aprenderam representações genéricas e úteis."},{"q":"Por que dividir os dados em treino, validação e teste é essencial em ML?","opts":["Para aumentar artificialmente a quantidade de dados disponíveis para treinamento","Para garantir que o modelo seja avaliado de forma honesta em dados que nunca viu","Para acelerar o processo de treinamento distribuindo o processamento entre servidores","Para remover automaticamente outliers e dados corrompidos do dataset"],"ans":1,"exp":"A divisão garante avaliação imparcial: o treino ensina o modelo; a validação permite ajustar hiperparâmetros; o teste avalia o desempenho real em dados nunca vistos, simulando o uso em produção. Usar os mesmos dados para treinar e avaliar superestima o desempenho real."}]}`,

  schedule: `## 📅 Plano de Estudos Semanal

### 🎯 Objetivo da Semana
Dominar os conceitos fundamentais de Inteligência Artificial e Machine Learning: tipos de aprendizado, algoritmos principais, overfitting e técnicas de regularização.

### 📐 Metodologia Aplicada
Técnica Pomodoro (25min foco + 5min pausa), Active Recall com flashcards e revisão espaçada no final de cada dia.

---

### Segunda-feira
**⏱ Sessão 1 (45 min):** Introdução à IA e tipos de aprendizado (supervisionado, não supervisionado, reforço)
**🔄 Revisão (15 min):** Criar 5 flashcards com definições e exemplos de cada tipo
**🎯 Meta do dia:** Conseguir explicar cada tipo de aprendizado com um exemplo prático sem consultar o material

### Terça-feira
**⏱ Sessão 1 (45 min):** Algoritmos clássicos: Regressão Linear, KNN, Decision Trees e Random Forest
**🔄 Revisão (15 min):** Mapear quando usar cada algoritmo (tabela comparativa)
**🎯 Meta do dia:** Entender qual algoritmo escolher para diferentes tipos de problema

### Quarta-feira
**⏱ Sessão 1 (45 min):** Redes Neurais: estrutura, neurônios, camadas, funções de ativação
**🔄 Revisão (15 min):** Desenhar a arquitetura de uma rede neural simples de memória
**🎯 Meta do dia:** Explicar como uma rede neural processa informação do input ao output

### Quinta-feira
**⏱ Sessão 1 (45 min):** Overfitting, underfitting e técnicas de regularização (L1, L2, Dropout)
**🔄 Revisão (15 min):** Resolver exercícios práticos de identificação de overfitting em gráficos
**🎯 Meta do dia:** Identificar overfitting em curvas de aprendizado e propor soluções

### Sexta-feira
**⏱ Sessão 1 (45 min):** Gradient Descent, learning rate e processo de otimização
**🔄 Revisão (15 min):** Simular manualmente 3 passos do Gradient Descent com valores simples
**🎯 Meta do dia:** Entender o impacto da learning rate no treinamento

### Sábado
**⏱ Sessão 1 (90 min):** Revisão geral de toda a semana com questões dissertativas
**🔄 Revisão (30 min):** Revisar flashcards da semana usando espaçamento crescente
**🎯 Meta do dia:** Acertar 80%+ das questões de revisão sem consultar anotações

### Domingo
**🧘 Descanso ativo:** Leitura leve de artigos sobre aplicações reais de IA (máximo 30 min). Sem estudo intensivo.

---

### ✅ Checklist de Progresso
- [ ] Explicar os 3 tipos de aprendizado com exemplos
- [ ] Descrever pelo menos 4 algoritmos clássicos de ML
- [ ] Explicar a estrutura de uma rede neural
- [ ] Identificar e prevenir overfitting
- [ ] Descrever o funcionamento do Gradient Descent

### 📱 Apps e Recursos Recomendados
- **Anki** — flashcards com revisão espaçada
- **Kaggle Learn** — cursos práticos gratuitos de ML
- **3Blue1Brown (YouTube)** — visualizações de redes neurais
- **Google Colab** — ambiente gratuito para praticar código Python`
};

const APP_PAGES    = ['dashboard','library','new-content','profile'];
const PUBLIC_PAGES = ['home','about','auth'];

const ACTION_META = {
  summarize: { label: 'Resumo do Conteúdo',       loading: 'Gerando resumo...'        },
  questions: { label: 'Questões de Revisão',       loading: 'Criando questões...'      },
  explain:   { label: 'Explicação Simplificada',   loading: 'Simplificando...'         },
  quiz:      { label: 'Quiz Interativo',           loading: 'Montando quiz...'         },
  schedule:  { label: 'Cronograma Semanal',        loading: 'Planejando cronograma...' },
  chat:      { label: 'Chat Acadêmico',            loading: 'Pensando...'              },
};

const LOADING_MSGS = {
  summarize: ['Analisando o conteúdo...','Identificando conceitos-chave...','Estruturando tópicos...','Revisando destaques...'],
  questions: ['Lendo o material...','Formulando perguntas...','Elaborando gabarito...','Revisando questões...'],
  explain:   ['Processando o conteúdo...','Simplificando conceitos...','Buscando analogias...','Estruturando explicação...'],
  quiz:      ['Analisando o tema...','Criando questões...','Gerando alternativas...','Finalizando o quiz...'],
  schedule:  ['Avaliando o conteúdo...','Planejando sessões...','Otimizando horários...','Finalizando cronograma...'],
  chat:      ['Pensando...','Processando...','Formulando resposta...'],
};

/* ═══════════════════════════════════════════════════════════
   CRYPTO
═══════════════════════════════════════════════════════════ */
async function hashPwd(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ═══════════════════════════════════════════════════════════
   STORAGE HELPERS
═══════════════════════════════════════════════════════════ */
const store = {
  get:     (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:     (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  remove:  (k)    => { try { localStorage.removeItem(k); } catch {} },
  ssGet:   (k)    => { try { return sessionStorage.getItem(k); } catch { return null; } },
  ssSet:   (k, v) => { try { sessionStorage.setItem(k, v); } catch {} },
  ssRemove:(k)    => { try { sessionStorage.removeItem(k); } catch {} },
};

/* ═══════════════════════════════════════════════════════════
   DOM SHORTCUT
═══════════════════════════════════════════════════════════ */
const $ = (id) => document.getElementById(id);

/* ═══════════════════════════════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════════════════════════════ */
function initCursor() {
  if ('ontouchstart' in window || window.matchMedia('(hover: none)').matches) return;

  const dot  = $('cursorDot');
  const ring = $('cursorRing');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      visible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
    visible = false;
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
    visible = true;
  });

  document.addEventListener('mousedown', () => ring.classList.add('clicking'));
  document.addEventListener('mouseup',   () => ring.classList.remove('clicking'));

  function bindHover() {
    document.querySelectorAll(
      'a, button, input, textarea, select, label, .feature-card, ' +
      '.testimonial-card, .pricing-card, .faq-question, .lib-card, ' +
      '.quick-btn, .action-btn, .team-card, .value-card, .how-step'
    ).forEach(el => {
      if (el._cursorBound) return;
      el._cursorBound = true;
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
  }

  bindHover();
  window.__rebindCursor = bindHover;

  (function animate() {
    const speed = 0.11;
    rx += (mx - rx) * speed;
    ry += (my - ry) * speed;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animate);
  })();
}

/* ═══════════════════════════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════════════════════════ */
function initTypewriter() {
  const el = $('typewriterText');
  if (!el) return;

  const words = ['IA', 'Claude', 'Tecnologia', 'Inovação'];
  let wi = 0, ci = words[0].length, deleting = false;

  function tick() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ci);
      ci++;
      if (ci > word.length) {
        ci = word.length;
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 130);
    } else {
      el.textContent = word.slice(0, ci);
      ci--;
      if (ci < 0) {
        ci = 0;
        deleting = false;
        wi = (wi + 1) % words.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 55);
    }
  }

  setTimeout(tick, 1800);
}

/* ═══════════════════════════════════════════════════════════
   HERO PARALLAX
═══════════════════════════════════════════════════════════ */
function initHeroParallax() {
  const visual = document.querySelector('.hero-visual');
  const hero   = document.querySelector('.hero');
  if (!visual || !hero) return;

  let ticking = false;
  document.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      if (rect.height === 0) { ticking = false; return; }
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const dx = (e.clientX - rect.left - cx) / cx;
      const dy = (e.clientY - rect.top  - cy) / cy;
      visual.style.transform = `translate(${dx * 14}px, ${dy * 8}px)`;
      ticking = false;
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-fade');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   FAQ ACCORDION
═══════════════════════════════════════════════════════════ */
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const isOpen = item.classList.toggle('open');

  if (isOpen) {
    answer.style.maxHeight = answer.scrollHeight + 'px';
  } else {
    answer.style.maxHeight = '0';
  }

  // Close others
  document.querySelectorAll('.faq-item.open').forEach(other => {
    if (other === item) return;
    other.classList.remove('open');
    const ans = other.querySelector('.faq-answer');
    if (ans) ans.style.maxHeight = '0';
  });
}

/* ═══════════════════════════════════════════════════════════
   PRICING TOGGLE
═══════════════════════════════════════════════════════════ */
let _pricingPeriod = 'monthly';

function setPricingPeriod(period) {
  _pricingPeriod = period;
  $('pricingMonthly').classList.toggle('active', period === 'monthly');
  $('pricingAnnual').classList.toggle('active',  period === 'annual');

  document.querySelectorAll('.pricing-amount').forEach(el => {
    el.textContent = period === 'annual' ? el.dataset.annual : el.dataset.monthly;
  });

  const periodEls = document.querySelectorAll('[id^="pricingPeriod"]');
  periodEls.forEach(el => {
    el.textContent = period === 'annual' ? '/mês (cobrado anualmente)' : '/mês';
  });
}

/* ═══════════════════════════════════════════════════════════
   POMODORO TIMER
═══════════════════════════════════════════════════════════ */
const pomo = {
  mode:       'work',
  workMins:   25,
  breakMins:  5,
  mins:       25,
  secs:       0,
  running:    false,
  interval:   null,
  sessions:   0,
  totalCircum: 326.73,
};

function pomodoroToggle() {
  if (pomo.running) {
    pomoPause();
  } else {
    pomoStart();
  }
}

function pomoStart() {
  pomo.running = true;
  updatePomodoroBtn(true);
  pomo.interval = setInterval(pomodoroTick, 1000);
}

function pomoPause() {
  pomo.running = false;
  clearInterval(pomo.interval);
  pomo.interval = null;
  updatePomodoroBtn(false);
}

function pomodoroTick() {
  if (pomo.secs === 0) {
    if (pomo.mins === 0) {
      pomodoroPhaseEnd();
      return;
    }
    pomo.mins--;
    pomo.secs = 59;
  } else {
    pomo.secs--;
  }
  updatePomodoroDisplay();
}

function pomodoroPhaseEnd() {
  clearInterval(pomo.interval);
  pomo.interval = null;
  pomo.running = false;

  if (pomo.mode === 'work') {
    pomo.sessions = Math.min(pomo.sessions + 1, 4);
    pomo.mode  = 'break';
    pomo.mins  = pomo.breakMins;
    showToast('☕ Sessão concluída! Hora de descansar 5 minutos.', 'success');
  } else {
    pomo.mode = 'work';
    pomo.mins = pomo.workMins;
    if (pomo.sessions >= 4) pomo.sessions = 0;
    showToast('📚 Pausa finalizada! Hora de estudar.', 'info');
  }
  pomo.secs = 0;
  updatePomodoroBtn(false);
  updatePomodoroDisplay();
}

function pomodoroReset() {
  clearInterval(pomo.interval);
  pomo.interval = null;
  pomo.running  = false;
  pomo.mode     = 'work';
  pomo.mins     = pomo.workMins;
  pomo.secs     = 0;
  updatePomodoroBtn(false);
  updatePomodoroDisplay();
}

function pomodoroSkip() {
  clearInterval(pomo.interval);
  pomo.interval = null;
  pomo.running  = false;
  pomodoroPhaseEnd();
}

function updatePomodoroBtn(running) {
  const btn   = $('pomodoroStartBtn');
  const icon  = $('pomodoroPlayIcon');
  const label = $('pomodoroStartLabel');
  if (!btn) return;

  if (running) {
    if (icon) icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    if (label) label.textContent = 'Pausar';
  } else {
    if (icon) icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    if (label) label.textContent = 'Iniciar';
  }
}

function updatePomodoroDisplay() {
  const timeEl  = $('pomodoroTime');
  const labelEl = $('pomodoroLabel');
  const modeEl  = $('pomodoroMode');
  const progEl  = $('pomodoroProgress');

  if (timeEl) {
    const mm = String(pomo.mins).padStart(2, '0');
    const ss = String(pomo.secs).padStart(2, '0');
    timeEl.textContent = `${mm}:${ss}`;
  }

  const isWork = pomo.mode === 'work';
  if (labelEl) labelEl.textContent = isWork ? 'Estudar' : 'Descansar';
  if (modeEl)  modeEl.textContent  = isWork ? 'Foco' : 'Pausa';

  // Update SVG progress ring
  if (progEl) {
    const totalSecs   = (isWork ? pomo.workMins : pomo.breakMins) * 60;
    const remainSecs  = pomo.mins * 60 + pomo.secs;
    const pct         = remainSecs / totalSecs;
    const offset      = pomo.totalCircum * (1 - pct);
    progEl.style.strokeDashoffset = offset;
  }

  // Update session dots
  for (let i = 1; i <= 4; i++) {
    const dot = $(`ps${i}`);
    if (!dot) continue;
    dot.classList.toggle('done',   i <= pomo.sessions - 1);
    dot.classList.toggle('active', i === pomo.sessions || (pomo.sessions === 0 && i === 1));
  }
}

function injectPomodoroGradient() {
  const svgs = document.querySelectorAll('.pomodoro-svg');
  svgs.forEach(svg => {
    if (svg.querySelector('#pomoGrad')) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="pomoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#AA2340"/>
        <stop offset="100%" stop-color="#c42b4c"/>
      </linearGradient>`;
    svg.prepend(defs);
  });
}

/* ═══════════════════════════════════════════════════════════
   ROUTER / NAVIGATION
═══════════════════════════════════════════════════════════ */
function navigate(page, sub) {
  if (APP_PAGES.includes(page) && !state.user) {
    showToast('Faça login para acessar esta área.', 'info');
    page = 'auth';
    sub  = 'login';
  }

  state.page = page;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = $(`page-${page}`);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  const footer = $('footer');
  if (footer) footer.style.display = PUBLIC_PAGES.includes(page) && page !== 'auth' ? '' : 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'auth')        initAuthPage(sub || 'login');
  if (page === 'dashboard')   initDashboard();
  if (page === 'profile')     initProfile();
  if (page === 'library')     renderLibrary();
  if (page === 'home')        { initParticles(); initStatCounters(); initScrollReveal(); initTypewriter(); initHeroParallax(); }
  if (page === 'new-content') initNewContent();

  const mm = $('mobileMenu');
  if (mm && mm.classList.contains('open')) toggleMobileMenu();

  if (window.__rebindCursor) window.__rebindCursor();
}

/* ═══════════════════════════════════════════════════════════
   HEADER BEHAVIOR
═══════════════════════════════════════════════════════════ */
function updateHeader() {
  const loggedIn = !!state.user;
  document.querySelectorAll('.auth-only').forEach(el => el.classList.toggle('hidden', !loggedIn));
  $('guestActions').classList.toggle('hidden', loggedIn);
  $('userActions').classList.toggle('hidden', !loggedIn);
  $('mobileGuestActions').classList.toggle('hidden', loggedIn);
  $('mobileUserActions').classList.toggle('hidden', !loggedIn);

  if (loggedIn) {
    const initials = getInitials(state.user.name);
    $('headerAvatar').textContent = initials;
    $('headerName').textContent   = state.user.name.split(' ')[0];
  }
}

function initScrollHeader() {
  const header = $('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════════════════════════ */
function toggleMobileMenu() {
  const menu    = $('mobileMenu');
  const overlay = $('mobileOverlay');
  const burger  = $('hamburger');
  const isOpen  = menu.classList.toggle('open');
  overlay.classList.toggle('show', isOpen);
  burger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  burger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}

/* ═══════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════ */
function initAuthPage(tab) { switchAuthTab(tab); }

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  $('tabLogin').classList.toggle('active', isLogin);
  $('tabRegister').classList.toggle('active', !isLogin);
  $('loginForm').classList.toggle('hidden', !isLogin);
  $('registerForm').classList.toggle('hidden', isLogin);
  clearAllFormErrors();
}

async function handleLogin(e) {
  e.preventDefault();
  clearAllFormErrors();

  const email    = $('loginEmail').value.trim();
  const password = $('loginPassword').value;
  let valid = true;

  if (!email || !isValidEmail(email)) { showFieldError('loginEmailErr', 'Insira um e-mail válido.'); valid = false; }
  if (!password) { showFieldError('loginPasswordErr', 'Insira sua senha.'); valid = false; }
  if (!valid) return;

  const stored = store.get(LS_USER);
  if (stored && stored.password && !stored.passwordHash) {
    store.remove(LS_USER);
    showToast('Conta antiga detectada. Por favor, cadastre-se novamente.', 'info');
    switchAuthTab('register');
    return;
  }

  const hashed = await hashPwd(password);
  if (!stored || stored.email !== email || stored.passwordHash !== hashed) {
    showFieldError('loginPasswordErr', 'E-mail ou senha incorretos.');
    return;
  }

  loginUser(stored);
}

async function handleRegister(e) {
  e.preventDefault();
  clearAllFormErrors();

  const name       = $('regName').value.trim();
  const email      = $('regEmail').value.trim();
  const phone      = $('regPhone').value.trim();
  const university = $('regUniversity').value.trim();
  const course     = $('regCourse').value.trim();
  const password   = $('regPassword').value;
  const confirm    = $('regConfirm').value;
  let valid = true;

  if (name.length < 3) { showFieldError('regNameErr', 'Nome deve ter ao menos 3 caracteres.'); valid = false; }
  if (!isValidEmail(email)) { showFieldError('regEmailErr', 'Insira um e-mail válido.'); valid = false; }
  if (!isValidPhone(phone)) { showFieldError('regPhoneErr', 'Telefone inválido. Use (XX) 9XXXX-XXXX.'); valid = false; }
  if (university.length < 2) { showFieldError('regUniversityErr', 'Informe sua faculdade.'); valid = false; }
  if (course.length < 2) { showFieldError('regCourseErr', 'Informe seu curso.'); valid = false; }

  const pwdCheck = checkPasswordStrength(password);
  if (pwdCheck.score < 4) { showFieldError('regPasswordErr', 'A senha não atende todos os requisitos.'); valid = false; }
  if (password !== confirm) { showFieldError('regConfirmErr', 'As senhas não coincidem.'); valid = false; }
  if (!valid) return;

  const passwordHash = await hashPwd(password);
  const user = { name, email, phone, university, course, passwordHash };
  store.set(LS_USER, user);
  loginUser(user);
  showToast('Conta criada com sucesso! Bem-vindo ao UniAI. 🎉', 'success');
}

function loginUser(user) {
  state.user = user;
  updateHeader();
  navigate('dashboard');
}

function logout() {
  state.user   = null;
  state.apiKey = '';
  store.ssRemove(SS_KEY);
  updateHeader();
  navigate('home');
  showToast('Você saiu da conta.', 'info');
}

/* ═══════════════════════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════════════════════ */
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function isValidPhone(p) {
  const digits = p.replace(/\D/g, '');
  return digits.length === 11 && digits[2] === '9';
}

function maskPhone(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 11);
  if (v.length >= 3) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  if (v.length >= 10) v = v.slice(0,10) + '-' + v.slice(10);
  input.value = v;
}

function checkPasswordStrength(pwd) {
  const checks = {
    len:   pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    num:   /[0-9]/.test(pwd),
    spec:  /[^A-Za-z0-9]/.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}

function updateStrength(pwd) {
  const { checks, score } = checkPasswordStrength(pwd);
  const bars    = [1,2,3,4].map(i => $(`sb${i}`));
  const labels  = ['Muito fraca','Fraca','Regular','Forte','Muito forte'];
  const classes = ['','weak','fair','good','strong'];

  bars.forEach((b, i) => {
    b.className = 'strength-bar';
    if (i < score) b.classList.add(classes[Math.min(score, 4)]);
  });

  $('strengthText').textContent = pwd ? labels[score] : '';
  $('rule-len').classList.toggle('ok',   checks.len);
  $('rule-upper').classList.toggle('ok', checks.upper);
  $('rule-lower').classList.toggle('ok', checks.lower);
  $('rule-num').classList.toggle('ok',   checks.num);
  $('rule-spec').classList.toggle('ok',  checks.spec);
}

function showFieldError(id, msg) {
  const el = $(id);
  if (el) el.textContent = msg;
  const inputEl = el?.previousElementSibling?.querySelector('.form-input');
  if (inputEl) inputEl.classList.add('error');
}

function clearAllFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
}

function togglePass(inputId, btn) {
  const input = $(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type   = isPass ? 'text' : 'password';
  const eyeOpen   = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  const eyeClosed = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
  const svg = btn.querySelector('svg');
  if (svg) svg.innerHTML = isPass ? eyeClosed : eyeOpen;
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
function initDashboard() {
  if (!state.user) return;

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  $('dashGreeting').textContent = `${greeting}, ${state.user.name.split(' ')[0]}! 👋`;
  $('dashDate').textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const lib = getLibrary();
  $('dashLibCount').textContent     = lib.length;
  $('dashResumosCount').textContent = lib.filter(i => i.type === 'summarize').length;

  renderWeekChart();
  renderDashActivity(lib);
  injectPomodoroGradient();
  updatePomodoroDisplay();
}

function renderWeekChart() {
  const days  = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const hours = [2.5, 3, 1.5, 4, 2, 5, 1];
  const chart = $('weekChart');
  if (!chart) return;
  chart.innerHTML = '';

  const maxH = Math.max(...hours);
  days.forEach((day, i) => {
    const pct  = Math.round((hours[i] / maxH) * 100);
    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `
      <div class="bar-fill" style="height:0%" data-val="${hours[i]}h" data-target="${pct}%"></div>
      <span class="bar-label">${day}</span>`;
    chart.appendChild(item);
  });

  requestAnimationFrame(() => {
    chart.querySelectorAll('.bar-fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.height = bar.dataset.target; }, i * 60);
    });
  });
}

function renderDashActivity(lib) {
  const el = $('dashActivity');
  if (!el) return;

  if (!lib.length) {
    el.innerHTML = `<p class="activity-empty">Nenhum conteúdo salvo ainda. <a href="#" onclick="navigate('new-content');return false;" style="color:var(--primary-l)">Criar agora</a></p>`;
    return;
  }

  el.innerHTML = lib.slice(-3).reverse().map(item => `
    <div class="activity-item" onclick="navigate('library')">
      <div class="activity-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div class="activity-title">${escHtml(item.subject)}</div>
        <div class="activity-meta">${ACTION_META[item.type]?.label ?? 'Conteúdo'} · ${formatDate(item.date)}</div>
      </div>
      <svg class="activity-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════ */
function initProfile() {
  if (!state.user) return;
  const u = state.user;
  $('profileName').value       = u.name;
  $('profileEmail').value      = u.email;
  $('profilePhone').value      = u.phone;
  $('profileUniversity').value = u.university;
  $('profileCourse').value     = u.course;
  $('profilePassword').value   = '••••••••';
  $('profilePassword').type    = 'password';

  const initials = getInitials(u.name);
  $('profileAvatar').textContent      = initials;
  $('profileAvatarName').textContent  = u.name;
  $('profileAvatarCourse').textContent= u.course;
  $('profileUniBadge').textContent    = u.university;

  const lib = getLibrary();
  $('profileStatLib').textContent = lib.length;
}

function toggleEditProfile() {
  const inputs = $('profileForm').querySelectorAll('.form-input');
  const isEdit = $('editProfileBtn').textContent === 'Editar';
  inputs.forEach(inp => {
    if (inp.id !== 'profilePassword' && inp.id !== 'profileEmail') inp.readOnly = !isEdit;
  });
  $('editProfileBtn').textContent = isEdit ? 'Cancelar' : 'Editar';
  $('profileActions').classList.toggle('hidden', !isEdit);
}

function cancelEditProfile() {
  initProfile();
  $('editProfileBtn').textContent = 'Editar';
  $('profileActions').classList.add('hidden');
  $('profileForm').querySelectorAll('.form-input').forEach(inp => inp.readOnly = true);
}

function saveProfile(e) {
  e.preventDefault();
  if (!state.user) return;
  state.user.name       = $('profileName').value.trim();
  state.user.phone      = $('profilePhone').value.trim();
  state.user.university = $('profileUniversity').value.trim();
  state.user.course     = $('profileCourse').value.trim();
  const { passwordHash, email } = state.user;
  store.set(LS_USER, { ...state.user, passwordHash, email });
  updateHeader();
  cancelEditProfile();
  showToast('Perfil atualizado com sucesso!', 'success');
}

/* ═══════════════════════════════════════════════════════════
   LIBRARY
═══════════════════════════════════════════════════════════ */
function getLibrary()         { return store.get(LS_LIB) || []; }
function saveLibraryData(lib) { store.set(LS_LIB, lib); state.library = lib; }

function renderLibrary(filter) {
  let lib = getLibrary();
  if (filter) lib = lib.filter(item =>
    item.subject.toLowerCase().includes(filter.toLowerCase()) ||
    (item.title && item.title.toLowerCase().includes(filter.toLowerCase()))
  );

  const grid  = $('libraryGrid');
  const empty = $('libraryEmpty');
  if (!grid || !empty) return;

  if (!lib.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = [...lib].reverse().map(item => `
    <div class="lib-card" id="libcard-${item.id}">
      <div class="lib-card-top">
        <span class="lib-card-tag">${escHtml(item.subject)}</span>
        <span class="lib-card-date">${formatDate(item.date)}</span>
      </div>
      <div class="lib-card-title">${escHtml(item.title || ACTION_META[item.type]?.label || 'Conteúdo')}</div>
      <div class="lib-card-preview">${escHtml(item.preview)}</div>
      <div class="lib-card-actions">
        <button class="btn-primary btn-sm" onclick="openChatModal('${item.id}')">Abrir conversa</button>
        <button class="btn-ghost btn-sm" onclick="deleteLibItem('${item.id}')">Excluir</button>
      </div>
    </div>`).join('');

  if (window.__rebindCursor) window.__rebindCursor();
}

function filterLibrary(val) { renderLibrary(val); }

function deleteLibItem(id) {
  const lib = getLibrary().filter(i => i.id !== id);
  saveLibraryData(lib);
  renderLibrary($('librarySearch')?.value || '');
  showToast('Item removido da biblioteca.', 'info');
}

/* ═══════════════════════════════════════════════════════════
   CHAT MODAL
═══════════════════════════════════════════════════════════ */
function openChatModal(id) {
  const lib  = getLibrary();
  const item = lib.find(i => i.id === id);
  if (!item) return;

  state.currentItem = item;
  $('chatTitle').textContent   = ACTION_META[item.type]?.label || 'Chat Acadêmico';
  $('chatSubject').textContent = item.subject;

  const msgs = $('chatMessages');
  msgs.innerHTML = '';
  appendChatMsg('ai', `Olá! Estou pronto para conversar sobre **${item.subject}**.\n\nAqui está o que já temos:\n\n${item.preview}\n\nPode me fazer qualquer pergunta sobre este conteúdo!`);
  (item.conversation || []).forEach(m => appendChatMsg(m.role, m.text));

  $('chatModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('chatInput').focus(), 100);
}

function closeChatModal(e) {
  if (e && e.target !== $('chatModal')) return;
  $('chatModal').classList.add('hidden');
  document.body.style.overflow = '';
  state.currentItem = null;
}

function appendChatMsg(role, text, isLoading) {
  const msgs = $('chatMessages');
  const div  = document.createElement('div');
  div.className = `msg ${role}`;
  div.id = isLoading ? 'chatLoadingMsg' : '';

  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isLoading) {
    div.innerHTML = `<div class="msg-bubble ai"><div class="chat-loading-bubble"><span></span><span></span><span></span></div></div>`;
  } else {
    div.innerHTML = `<div class="msg-bubble">${renderMarkdown(text)}</div><span class="msg-time">${time}</span>`;
  }

  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function chatKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
}

async function sendChatMessage() {
  const input = $('chatInput');
  const text  = input.value.trim();
  if (!text || !state.currentItem) return;

  if (!state.apiKey) {
    showToast('Configure sua chave de API em "Novo Conteúdo" antes de usar o chat.', 'info');
    return;
  }

  input.value = '';
  $('chatSendBtn').disabled = true;
  appendChatMsg('user', text);

  const loadingEl = appendChatMsg('ai', '', true);
  const prompt = `Você é um assistente acadêmico especializado. O aluno está estudando "${state.currentItem.subject}".\n\nConteúdo de referência:\n${state.currentItem.content.slice(0, 2000)}\n\nResposta gerada anteriormente:\n${state.currentItem.preview}\n\nResponda à seguinte dúvida do aluno de forma clara, didática e direta:\n${text}`;

  try {
    const reply = await callClaude(prompt, state.apiKey);
    loadingEl.remove();
    appendChatMsg('ai', reply);

    const lib  = getLibrary();
    const item = lib.find(i => i.id === state.currentItem.id);
    if (item) {
      if (!item.conversation) item.conversation = [];
      item.conversation.push({ role: 'user', text });
      item.conversation.push({ role: 'ai',   text: reply });
      saveLibraryData(lib);
    }
  } catch (err) {
    loadingEl.remove();
    appendChatMsg('ai', `Desculpe, ocorreu um erro: ${err.message}`);
  } finally {
    $('chatSendBtn').disabled = false;
    input.focus();
  }
}

/* ═══════════════════════════════════════════════════════════
   NEW CONTENT PAGE
═══════════════════════════════════════════════════════════ */
function initNewContent() {
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const savedKey = store.ssGet(SS_KEY);
  if (savedKey) {
    state.apiKey = savedKey;
    $('ncApiKey').value = savedKey;
    setApiStatusDot(true);
    collapseApiSection();
  } else {
    expandApiSection();
  }

  switchInputTab('text');
  updateNcStats();
}

function onApiKeyInput(val) {
  const trimmed = val.trim();
  state.apiKey = trimmed;
  if ((trimmed.startsWith('sk-') && trimmed.length > 20) || trimmed === DEMO_KEY) {
    store.ssSet(SS_KEY, trimmed);
    setApiStatusDot(true);
    $('apiToggleLabel').textContent = trimmed === DEMO_KEY
      ? 'Modo Demo — Ativo ✓'
      : 'API Anthropic — Configurada ✓';
  } else {
    store.ssRemove(SS_KEY);
    setApiStatusDot(false);
    $('apiToggleLabel').textContent = 'Configurar Chave da API Anthropic';
  }
}

function setApiStatusDot(active) {
  const dot = $('apiStatusDot');
  if (dot) dot.classList.toggle('active', active);
}

function toggleApiSection() {
  const body    = $('apiBody');
  const chevron = $('apiChevron');
  const isOpen  = body.classList.toggle('open');
  chevron.classList.toggle('open', isOpen);
}
function expandApiSection()   { $('apiBody').classList.add('open');    $('apiChevron').classList.add('open'); }
function collapseApiSection() { $('apiBody').classList.remove('open'); $('apiChevron').classList.remove('open'); }

function onNcContentInput() {
  updateNcStats();
  const val = $('ncContent').value;
  $('ncClearBtn').style.display = val ? '' : 'none';
  autoResizeTextarea($('ncContent'));
}

function updateNcStats() {
  const text  = $('ncContent')?.value || '';
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const wEl   = $('ncWordCount');
  const cEl   = $('ncCharCount');
  if (wEl) wEl.textContent = `${words.toLocaleString('pt-BR')} palavras`;
  if (cEl) cEl.textContent = `${chars.toLocaleString('pt-BR')} caracteres`;
}

function clearNcContent() {
  $('ncContent').value = '';
  $('ncContent').style.height = 'auto';
  $('ncClearBtn').style.display = 'none';
  updateNcStats();
  $('ncContent').focus();
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 500) + 'px';
}

async function handleNcAction(type) {
  const isTextMode = !$('ncTabPDF')?.classList.contains('active');
  const content    = isTextMode ? $('ncContent').value.trim() : pdfState.text;
  const apiKey     = state.apiKey || $('ncApiKey').value.trim();

  if (!apiKey || (!apiKey.startsWith('sk-') && apiKey !== DEMO_KEY)) {
    showToast('Insira uma chave de API válida antes de continuar.', 'error');
    expandApiSection();
    return;
  }
  if (!content) {
    const msg = isTextMode ? 'Cole o conteúdo de estudo antes de usar esta função.' : 'Envie um PDF antes de usar esta função.';
    showToast(msg, 'error');
    if (isTextMode) $('ncContent').focus();
    return;
  }
  if (content.length > 80000) {
    showToast('Conteúdo muito longo. Limite de 80.000 caracteres.', 'error');
    return;
  }

  state.ncLastText     = content;
  state.ncLastType     = type;
  state.ncLastResponse = '';
  state.apiKey         = apiKey;
  store.ssSet(SS_KEY, apiKey);

  const prompt = buildNcPrompt(type, content);
  const meta   = ACTION_META[type];

  setNcLoading(true, type, meta.label);
  setNcButtons(true);

  const responseEl = $('ncResponse');
  const quizEl     = $('ncQuiz');
  responseEl.classList.add('hidden'); responseEl.innerHTML = '';
  quizEl.classList.add('hidden');     quizEl.innerHTML = '';

  if (state.abortCtrl) state.abortCtrl.abort();
  state.abortCtrl = new AbortController();

  const timeout = setTimeout(() => {
    if (state.abortCtrl) state.abortCtrl.abort();
    showToast('Tempo limite atingido. Verifique sua conexão.', 'error');
    setNcLoading(false); setNcButtons(false);
  }, TIMEOUT_MS);

  let streamStarted = false;
  try {
    const result = await callClaudeStream(prompt, apiKey, state.abortCtrl.signal, (chunk) => {
      if (!streamStarted) {
        streamStarted = true;
        $('ncLoading').classList.add('hidden');
        stopLoadingMsgRotation();
        responseEl.classList.remove('hidden');
        $('ncAbortBtn').classList.remove('hidden');
      }
      responseEl.innerHTML = `<div class="nc-stream-text">${escHtml(chunk)}<span class="stream-cursor"></span></div>`;
    });

    clearTimeout(timeout);
    state.ncLastResponse = result;

    if (type === 'quiz') {
      showNcQuiz(result, meta.label);
    } else {
      showNcResponse(result, meta.label);
    }
  } catch (err) {
    clearTimeout(timeout);
    if (err.name !== 'AbortError') showToast(`Erro: ${err.message}`, 'error');
    setNcLoading(false); setNcEmpty();
  } finally {
    state.abortCtrl = null;
    setNcButtons(false);
    stopLoadingMsgRotation();
  }
}

function buildNcPrompt(type, content) {
  const c = content.slice(0, 12000);
  const prompts = {
    summarize:
`Você é um assistente acadêmico especializado em universitários brasileiros. Crie um resumo didático, completo e bem estruturado do conteúdo abaixo.

Use exatamente este formato:

## 📋 Resumo Geral
[2-3 parágrafos resumindo os pontos centrais]

## 🎯 Conceitos-Chave
[Lista com os 5-8 conceitos mais importantes, cada um com uma breve explicação]

## 📌 Destaques Importantes
[3-5 pontos que merecem atenção especial]

## 💡 Conexões e Aplicações
[Como este conteúdo se relaciona com outros temas ou aplica na prática]

## ✅ O que você precisa saber (para a prova)
[Lista dos 5 pontos essenciais para memorizar]

---
Conteúdo:
${c}`,

    questions:
`Você é um professor universitário experiente. Crie 5 questões dissertativas desafiadoras sobre o conteúdo abaixo, seguidas de gabarito comentado.

Use exatamente este formato:

## 📝 Questões de Revisão

**Questão 1:** [Pergunta que exige compreensão profunda]

**Questão 2:** [Pergunta analítica]

**Questão 3:** [Pergunta aplicada]

**Questão 4:** [Pergunta comparativa ou síntese]

**Questão 5:** [Pergunta desafiadora]

---

## ✅ Gabarito Comentado

**Questão 1 — Resposta:**
[Resposta completa com explicação didática]

**Questão 2 — Resposta:**
[Idem]

**Questão 3 — Resposta:**
[Idem]

**Questão 4 — Resposta:**
[Idem]

**Questão 5 — Resposta:**
[Idem]

---
Conteúdo:
${c}`,

    explain:
`Você é um tutor especializado em tornar conteúdo complexo simples. Explique o conteúdo abaixo de forma absolutamente clara.

Use exatamente este formato:

## 🧠 Do que se trata?
[Explicação em 1-2 frases, como se fosse para alguém que nunca ouviu falar]

## 🔍 Como funciona?
[Passo a passo simplificado, como uma receita]

## 💡 Analogia do Dia a Dia
[Uma comparação criativa com algo cotidiano]

## 📚 Exemplo Concreto
[Um exemplo prático e real]

## ⚠️ Cuidado com estes erros comuns
[2-3 equívocos frequentes]

## ✅ Em Resumo — 3 coisas para lembrar
1. [Ponto 1]
2. [Ponto 2]
3. [Ponto 3]

---
Conteúdo:
${c}`,

    quiz:
`Você é um professor. Crie um quiz interativo com 5 questões de múltipla escolha sobre o conteúdo abaixo.

IMPORTANTE: Responda SOMENTE com JSON válido, sem texto adicional antes ou depois. Use este formato exato:
{
  "title": "Quiz: [Tema do Conteúdo]",
  "questions": [
    {
      "q": "Texto claro e direto da pergunta?",
      "opts": ["Opção A completa", "Opção B completa", "Opção C completa", "Opção D completa"],
      "ans": 0,
      "exp": "Explicação educativa de por que esta é a resposta correta, mencionando por que as outras estão erradas"
    }
  ]
}

Regras:
- Questões que testam compreensão real, não memorização mecânica
- Opções incorretas devem ser plausíveis (distratores de qualidade)
- "ans" é o índice (0-3) da opção correta
- Explicações devem ser educativas e completas

---
Conteúdo:
${c}`,

    schedule:
`Você é um especialista em produtividade acadêmica e ciência do aprendizado. Crie um cronograma de estudos semanal personalizado para o conteúdo abaixo.

Use exatamente este formato:

## 📅 Plano de Estudos Semanal

### 🎯 Objetivo da Semana
[O que o aluno vai dominar ao final dos 7 dias]

### 📐 Metodologia Aplicada
[Técnicas utilizadas: Pomodoro, Espaçamento, Active Recall, etc.]

---

### Segunda-feira
**⏱ Sessão 1 (45 min):** [Tópico específico + atividade]
**🔄 Revisão (15 min):** [O que revisar da sessão]
**🎯 Meta do dia:** [Resultado esperado]

### Terça-feira
[Mesmo formato]

### Quarta-feira
[Mesmo formato]

### Quinta-feira
[Mesmo formato]

### Sexta-feira
[Mesmo formato]

### Sábado
[Mesmo formato — revisão geral]

### Domingo
**🧘 Descanso ativo:** [Leitura leve ou revisão flash cards apenas]

---

### ✅ Checklist de Progresso
[Lista de verificação com os marcos a atingir]

### 📱 Apps e Recursos Recomendados
[Ferramentas úteis para estudar este conteúdo]

---
Conteúdo:
${c}`,
  };
  return prompts[type] || prompts.summarize;
}

function setNcLoading(on, typeOrText, label) {
  $('ncLoading').classList.toggle('hidden', !on);
  $('ncEmpty').classList.add('hidden');
  $('ncResponse').classList.add('hidden');
  $('ncQuiz')?.classList.add('hidden');
  $('ncAbortBtn').classList.toggle('hidden', !on);
  $('ncCopyBtn').classList.add('hidden');
  $('ncExportBtn').classList.add('hidden');
  $('ncSaveBtn').classList.add('hidden');

  if (on) {
    $('ncResponseLabel').innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> ${label || 'Resposta da IA'}`;
    startLoadingMsgRotation(typeOrText);
  } else {
    stopLoadingMsgRotation();
  }
}

function startLoadingMsgRotation(type) {
  const msgs = LOADING_MSGS[type] || LOADING_MSGS.summarize;
  let idx = 0;
  const el = $('ncLoadingText');
  if (el) el.textContent = msgs[0];
  stopLoadingMsgRotation();
  loadingMsgTimer = setInterval(() => {
    idx = (idx + 1) % msgs.length;
    const el2 = $('ncLoadingText');
    if (!el2) return;
    el2.style.opacity = '0';
    setTimeout(() => { el2.textContent = msgs[idx]; el2.style.opacity = '1'; }, 200);
  }, 2200);
}

function stopLoadingMsgRotation() {
  if (loadingMsgTimer) { clearInterval(loadingMsgTimer); loadingMsgTimer = null; }
}

function showNcResponse(text, label) {
  $('ncLoading').classList.add('hidden');
  $('ncAbortBtn').classList.add('hidden');
  $('ncEmpty').classList.add('hidden');
  $('ncQuiz').classList.add('hidden');
  $('ncResponse').classList.remove('hidden');
  $('ncCopyBtn').classList.remove('hidden');
  $('ncExportBtn').classList.remove('hidden');
  $('ncSaveBtn').classList.remove('hidden');
  $('ncResponse').innerHTML = renderMarkdown(text);
  $('ncResponseLabel').innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> ${label}`;
  $('ncResponseCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setNcEmpty() {
  $('ncEmpty').classList.remove('hidden');
  $('ncResponse').classList.add('hidden');
  $('ncLoading').classList.add('hidden');
  $('ncAbortBtn').classList.add('hidden');
}

function setNcButtons(disabled) {
  ['actSummarize','actQuestions','actExplain','actQuiz','actSchedule'].forEach(id => {
    const btn = $(id);
    if (btn) btn.disabled = disabled;
  });
}

function abortRequest() {
  if (state.abortCtrl) {
    state.abortCtrl.abort();
    showToast('Requisição cancelada.', 'info');
    setNcLoading(false); setNcEmpty(); setNcButtons(false);
  }
}

function copyResponse() {
  const text = $('ncResponse')?.innerText;
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => showToast('Resposta copiada!', 'success'))
    .catch(() => showToast('Não foi possível copiar.', 'error'));
}

/* ═══════════════════════════════════════════════════════════
   SAVE MODAL
═══════════════════════════════════════════════════════════ */
function openSaveModal() {
  $('saveSubject').value = '';
  $('saveTitle').value   = '';
  $('saveModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('saveSubject').focus(), 100);
}

function closeSaveModal(e) {
  if (e && e.target !== $('saveModal')) return;
  $('saveModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function saveToLibrary(e) {
  e.preventDefault();
  const subject = $('saveSubject').value.trim();
  if (!subject) { $('saveSubject').focus(); return; }

  const lib  = getLibrary();
  const item = {
    id:           Date.now().toString(36) + Math.random().toString(36).slice(2),
    subject,
    title:        $('saveTitle').value.trim() || ACTION_META[state.ncLastType]?.label || 'Conteúdo',
    type:         state.ncLastType,
    content:      state.ncLastText,
    preview:      (state.ncLastResponse || '').slice(0, 300),
    date:         new Date().toISOString(),
    conversation: [],
  };

  lib.push(item);
  saveLibraryData(lib);
  closeSaveModal(null);
  showToast(`"${subject}" salvo na Biblioteca!`, 'success');
}

/* ═══════════════════════════════════════════════════════════
   CLAUDE API — NON-STREAMING
═══════════════════════════════════════════════════════════ */
async function callClaude(prompt, apiKey, signal) {
  if (apiKey === DEMO_KEY) {
    await new Promise(r => setTimeout(r, 1200));
    return 'Olá! Estou no **Modo Demo**. Faça qualquer pergunta sobre o conteúdo salvo e responderei com base no material de demonstração. Este modo simula o Chat Acadêmico do UniAI sem consumir créditos de API.';
  }
  const response = await fetch(API_URL, {
    method: 'POST', signal,
    headers: {
      'x-api-key':                                 apiKey,
      'anthropic-version':                         '2023-06-01',
      'content-type':                              'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      if (err?.error?.message) detail = err.error.message;
      else if (response.status === 401) detail = 'Chave de API inválida ou sem permissão.';
      else if (response.status === 429) detail = 'Limite de requisições atingido. Aguarde.';
      else if (response.status >= 500)  detail = 'Erro interno na API. Tente novamente.';
    } catch {}
    throw new Error(detail);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('A API retornou resposta vazia.');
  return text;
}

/* ═══════════════════════════════════════════════════════════
   DEMO MODE — SIMULATED STREAMING
═══════════════════════════════════════════════════════════ */
async function streamDemoContent(prompt, onChunk) {
  const typeMap = {
    'resumo didático':     'summarize',
    'questões dissertativas': 'questions',
    'explique o conteúdo': 'explain',
    'quiz interativo':     'quiz',
    'cronograma de estudos': 'schedule',
  };

  let type = 'summarize';
  for (const [key, val] of Object.entries(typeMap)) {
    if (prompt.toLowerCase().includes(key)) { type = val; break; }
  }

  const text = DEMO_RESPONSES[type] || DEMO_RESPONSES.summarize;
  let accumulated = '';
  const chunkSize = 12;
  const delayMs   = 18;

  for (let i = 0; i < text.length; i += chunkSize) {
    accumulated += text.slice(i, i + chunkSize);
    onChunk(accumulated);
    await new Promise(r => setTimeout(r, delayMs));
  }

  return text;
}

/* ═══════════════════════════════════════════════════════════
   CLAUDE API — STREAMING
═══════════════════════════════════════════════════════════ */
async function callClaudeStream(prompt, apiKey, signal, onChunk) {
  if (apiKey === DEMO_KEY) return streamDemoContent(prompt, onChunk);
  const resp = await fetch(API_URL, {
    method: 'POST', signal,
    headers: {
      'x-api-key':                                 apiKey,
      'anthropic-version':                         '2023-06-01',
      'content-type':                              'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, stream: true, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!resp.ok) {
    let detail = `HTTP ${resp.status}`;
    try {
      const err = await resp.json();
      if (err?.error?.message) detail = err.error.message;
      else if (resp.status === 401) detail = 'Chave de API inválida ou sem permissão.';
      else if (resp.status === 429) detail = 'Limite de requisições atingido. Aguarde.';
      else if (resp.status >= 500)  detail = 'Erro interno na API. Tente novamente.';
    } catch {}
    throw new Error(detail);
  }

  const reader  = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf  = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (!raw || raw === '[DONE]') continue;
      try {
        const ev = JSON.parse(raw);
        if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
          full += ev.delta.text;
          onChunk(full);
        }
      } catch {}
    }
  }

  return full;
}

/* ═══════════════════════════════════════════════════════════
   MARKDOWN RENDERER
═══════════════════════════════════════════════════════════ */
function renderMarkdown(raw) {
  if (!raw) return '';
  const lines = String(raw).split('\n');
  const out   = [];
  let inUl = false, inOl = false;

  const closeList = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  const inline = (t) =>
    escHtml(t)
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,         '<em>$1</em>')
      .replace(/`(.+?)`/g,           '<code>$1</code>');

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (/^---+$/.test(line)) { closeList(); out.push('<hr>'); continue; }
    const h1 = line.match(/^#{1}\s+(.+)/); if (h1) { closeList(); out.push(`<h2>${inline(h1[1])}</h2>`); continue; }
    const h2 = line.match(/^#{2}\s+(.+)/); if (h2) { closeList(); out.push(`<h2>${inline(h2[1])}</h2>`); continue; }
    const h3 = line.match(/^#{3}\s+(.+)/); if (h3) { closeList(); out.push(`<h3>${inline(h3[1])}</h3>`); continue; }
    const h4 = line.match(/^#{4}\s+(.+)/); if (h4) { closeList(); out.push(`<h4>${inline(h4[1])}</h4>`); continue; }
    const ul = line.match(/^[-*]\s+(.+)/);
    if (ul) { if (inOl) { out.push('</ol>'); inOl = false; } if (!inUl) { out.push('<ul>'); inUl = true; } out.push(`<li>${inline(ul[1])}</li>`); continue; }
    const ol = line.match(/^\d+\.\s+(.+)/);
    if (ol) { if (inUl) { out.push('</ul>'); inUl = false; } if (!inOl) { out.push('<ol>'); inOl = true; } out.push(`<li>${inline(ol[1])}</li>`); continue; }
    closeList();
    out.push(line === '' ? '<br>' : `<p>${inline(line)}</p>`);
  }

  closeList();
  return out.join('');
}

/* ═══════════════════════════════════════════════════════════
   PARTICLE CANVAS (enhanced with mouse)
═══════════════════════════════════════════════════════════ */
let particleRAF = null;

function initParticles() {
  const canvas = $('particleCanvas');
  if (!canvas) return;

  if (particleRAF) cancelAnimationFrame(particleRAF);

  const ctx = canvas.getContext('2d');
  let W, H, particles;
  let mouseX = -1000, mouseY = -1000;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeParticle() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r:  Math.random() * 2 + 0.8,
    };
  }

  function initP() {
    resize();
    const count = Math.min(Math.floor((W * H) / 12000), 100);
    particles   = Array.from({ length: count }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Mouse repulsion
      if (mouseX > 0) {
        const dx   = p.x - mouseX;
        const dy   = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          const force = (100 - dist) / 100 * 0.9;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Speed cap + damping
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 2.5) { p.vx *= 2.5 / speed; p.vy *= 2.5 / speed; }
      p.vx *= 0.97;
      p.vy *= 0.97;

      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(170,35,64,0.6)';
      ctx.fill();
    });

    // Connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(170,35,64,${0.18 * (1 - dist / 130)})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }

    particleRAF = requestAnimationFrame(draw);
  }

  initP();
  draw();

  const ro = new ResizeObserver(() => initP());
  ro.observe(canvas.parentElement);
}

/* ═══════════════════════════════════════════════════════════
   STAT COUNTERS
═══════════════════════════════════════════════════════════ */
let countersAnimated = false;

function initStatCounters() {
  if (countersAnimated) return;

  const grid = $('statsGrid');
  if (!grid) return;

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    countersAnimated = true;

    grid.querySelectorAll('.stat-value').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '+';
      animateCount(el, 0, target, suffix, 1800);
    });
  }, { threshold: 0.3 });

  observer.observe(grid);
}

function animateCount(el, from, to, suffix, duration) {
  const start = performance.now();
  const step  = (now) => {
    const t    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val  = Math.floor(from + (to - from) * ease);
    el.textContent = val >= 1000 ? val.toLocaleString('pt-BR') + suffix : val + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${escHtml(message)}</span>`;
  $('toastContainer').appendChild(toast);

  const dismiss = () => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  const timer = setTimeout(dismiss, 4500);
  toast.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
}

/* ═══════════════════════════════════════════════════════════
   TASK TOGGLE
═══════════════════════════════════════════════════════════ */
function toggleTask(checkbox) {
  checkbox.closest('.task-item').classList.toggle('done', checkbox.checked);
}

/* ═══════════════════════════════════════════════════════════
   UTILITY HELPERS
═══════════════════════════════════════════════════════════ */
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getInitials(name) {
  return (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

/* ═══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
═══════════════════════════════════════════════════════════ */
function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      const nc = $('ncContent');
      if (document.activeElement === nc) { e.preventDefault(); handleNcAction('summarize'); }
    }
    if (e.key === 'Escape') {
      $('chatModal').classList.add('hidden');
      $('saveModal').classList.add('hidden');
      document.body.style.overflow = '';
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   INPUT TABS (Text / PDF)
═══════════════════════════════════════════════════════════ */
function switchInputTab(tab) {
  const isText = tab === 'text';
  $('ncTabTexto')?.classList.toggle('active', isText);
  $('ncTabPDF')?.classList.toggle('active',  !isText);
  $('ncTextPane')?.classList.toggle('hidden', !isText);
  $('ncPdfPane')?.classList.toggle('hidden',  isText);
}

/* ═══════════════════════════════════════════════════════════
   PDF DRAG-AND-DROP & EXTRACTION
═══════════════════════════════════════════════════════════ */
function pdfDragOver(e) { e.preventDefault(); e.stopPropagation(); $('pdfDropZone')?.classList.add('drag-over'); }
function pdfDragLeave(e) { e.preventDefault(); e.stopPropagation(); $('pdfDropZone')?.classList.remove('drag-over'); }
function pdfDrop(e) {
  e.preventDefault(); e.stopPropagation();
  $('pdfDropZone')?.classList.remove('drag-over');
  const file = e.dataTransfer?.files?.[0];
  if (file) handlePdfFile(file);
}

async function handlePdfFile(file) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    showToast('Envie apenas arquivos PDF.', 'error'); return;
  }
  const MAX = 10 * 1024 * 1024;
  if (file.size > MAX) { showToast('Arquivo muito grande. Máximo 10 MB.', 'error'); return; }

  pdfState.fileName = file.name;
  pdfState.size     = file.size;

  $('pdfDropZone').classList.add('hidden');
  $('pdfFileInfo').classList.remove('hidden');
  $('pdfFileName').textContent  = file.name;
  $('pdfFileStats').textContent = `${(file.size / 1024).toFixed(0)} KB · Extraindo texto...`;
  $('pdfProgressBar').style.width  = '5%';
  $('pdfProgressText').textContent = 'Iniciando extração...';
  $('pdfExtractProgress').classList.remove('hidden');

  try {
    const text = await extractPdfText(file);
    pdfState.text = text;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    $('pdfFileStats').textContent = `${pdfState.pages} ${pdfState.pages === 1 ? 'página' : 'páginas'} · ${words.toLocaleString('pt-BR')} palavras extraídas`;
    $('pdfExtractProgress').classList.add('hidden');
    const preview = $('pdfTextPreview');
    if (preview) { preview.textContent = text.slice(0, 300) + (text.length > 300 ? '...' : ''); }
    showToast(`PDF processado com sucesso! ${words.toLocaleString('pt-BR')} palavras.`, 'success');
  } catch {
    showToast('Erro ao extrair texto do PDF. Tente outro arquivo.', 'error');
    clearPdf();
  }
}

async function extractPdfText(file) {
  if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js não carregado.');
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  pdfState.pages = pdf.numPages;

  let full = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const pct = Math.round((i / pdf.numPages) * 100);
    $('pdfProgressBar').style.width  = pct + '%';
    $('pdfProgressText').textContent = `Extraindo página ${i} de ${pdf.numPages}...`;
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text    = content.items.map(item => item.str).join(' ').trim();
    if (text) full += (i > 1 ? '\n\n' : '') + `[Página ${i}]\n${text}`;
    await new Promise(r => setTimeout(r, 5));
  }

  $('pdfProgressBar').style.width  = '100%';
  $('pdfProgressText').textContent = 'Extração concluída!';
  return full.trim();
}

function clearPdf() {
  pdfState.text = ''; pdfState.pages = 0; pdfState.fileName = ''; pdfState.size = 0;
  $('pdfDropZone')?.classList.remove('hidden');
  $('pdfFileInfo')?.classList.add('hidden');
  $('pdfTextPreview')?.classList.add('hidden');
  const input = $('pdfFileInput');
  if (input) input.value = '';
}

/* ═══════════════════════════════════════════════════════════
   QUIZ — DISPLAY, INTERACTION, RESULT
═══════════════════════════════════════════════════════════ */
function showNcQuiz(jsonText, label) {
  $('ncLoading').classList.add('hidden');
  $('ncAbortBtn').classList.add('hidden');
  $('ncEmpty').classList.add('hidden');
  $('ncResponse').classList.add('hidden');

  const match = jsonText.match(/\{[\s\S]*\}/);
  let quiz = null;
  if (match) { try { quiz = JSON.parse(match[0]); } catch {} }

  if (!quiz?.questions?.length) { showNcResponse(jsonText, label); return; }

  state.ncQuizData    = quiz;
  state.ncQuizAnswers = {};

  const quizEl = $('ncQuiz');
  quizEl.classList.remove('hidden');
  quizEl.innerHTML = buildQuizHTML(quiz);

  $('ncSaveBtn').classList.remove('hidden');
  $('ncExportBtn').classList.remove('hidden');
  $('ncCopyBtn').classList.add('hidden');
  $('ncResponseLabel').innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> ${label}`;
  $('ncResponseCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function buildQuizHTML(quiz) {
  const letters = ['A', 'B', 'C', 'D'];
  return `
    <div class="quiz-container">
      <div class="quiz-header-bar">
        <div class="quiz-title-text">${escHtml(quiz.title || 'Quiz Interativo')}</div>
        <div class="quiz-count-badge">${quiz.questions.length} questões</div>
      </div>
      <div class="quiz-list">
        ${quiz.questions.map((q, qi) => `
          <div class="quiz-q-card" id="qq-${qi}">
            <div class="quiz-q-num">Questão ${qi + 1} de ${quiz.questions.length}</div>
            <p class="quiz-q-text">${escHtml(q.q)}</p>
            <div class="quiz-opts">
              ${q.opts.map((opt, oi) => `
                <button class="quiz-opt-btn" id="qopt-${qi}-${oi}"
                  onclick="selectQuizOpt(this,${qi},${oi},${q.ans},${JSON.stringify(escHtml(q.exp))})">
                  <span class="quiz-opt-letter">${letters[oi]}</span>
                  <span class="quiz-opt-text">${escHtml(opt)}</span>
                </button>`).join('')}
            </div>
            <div class="quiz-exp hidden" id="qexp-${qi}">
              <div class="quiz-exp-inner" id="qexp-text-${qi}"></div>
            </div>
          </div>`).join('')}
      </div>
      <div class="quiz-footer">
        <button class="btn-ghost btn-sm" onclick="resetQuiz()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          Reiniciar
        </button>
        <button class="btn-primary" id="quizSubmitBtn" onclick="submitQuiz()">Ver Resultado</button>
      </div>
      <div class="quiz-result-panel hidden" id="quizResultPanel"></div>
    </div>`;
}

function selectQuizOpt(btn, qIdx, optIdx, correct, exp) {
  const card = $(`qq-${qIdx}`);
  if (!card || card.dataset.answered) return;
  card.dataset.answered = '1';

  card.querySelectorAll('.quiz-opt-btn').forEach(b => b.disabled = true);

  const isRight = optIdx === correct;
  btn.classList.add(isRight ? 'quiz-correct' : 'quiz-wrong');

  if (!isRight) {
    const correctBtn = $(`qopt-${qIdx}-${correct}`);
    if (correctBtn) correctBtn.classList.add('quiz-correct');
  }

  const expEl   = $(`qexp-${qIdx}`);
  const expText = $(`qexp-text-${qIdx}`);
  if (expEl && expText) {
    expText.textContent = exp;
    expEl.classList.remove('hidden');
    expEl.classList.toggle('quiz-exp-wrong', !isRight);
  }

  state.ncQuizAnswers[qIdx] = isRight;

  const total    = state.ncQuizData?.questions?.length || 0;
  const answered = Object.keys(state.ncQuizAnswers).length;
  if (answered === total) {
    const submitBtn = $('quizSubmitBtn');
    if (submitBtn) submitBtn.classList.add('quiz-ready');
  }
}

function submitQuiz() {
  const data = state.ncQuizData;
  if (!data) return;

  const total    = data.questions.length;
  const answered = Object.keys(state.ncQuizAnswers).length;
  if (answered < total) {
    showToast(`Responda todas as ${total} questões antes de ver o resultado.`, 'info');
    return;
  }

  const correct = Object.values(state.ncQuizAnswers).filter(Boolean).length;
  const pct     = Math.round((correct / total) * 100);

  let cls, msg;
  if (pct >= 80) { cls = 'quiz-res-great'; msg = '🏆 Excelente! Você domina o conteúdo!'; }
  else if (pct >= 60) { cls = 'quiz-res-good'; msg = '👍 Bom resultado! Continue praticando.'; }
  else               { cls = 'quiz-res-ok';   msg = '📚 Continue estudando, você vai melhorar!'; }

  const panel = $('quizResultPanel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="quiz-result ${cls}">
      <div class="quiz-result-row">
        <div class="quiz-result-score">${correct}<span>/${total}</span></div>
        <div class="quiz-result-pct">${pct}%</div>
      </div>
      <div class="quiz-result-msg">${msg}</div>
      <div class="quiz-result-bar-wrap">
        <div class="quiz-result-bar" style="width:${pct}%"></div>
      </div>
    </div>`;
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetQuiz() {
  if (!state.ncQuizData) return;
  state.ncQuizAnswers = {};
  const quizEl = $('ncQuiz');
  if (quizEl) quizEl.innerHTML = buildQuizHTML(state.ncQuizData);
}

/* ═══════════════════════════════════════════════════════════
   EXPORT RESPONSE
═══════════════════════════════════════════════════════════ */
function exportResponse() {
  const text = state.ncLastResponse || $('ncResponse')?.innerText || '';
  if (!text) return;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `uniai-${state.ncLastType || 'resposta'}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Arquivo exportado com sucesso!', 'success');
}

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
function init() {
  const savedUser = store.get(LS_USER);
  if (savedUser) state.user = savedUser;
  state.library = getLibrary();

  updateHeader();
  initScrollHeader();
  initKeyboard();
  initCursor();

  const preloader = $('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      if (state.page === 'home') {
        initParticles();
        initStatCounters();
        initScrollReveal();
        initTypewriter();
        initHeroParallax();
      }
    }, 1400);
  });

  if (document.readyState === 'complete') {
    setTimeout(() => preloader.classList.add('hidden'), 1400);
  }

  navigate('home');
}

init();
