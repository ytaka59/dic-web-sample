// GLOSSARY_DATA は各ページで data/*-data.js として事前に読み込まれる

(function () {
  'use strict';

  let currentCategory = null;
  let currentSearch = '';

  function filterAndRender(category, search) {
    currentCategory = category;
    currentSearch = search;

    let filtered = GLOSSARY_DATA;
    if (category) {
      filtered = filtered.filter(r => r.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.term.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
      );
    }
    buildCards(filtered);
  }

  function buildCards(rows) {
    const grid = document.getElementById('card-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (rows.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = '該当する用語が見つかりませんでした。';
      grid.appendChild(empty);
    } else {
      const fragment = document.createDocumentFragment();
      rows.forEach(row => fragment.appendChild(createCard(row)));
      grid.appendChild(fragment);
    }

    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = rows.length + ' 件';
  }

  function createCard(row) {
    const article = document.createElement('article');
    article.className = 'card';
    article.dataset.category = row.category;

    const badge = document.createElement('span');
    badge.className = 'card__badge';
    badge.textContent = row.category;

    const term = document.createElement('h2');
    term.className = 'card__term';
    term.textContent = row.term;

    const desc = document.createElement('p');
    desc.className = 'card__desc';
    desc.textContent = row.desc;

    article.appendChild(badge);
    article.appendChild(term);
    article.appendChild(desc);
    return article;
  }

  function init() {
    const categories = [...new Set(GLOSSARY_DATA.map(r => r.category))];

    // フィルターボタン生成
    const container = document.getElementById('filter-buttons');
    if (container) {
      const makeBtn = (label, cat) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat === null ? ' active' : '');
        btn.textContent = label;
        btn.dataset.cat = cat ?? '';
        btn.addEventListener('click', () => {
          container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filterAndRender(cat, currentSearch);
        });
        return btn;
      };

      container.appendChild(makeBtn('すべて', null));
      categories.forEach(cat => container.appendChild(makeBtn(cat, cat)));
    }

    // 検索ボックス
    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        filterAndRender(currentCategory, e.target.value.trim());
      });
    }

    // 初期描画
    buildCards(GLOSSARY_DATA);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
