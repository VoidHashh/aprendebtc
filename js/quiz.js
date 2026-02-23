(function () {
  'use strict';

  const LEVELS = [
    {
      numero: 1,
      nombre: 'Explorador',
      páginas: 7,
      descripcion:
        'Empieza desde cero: qué es Bitcoin, por qué existe, decisión KYC/no-KYC y primeros satoshis.',
      url: '/nivel-1/'
    },
    {
      numero: 2,
      nombre: 'Soberano',
      páginas: 15,
      descripcion:
        'Autocustodia real: wallet propia, retiro desde exchange, seed phrase y primeros pasos en Lightning.',
      url: '/nivel-2/'
    },
    {
      numero: 3,
      nombre: 'Analista',
      páginas: 18,
      descripcion:
        'UTXO, claves, direcciones, nodos, hardware wallet, coin control y lectura técnica de transacciones.',
      url: '/nivel-3/'
    },
    {
      numero: 4,
      nombre: 'En la madriguera',
      páginas: 23,
      descripcion:
        'Privacidad avanzada, multisig, herencia, Lightning avanzado y minería casera con visión operativa.',
      url: '/nivel-4/'
    },
    {
      numero: 5,
      nombre: 'Mentor',
      páginas: 19,
      descripcion:
        'Criptografía, Script, internals de transacciones, SegWit, Taproot y protocolo Bitcoin desde dentro.',
      url: '/nivel-5/'
    },
    {
      numero: 6,
      nombre: 'Satoshi',
      páginas: 10,
      descripcion:
        'Filosofía, game theory, BIPs, contribución y educación para multiplicar conocimiento en tu entorno.',
      url: '/nivel-6/'
    }
  ];

  const QUESTIONS = [
    {
      id: 1,
      texto: '¿Qué sabes sobre Bitcoin?',
      tipo: 'single',
      opciones: [
        { texto: 'He oído hablar pero no sé bien qué es', puntos: 0 },
        { texto: 'Sé que es dinero digital descentralizado, pero poco más', puntos: 2 },
        { texto: 'Entiendo blockchain, minería y oferta limitada', puntos: 5 },
        { texto: 'Puedo explicar cómo funciona técnicamente', puntos: 8 }
      ]
    },
    {
      id: 2,
      texto: '¿Tienes bitcoin?',
      tipo: 'single',
      opciones: [
        { texto: 'No, nunca he comprado', puntos: 0 },
        { texto: 'Sí, pero está en un exchange', puntos: 3 },
        { texto: 'Sí, lo guardo en mi propia wallet', puntos: 6 },
        { texto: 'Sí, uso configuración avanzada (multisig/nodo)', puntos: 10 }
      ]
    },
    {
      id: 3,
      texto: '¿Qué es una seed phrase?',
      tipo: 'single',
      opciones: [
        { texto: 'No lo sé', puntos: 0 },
        { texto: 'Sé que es importante, pero no la gestiono bien', puntos: 2 },
        { texto: 'La tengo guardada de forma segura', puntos: 5 },
        { texto: 'Además uso passphrase (25ª palabra)', puntos: 8 }
      ]
    },
    {
      id: 4,
      texto: '¿Has usado Lightning Network?',
      tipo: 'single',
      opciones: [
        { texto: 'No sé qué es', puntos: 0 },
        { texto: 'Me suena, pero no la he usado', puntos: 1 },
        { texto: 'Sí, he enviado o recibido pagos', puntos: 4 },
        { texto: 'Sí, gestiono canales/liquidez', puntos: 8 }
      ]
    },
    {
      id: 5,
      texto: '¿Sabes qué es un UTXO?',
      tipo: 'single',
      opciones: [
        { texto: 'No', puntos: 0 },
        { texto: 'Sé que tiene que ver con saldos en Bitcoin', puntos: 2 },
        { texto: 'Entiendo el modelo y su impacto en privacidad', puntos: 5 },
        { texto: 'Hago coin control y etiqueto UTXOs', puntos: 8 }
      ]
    },
    {
      id: 6,
      texto: '¿Ejecutas un nodo de Bitcoin?',
      tipo: 'single',
      opciones: [
        { texto: 'No sé qué es un nodo', puntos: 0 },
        { texto: 'Sé qué es, pero no tengo uno', puntos: 2 },
        { texto: 'Sí, ejecuto full node', puntos: 6 },
        { texto: 'Ejecuto Bitcoin + nodo Lightning', puntos: 9 }
      ]
    },
    {
      id: 7,
      texto: '¿Qué términos te suenan?',
      tipo: 'multi',
      hint: 'Selecciona todos los que reconozcas',
      opciones: [
        { texto: 'Taproot', puntos: 2 },
        { texto: 'ECDSA / Schnorr', puntos: 2 },
        { texto: 'Bitcoin Script', puntos: 2 },
        { texto: 'P2WPKH / P2TR', puntos: 2 },
        { texto: 'BIP (Bitcoin Improvement Proposal)', puntos: 2 },
        { texto: 'Ninguno de estos', puntos: 0, exclusive: true }
      ]
    },
    {
      id: 8,
      texto: '¿Qué quieres aprender ahora?',
      tipo: 'single',
      ajuste: true,
      opciones: [
        { texto: 'Empezar desde cero y entender fundamentos', nivelSugerido: 1 },
        { texto: 'Autocustodia y seguridad práctica', nivelSugerido: 2.5 },
        { texto: 'Privacidad, multisig y operativa avanzada', nivelSugerido: 4 },
        { texto: 'Protocolo y parte técnica profunda', nivelSugerido: 5 },
        { texto: 'Contribuir y educar a otros', nivelSugerido: 6 }
      ]
    }
  ];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function baseLevelFromScore(score) {
    if (score <= 5) return 1;
    if (score <= 14) return 2;
    if (score <= 25) return 3;
    if (score <= 38) return 4;
    if (score <= 52) return 5;
    return 6;
  }

  function applyAdjustment(baseLevel, suggestedLevel) {
    if (typeof suggestedLevel !== 'number' || Number.isNaN(suggestedLevel)) return baseLevel;
    if (suggestedLevel > baseLevel) return Math.min(baseLevel + 1, 6);
    return baseLevel;
  }

  function initQuiz(root) {
    const startScreen = root.querySelector('[data-quiz-screen="start"]');
    const flowScreen = root.querySelector('[data-quiz-screen="flow"]');
    const resultScreen = root.querySelector('[data-quiz-screen="result"]');
    const questionHost = root.querySelector('[data-quiz-question]');
    const progressHost = root.querySelector('[data-quiz-progress-fill]');
    const progressBar = root.querySelector('[data-quiz-progressbar]');
    const startButton = root.querySelector('[data-quiz-start-btn]');

    if (!startScreen || !flowScreen || !resultScreen || !questionHost || !progressHost || !progressBar || !startButton) {
      return;
    }

    const state = {
      index: 0,
      score: 0,
      answers: [],
      multiSelection: [],
      adjustment: null
    };

    function resetState() {
      state.index = 0;
      state.score = 0;
      state.answers = [];
      state.multiSelection = [];
      state.adjustment = null;
    }

    function setProgress() {
      const progressValue = ((state.index + 1) / QUESTIONS.length) * 100;
      progressHost.style.width = `${progressValue}%`;
      progressBar.setAttribute('aria-valuenow', String(state.index + 1));
    }

    function renderSingleQuestion(question) {
      const options = question.opciones
        .map(
          (option, optionIndex) =>
            `<button type="button" class="quiz-widget__option" data-quiz-option="${optionIndex}" role="radio" aria-checked="false">${escapeHtml(
              option.texto
            )}</button>`
        )
        .join('');

      return `
        <p class="quiz-widget__question-counter">Pregunta ${question.id} de ${QUESTIONS.length}</p>
        <h3 class="quiz-widget__question-title">${escapeHtml(question.texto)}</h3>
        <div class="quiz-widget__options" role="radiogroup" aria-label="${escapeHtml(question.texto)}">
          ${options}
        </div>
      `;
    }

    function renderMultiQuestion(question) {
      const options = question.opciones
        .map((option, optionIndex) => {
          const exclusive = option.exclusive ? 'true' : 'false';
          return `<button type="button" class="quiz-widget__option is-multi" data-quiz-option="${optionIndex}" data-quiz-exclusive="${exclusive}" role="checkbox" aria-checked="false">${escapeHtml(
            option.texto
          )}</button>`;
        })
        .join('');

      return `
        <p class="quiz-widget__question-counter">Pregunta ${question.id} de ${QUESTIONS.length}</p>
        <h3 class="quiz-widget__question-title">${escapeHtml(question.texto)}</h3>
        <p class="quiz-widget__question-hint">${escapeHtml(question.hint || 'Selecciona todas las opciones que apliquen')}</p>
        <div class="quiz-widget__options" role="group" aria-label="${escapeHtml(question.texto)}">
          ${options}
        </div>
        <div class="quiz-widget__multi-actions">
          <p class="quiz-widget__selected-counter" data-quiz-selected-count>Seleccionadas: 0</p>
          <button type="button" class="quiz-widget__continue" data-quiz-multi-next disabled>Continuar</button>
        </div>
      `;
    }

    function renderQuestion() {
      const question = QUESTIONS[state.index];
      if (!question) return;

      state.multiSelection = [];
      setProgress();

      questionHost.innerHTML =
        question.tipo === 'multi' ? renderMultiQuestion(question) : renderSingleQuestion(question);

      const firstButton = questionHost.querySelector('[data-quiz-option]');
      if (firstButton) {
        firstButton.focus();
      }
    }

    function showResult() {
      const levelFromScore = baseLevelFromScore(state.score);
      const finalLevel = applyAdjustment(levelFromScore, state.adjustment);
      const recommended = LEVELS[finalLevel - 1];

      if (!recommended) return;

      flowScreen.classList.add('is-hidden');
      resultScreen.classList.remove('is-hidden');

      resultScreen.innerHTML = `
        <p class="quiz-widget__result-level">Nivel recomendado</p>
        <h3 class="quiz-widget__result-name">Nivel ${recommended.numero} · ${escapeHtml(recommended.nombre)}</h3>
        <p class="quiz-widget__result-meta">${recommended.paginas} páginas · puntuación técnica ${state.score}</p>
        <p class="quiz-widget__result-summary">${escapeHtml(recommended.descripcion)}</p>
        <div class="quiz-widget__result-actions">
          <a class="quiz-widget__result-cta" href="${recommended.url}">Ir al nivel ${recommended.numero}</a>
          <button type="button" class="quiz-widget__result-retry" data-quiz-restart>Repetir test</button>
        </div>
        <p class="quiz-widget__result-note">Si quieres explorar por tu cuenta, abre <a href="/base/">Base de Conocimiento</a> o <a href="/herramientas/">Herramientas</a>.</p>
      `;

      resultScreen.focus();
    }

    function nextStep() {
      state.index += 1;
      if (state.index >= QUESTIONS.length) {
        showResult();
        return;
      }
      renderQuestion();
    }

    function handleSingleAnswer(button) {
      const question = QUESTIONS[state.index];
      if (!question) return;

      const optionIndex = Number(button.getAttribute('data-quiz-option'));
      const selected = question.opciones[optionIndex];
      if (!selected) return;

      const allOptions = questionHost.querySelectorAll('[data-quiz-option]');
      allOptions.forEach((option) => {
        option.classList.remove('is-selected');
        option.setAttribute('aria-checked', 'false');
      });

      button.classList.add('is-selected');
      button.setAttribute('aria-checked', 'true');

      if (question.ajuste) {
        state.adjustment = selected.nivelSugerido;
      } else {
        state.score += Number(selected.puntos || 0);
      }

      state.answers.push({
        questionId: question.id,
        optionIndex,
        points: Number(selected.puntos || 0)
      });

      window.setTimeout(nextStep, 220);
    }

    function updateMultiUI() {
      const selectedCount = state.multiSelection.length;
      const selectedCounter = questionHost.querySelector('[data-quiz-selected-count]');
      const nextButton = questionHost.querySelector('[data-quiz-multi-next]');

      if (selectedCounter) {
        selectedCounter.textContent = `Seleccionadas: ${selectedCount}`;
      }

      if (nextButton) {
        const ready = selectedCount > 0;
        nextButton.disabled = !ready;
        nextButton.classList.toggle('is-ready', ready);
      }
    }

    function toggleMultiOption(button) {
      const question = QUESTIONS[state.index];
      if (!question) return;

      const optionIndex = Number(button.getAttribute('data-quiz-option'));
      const selectedOption = question.opciones[optionIndex];
      if (!selectedOption) return;

      const isExclusive = button.getAttribute('data-quiz-exclusive') === 'true';
      const optionNodes = Array.from(questionHost.querySelectorAll('[data-quiz-option]'));

      if (isExclusive) {
        state.multiSelection = [optionIndex];
        optionNodes.forEach((node) => {
          const same = Number(node.getAttribute('data-quiz-option')) === optionIndex;
          node.classList.toggle('is-selected', same);
          node.setAttribute('aria-checked', same ? 'true' : 'false');
        });
        updateMultiUI();
        return;
      }

      const exclusiveNode = optionNodes.find((node) => node.getAttribute('data-quiz-exclusive') === 'true');
      if (exclusiveNode) {
        exclusiveNode.classList.remove('is-selected');
        exclusiveNode.setAttribute('aria-checked', 'false');
        state.multiSelection = state.multiSelection.filter((value) => {
          const option = question.opciones[value];
          return option && !option.exclusive;
        });
      }

      const exists = state.multiSelection.includes(optionIndex);
      if (exists) {
        state.multiSelection = state.multiSelection.filter((value) => value !== optionIndex);
      } else {
        state.multiSelection.push(optionIndex);
      }

      optionNodes.forEach((node) => {
        const idx = Number(node.getAttribute('data-quiz-option'));
        const active = state.multiSelection.includes(idx);
        node.classList.toggle('is-selected', active);
        node.setAttribute('aria-checked', active ? 'true' : 'false');
      });

      updateMultiUI();
    }

    function commitMultiAnswer() {
      const question = QUESTIONS[state.index];
      if (!question || question.tipo !== 'multi') return;
      if (state.multiSelection.length === 0) return;

      const questionScore = state.multiSelection.reduce((total, optionIndex) => {
        const option = question.opciones[optionIndex];
        return total + Number(option ? option.puntos || 0 : 0);
      }, 0);

      state.score += questionScore;
      state.answers.push({
        questionId: question.id,
        optionIndexes: [...state.multiSelection],
        points: questionScore
      });

      nextStep();
    }

    function restartQuiz() {
      resetState();
      resultScreen.classList.add('is-hidden');
      startScreen.classList.remove('is-hidden');
      flowScreen.classList.add('is-hidden');
      questionHost.innerHTML = '';
      progressHost.style.width = '0%';
      progressBar.setAttribute('aria-valuenow', '0');
    }

    questionHost.addEventListener('click', (event) => {
      const optionButton = event.target.closest('[data-quiz-option]');
      if (!optionButton) return;

      const question = QUESTIONS[state.index];
      if (!question) return;

      if (question.tipo === 'multi') {
        toggleMultiOption(optionButton);
      } else {
        handleSingleAnswer(optionButton);
      }
    });

    questionHost.addEventListener('click', (event) => {
      const continueButton = event.target.closest('[data-quiz-multi-next]');
      if (!continueButton) return;
      commitMultiAnswer();
    });

    resultScreen.addEventListener('click', (event) => {
      const restartButton = event.target.closest('[data-quiz-restart]');
      if (!restartButton) return;
      restartQuiz();
    });

    startButton.addEventListener('click', () => {
      startScreen.classList.add('is-hidden');
      resultScreen.classList.add('is-hidden');
      flowScreen.classList.remove('is-hidden');
      resetState();
      renderQuestion();
    });

    startButton.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      startButton.click();
    });
  }

  document.querySelectorAll('[data-quiz-root]').forEach(initQuiz);
})();
