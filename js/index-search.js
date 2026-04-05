(function () {
  'use strict';

  const ALL = [
    ...WEBAPP_DATA.map(r => Object.assign({}, r, { genre: 'Webアプリ' })),
    ...IT_DATA.map(r => Object.assign({}, r, { genre: 'IT用語' })),
    ...PROGRAMMING_DATA.map(r => Object.assign({}, r, { genre: 'プログラミング' })),
  ];

  const input     = document.getElementById('index-search');
  const resultsEl = document.getElementById('index-results');
  const genreEl   = document.getElementById('genre-section');
  const countEl   = document.getElementById('index-result-count');
  const gridEl    = document.getElementById('index-result-grid');
  const hintEl    = document.getElementById('search-hint');

  function render(q) {
    if (!q) {
      resultsEl.hidden = true;
      genreEl.hidden   = false;
      hintEl.textContent = 'ジャンルを選ぶか、キーワードで横断検索できます';
      return;
    }

    const lower    = q.toLowerCase();
    const filtered = ALL.filter(r =>
      r.term.toLowerCase().includes(lower) || r.desc.toLowerCase().includes(lower)
    );

    genreEl.hidden   = true;
    resultsEl.hidden = false;

    countEl.textContent = filtered.length + ' 件';
    hintEl.textContent  = '"' + q + '" の検索結果';

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
    return card;
  }

  input.addEventListener('input', function (e) {
    render(e.target.value.trim());
  });
})();
