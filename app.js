// 카드 렌더링, 필터/정렬, Flip 이벤트를 관리하는 메인 모듈

import { GAMES } from './games-data.js';

const grid = document.getElementById('card-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');

let currentFilter = '전체';
let currentSort = 'default';

function makeStars(count, max = 5) {
  return '★'.repeat(count) + '☆'.repeat(max - count);
}

function buildCard(game) {
  const container = document.createElement('div');
  container.className = 'card-container';
  container.setAttribute('tabindex', '0');
  container.setAttribute('role', 'button');
  container.setAttribute('aria-label', `${game.name} 게임 카드 — 클릭하면 룰 확인`);
  container.setAttribute('aria-pressed', 'false');

  const tipHtml = game.tip
    ? `<div class="card-tip"><span class="card-tip-label">💡 고수 팁</span>${game.tip}</div>`
    : '';

  const rulesHtml = game.description
    .map(r => `<li>${r}</li>`)
    .join('');

  const tagsHtml = game.tags
    .map(t => `<span class="tag">${t}</span>`)
    .join('');

  container.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <div class="card-front-emoji">${game.emoji}</div>
        <div class="card-front-name">${game.name}</div>
        <div class="card-front-name-en">${game.nameEn}</div>
        <hr class="card-divider">
        <div class="card-stars-row">
          <span>인기도</span>
          <span class="stars" aria-label="인기도 ${game.popularity}점">${makeStars(game.popularity)}</span>
        </div>
        <div class="card-stars-row">
          <span>난이도</span>
          <span class="stars" aria-label="난이도 ${game.difficulty}점">${makeStars(game.difficulty)}</span>
        </div>
        <hr class="card-divider">
        <p class="card-summary">${game.summary}</p>
        <p class="card-target"><strong>추천 대상</strong> ${game.target}</p>
        <div class="card-tags">${tagsHtml}</div>
        <button class="card-flip-btn" tabindex="-1" aria-hidden="true">룰 보기 →</button>
      </div>
      <div class="card-back" aria-hidden="true">
        <div class="card-back-title">📖 플레이 방법</div>
        <ol class="card-rules">${rulesHtml}</ol>
        ${tipHtml}
        <button class="card-back-btn" tabindex="-1" aria-hidden="true">← 돌아가기</button>
      </div>
    </div>
  `;

  function flip() {
    const flipped = container.classList.toggle('is-flipped');
    container.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    container.setAttribute('aria-label',
      flipped
        ? `${game.name} 룰 보는 중 — 클릭하면 앞면으로`
        : `${game.name} 게임 카드 — 클릭하면 룰 확인`
    );
  }

  container.addEventListener('click', flip);
  container.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  });

  return container;
}

function getFilteredSorted() {
  let list = currentFilter === '전체'
    ? [...GAMES]
    : GAMES.filter(g => g.tags.includes(currentFilter));

  if (currentSort === 'popularity') {
    list.sort((a, b) => b.popularity - a.popularity);
  } else if (currentSort === 'difficulty-asc') {
    list.sort((a, b) => a.difficulty - b.difficulty);
  } else if (currentSort === 'difficulty-desc') {
    list.sort((a, b) => b.difficulty - a.difficulty);
  } else if (currentSort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }

  return list;
}

function render() {
  grid.innerHTML = '';
  const list = getFilteredSorted();

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '해당 조건의 게임이 없습니다.';
    grid.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach(game => fragment.appendChild(buildCard(game)));
  grid.appendChild(fragment);
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  render();
});

render();
