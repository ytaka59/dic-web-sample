(function () {
  'use strict';

  const ALL = [
    ...WEBAPP_DATA.map(r => Object.assign({}, r, { genre: 'Webアプリ開発' })),
    ...IT_DATA.map(r => Object.assign({}, r, { genre: 'IT用語全般' })),
    ...PROGRAMMING_DATA.map(r => Object.assign({}, r, { genre: 'プログラミング' })),
  ];

  let currentGenre    = null;
  let currentCategory = null;
  let currentSearch   = '';

  const input          = document.getElementById('index-search');
  const countEl        = document.getElementById('index-result-count');
  const gridEl         = document.getElementById('index-result-grid');
  const hintEl         = document.getElementById('search-hint');
  const genreCards     = document.querySelectorAll('.genre-card[data-genre]');
  const catContainer   = document.getElementById('index-category-buttons');

  // ── カテゴリボタン生成 ────────────────────────────────────────
  function buildCategoryButtons() {
    catContainer.innerHTML = '';

    // 現在のジャンルに絞った用語からカテゴリ一覧を作る
    const source = currentGenre ? ALL.filter(r => r.genre === currentGenre) : ALL;
    const categories = [...new Set(source.map(r => r.category))];

    // カテゴリが1種類以下なら表示しない
    if (categories.length <= 1) return;

    const makeBtn = (label, cat) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (cat === null ? ' active' : '');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        currentCategory = cat;
        catContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
      return btn;
    };

    catContainer.appendChild(makeBtn('すべて', null));
    categories.forEach(cat => catContainer.appendChild(makeBtn(cat, cat)));
  }

  // ── カード描画 ────────────────────────────────────────────────
  function render() {
    let filtered = ALL;

    if (currentGenre) {
      filtered = filtered.filter(r => r.genre === currentGenre);
    }
    if (currentCategory) {
      filtered = filtered.filter(r => r.category === currentCategory);
    }
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.term.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
      );
    }

    // プログラミングジャンルでは実装例がある用語を先頭に並べる
    if (filtered.some(r => r.codeExample)) {
      filtered = [...filtered].sort((a, b) => {
        if (a.codeExample && !b.codeExample) return -1;
        if (!a.codeExample && b.codeExample) return 1;
        return 0;
      });
    }

    countEl.textContent = filtered.length + ' 件';

    if (currentSearch) {
      hintEl.textContent = '"' + currentSearch + '" の検索結果';
    } else if (currentCategory) {
      hintEl.textContent = currentCategory + ' の用語一覧';
    } else if (currentGenre) {
      hintEl.textContent = currentGenre + ' の用語一覧';
    } else {
      hintEl.textContent = 'ジャンルカードをクリックして絞り込めます';
    }

    gridEl.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className   = 'empty-state';
      empty.textContent = '該当する用語が見つかりませんでした。';
      gridEl.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    filtered.forEach(r => frag.appendChild(createCard(r)));
    gridEl.appendChild(frag);
  }

  function createCard(r) {
    const card = document.createElement('article');
    card.className = 'card';

    const genre = document.createElement('span');
    genre.className   = 'card__genre';
    genre.textContent = r.genre;

    const badge = document.createElement('span');
    badge.className   = 'card__badge';
    badge.textContent = r.category;

    const term = document.createElement('h2');
    term.className   = 'card__term';
    term.textContent = r.term;

    const desc = document.createElement('p');
    desc.className   = 'card__desc';
    desc.textContent = r.desc;

    card.appendChild(genre);
    card.appendChild(badge);
    card.appendChild(term);
    card.appendChild(desc);

    if (r.detail) {
      card.classList.add('has-detail');
      card.addEventListener('click', () => openModal(r));
    }

    return card;
  }

  // ── モーダル ──────────────────────────────────────────────────
  let modalEl = null;

  function buildModal() {
    const modal = document.createElement('div');
    modal.id = 'term-modal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-term');
    modal.innerHTML = `
      <div class="modal__overlay"></div>
      <div class="modal__panel">
        <button class="modal__close" aria-label="閉じる">✕</button>
        <div class="modal__header">
          <span class="modal__badge" id="modal-badge"></span>
          <h2 class="modal__term" id="modal-term"></h2>
        </div>
        <p class="modal__desc" id="modal-desc"></p>
        <p class="modal__detail-label">詳細説明</p>
        <p class="modal__detail" id="modal-detail"></p>
        <div class="modal__code-block" id="modal-code-block">
          <div class="modal__code-header">
            <span class="modal__code-label">実装例</span>
            <button class="modal__code-copy" id="modal-code-copy" aria-label="コードをコピー">コピー</button>
          </div>
          <pre class="modal__code-pre"><code id="modal-code-content"></code></pre>
        </div>
        <div class="modal__ai-block" id="modal-ai-block">
          <p class="modal__ai-label">AIへの指示例</p>
          <p class="modal__ai-prompt" id="modal-ai-prompt"></p>
          <button class="modal__ai-copy" id="modal-ai-copy" aria-label="コピー">コピー</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.modal__overlay').addEventListener('click', closeModal);
    modal.querySelector('.modal__close').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });

    modalEl = modal;
  }

  function openModal(row) {
    if (!modalEl) buildModal();
    modalEl.querySelector('#modal-badge').textContent  = row.category;
    modalEl.querySelector('#modal-term').textContent   = row.term;
    modalEl.querySelector('#modal-desc').textContent   = row.desc;
    modalEl.querySelector('#modal-detail').textContent = row.detail;

    const codeBlock   = modalEl.querySelector('#modal-code-block');
    const codeContent = modalEl.querySelector('#modal-code-content');
    const codeCopyBtn = modalEl.querySelector('#modal-code-copy');
    if (row.codeExample) {
      codeContent.textContent = row.codeExample;
      codeBlock.style.display = '';
      codeCopyBtn.textContent = 'コピー';
      codeCopyBtn.onclick = () => {
        navigator.clipboard.writeText(row.codeExample).then(() => {
          codeCopyBtn.textContent = 'コピーしました！';
          setTimeout(() => { codeCopyBtn.textContent = 'コピー'; }, 2000);
        });
      };
    } else {
      codeBlock.style.display = 'none';
    }

    const aiBlock    = modalEl.querySelector('#modal-ai-block');
    const aiPromptEl = modalEl.querySelector('#modal-ai-prompt');
    const aiCopyBtn  = modalEl.querySelector('#modal-ai-copy');
    if (row.aiPrompt) {
      aiPromptEl.textContent = row.aiPrompt;
      aiBlock.style.display  = '';
      aiCopyBtn.textContent  = 'コピー';
      aiCopyBtn.onclick = () => {
        navigator.clipboard.writeText(row.aiPrompt).then(() => {
          aiCopyBtn.textContent = 'コピーしました！';
          setTimeout(() => { aiCopyBtn.textContent = 'コピー'; }, 2000);
        });
      };
    } else {
      aiBlock.style.display = 'none';
    }

    modalEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // ── イベント ──────────────────────────────────────────────────
  genreCards.forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      const genre = card.dataset.genre;
      if (currentGenre === genre) {
        currentGenre = null;
        card.classList.remove('active');
      } else {
        currentGenre = genre;
        genreCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }
      // ジャンルが変わったらカテゴリをリセット
      currentCategory = null;
      buildCategoryButtons();
      render();
    });
  });

  input.addEventListener('input', function (e) {
    currentSearch = e.target.value.trim();
    render();
  });

  // 初期表示
  buildCategoryButtons();
  render();
})();
