(function () {
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var state = { gender: 'all', letter: '', query: '' };

  function slugify(name) {
    return String(name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function firstLetter(name) {
    var ch = String(name || '').replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase();
    return ch || '#';
  }

  function roster() {
    return Array.isArray(window.MODELS) ? window.MODELS.slice() : [];
  }

  function withSlug(m) {
    return Object.assign({}, m, { slug: m.slug || slugify(m.name) });
  }

  function byGender(list, gender) {
    if (!gender || gender === 'all') return list;
    return list.filter(function (m) { return m.gender === gender; });
  }

  function searchable(m) {
    return [m.name, m.city, m.category, m.gender, m.eyes, m.hair, m.height].join(' ').toLowerCase();
  }

  function filtered() {
    var list = byGender(roster(), state.gender).map(withSlug);
    list.sort(function (a, b) {
      return String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' });
    });
    if (state.letter) list = list.filter(function (m) { return firstLetter(m.name) === state.letter; });
    if (state.query) {
      var q = state.query.toLowerCase();
      list = list.filter(function (m) { return searchable(m).indexOf(q) !== -1; });
    }
    return list;
  }

  function presentLetters(gender) {
    var set = {};
    byGender(roster(), gender).forEach(function (m) { set[firstLetter(m.name)] = true; });
    return set;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  }

  function cardHtml(m) {
    var photos = (m.images && m.images.length) ? m.images : [];
    var imagesHtml = photos.map(function (src, i) {
      return '<img class="stack-img' + (i === 0 ? ' active' : '') + '" src="' + esc(src) + '" alt="' + esc(m.name) + '" data-photo="' + i + '">';
    }).join('');
    var dotsHtml = '';
    if (photos.length > 1) {
      dotsHtml = '<div class="model-photo-dots">' + photos.map(function (_, i) {
        return '<button type="button"' + (i === 0 ? ' class="active"' : '') + ' data-photo="' + i + '" aria-label="Photo ' + (i + 1) + '"></button>';
      }).join('') + '</div>';
    }
    var statFields = [
      ['Gender', m.gender ? (m.gender.charAt(0).toUpperCase() + m.gender.slice(1)) : ''],
      ['Height', m.height], ['Eyes', m.eyes], ['Hair', m.hair],
      ['Chest', m.chest], ['Waist', m.waist], ['Hips', m.hips], ['Shoes', m.shoes]
    ];
    var statsHtml = statFields.filter(function (f) { return f[1]; }).map(function (f) {
      return '<span class="stat-pair"><strong>' + esc(f[0]) + '</strong> ' + esc(f[1]) + '</span>';
    }).join('');
    var html = '<article class="roster-card" data-slug="' + esc(m.slug) + '">';
    html += '<a class="roster-card-hit" href="model.html?m=' + encodeURIComponent(m.slug) + '" aria-label="' + esc(m.name) + ' portfolio">';
    html += '<figure data-photo-count="' + photos.length + '">' + imagesHtml + dotsHtml + '</figure>';
    html += '<h3>' + esc(m.name) + '</h3></a>';
    html += '<p class="tag">' + esc(m.category || '') + (m.city ? ' \u00b7 ' + esc(m.city) : '') + '</p>';
    if (m.instagram) html += '<p class="tag"><a href="' + esc(m.instagram) + '" target="_blank" rel="noopener">Instagram \u2192</a></p>';
    if (statsHtml) {
      html += '<button type="button" class="details-toggle">Details \u25be</button>';
      html += '<div class="details-panel">' + statsHtml + '</div>';
    }
    html += '<p class="tag portfolio-link"><a href="model.html?m=' + encodeURIComponent(m.slug) + '">Portfolio \u2192</a></p></article>';
    return html;
  }

  function showPhoto(figure, photoIdx) {
    figure.querySelectorAll('.stack-img').forEach(function (img) {
      img.classList.toggle('active', img.getAttribute('data-photo') === String(photoIdx));
    });
    var dotsWrap = figure.querySelector('.model-photo-dots');
    if (dotsWrap) {
      dotsWrap.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-photo') === String(photoIdx));
      });
    }
  }

  function bindGrid(container) {
    if (container.dataset.bound === '1') return;
    container.dataset.bound = '1';
    container.addEventListener('click', function (e) {
      var dot = e.target.closest('.model-photo-dots button');
      if (dot) {
        e.preventDefault(); e.stopPropagation();
        showPhoto(dot.closest('figure'), Number(dot.getAttribute('data-photo')));
        return;
      }
      var toggle = e.target.closest('.details-toggle');
      if (toggle) {
        toggle.classList.toggle('open');
        var panel = toggle.nextElementSibling;
        if (panel) panel.classList.toggle('open');
      }
    });
    container.addEventListener('touchstart', function (e) {
      var figure = e.target.closest('figure[data-photo-count]');
      if (!figure) return;
      if (Number(figure.getAttribute('data-photo-count')) < 2) return;
      figure._startX = e.touches[0].clientX;
    }, { passive: true });
    container.addEventListener('touchend', function (e) {
      var figure = e.target.closest('figure[data-photo-count]');
      if (!figure || figure._startX == null) return;
      var count = Number(figure.getAttribute('data-photo-count'));
      var deltaX = e.changedTouches[0].clientX - figure._startX;
      figure._startX = null;
      if (Math.abs(deltaX) < 35 || count < 2) return;
      var active = figure.querySelector('.stack-img.active');
      var current = active ? Number(active.getAttribute('data-photo')) : 0;
      var next = ((deltaX < 0 ? current + 1 : current - 1) + count) % count;
      showPhoto(figure, next);
    });
  }

  function renderAz(activeLetters) {
    var bar = document.getElementById('az-index');
    if (!bar) return;
    var html = '<button type="button" class="az-letter' + (state.letter === '' ? ' active' : '') + '" data-letter="">All</button>';
    LETTERS.forEach(function (L) {
      var on = !!activeLetters[L];
      html += '<button type="button" class="az-letter' + (state.letter === L ? ' active' : '') + (on ? '' : ' empty') + '" data-letter="' + L + '"' + (on ? '' : ' disabled') + '>' + L + '</button>';
    });
    bar.innerHTML = html;
    if (bar.dataset.bound !== '1') {
      bar.dataset.bound = '1';
      bar.addEventListener('click', function (e) {
        var btn = e.target.closest('.az-letter');
        if (!btn || btn.disabled) return;
        state.letter = btn.getAttribute('data-letter') || '';
        paintGrid();
      });
    }
  }

  function paintGrid() {
    var container = document.getElementById('model-grid');
    if (!container) return;
    var list = filtered();
    renderAz(presentLetters(state.gender));
    var countEl = document.getElementById('roster-count');
    if (countEl) countEl.textContent = list.length ? (list.length + ' model' + (list.length === 1 ? '' : 's')) : 'No matches';
    if (!roster().length) { container.innerHTML = '<p class="roster-empty">No models on the roster yet.</p>'; return; }
    if (!list.length) { container.innerHTML = '<p class="roster-empty">No models match that search.</p>'; return; }
    var groups = {}, order = [];
    list.forEach(function (m) {
      var L = firstLetter(m.name);
      if (!groups[L]) { groups[L] = []; order.push(L); }
      groups[L].push(m);
    });
    var html = '';
    order.forEach(function (L) {
      html += '<div class="letter-block" id="letter-' + L + '"><h2 class="letter-heading">' + L + '</h2><div class="grid-3">';
      groups[L].forEach(function (m) { html += cardHtml(m); });
      html += '</div></div>';
    });
    container.innerHTML = html;
    bindGrid(container);
  }

  function bindSearch() {
    var input = document.getElementById('model-search');
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      var val = input.value;
      timer = setTimeout(function () { state.query = val.trim(); paintGrid(); }, 80);
    });
  }

  function renderModels(gender) {
    state.gender = gender || 'all';
    state.letter = '';
    state.query = '';
    var input = document.getElementById('model-search');
    if (input) input.value = '';
    bindSearch();
    paintGrid();
  }

  function param(name) {
    try { return new URLSearchParams(window.location.search).get(name) || ''; }
    catch (e) { return ''; }
  }

  function renderPortfolio() {
    var root = document.getElementById('portfolio-root');
    if (!root) return;
    var list = roster().map(withSlug);
    list.sort(function (a, b) { return String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' }); });
    var slug = param('m');
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].slug === slug) { idx = i; break; }
    if (idx < 0) {
      root.innerHTML = '<div class="wrap"><p class="roster-empty">Model not found. <a href="models.html">Return to roster</a>.</p></div>';
      return;
    }
    var m = list[idx];
    var prev = list[(idx - 1 + list.length) % list.length];
    var next = list[(idx + 1) % list.length];
    var photos = (m.images && m.images.length) ? m.images : [];
    document.title = m.name + ' \u2014 I\u00b2 Models';
    var stats = [
      ['Gender', m.gender ? m.gender.charAt(0).toUpperCase() + m.gender.slice(1) : ''],
      ['Height', m.height], ['Eyes', m.eyes], ['Hair', m.hair],
      ['Chest', m.chest], ['Waist', m.waist], ['Hips', m.hips],
      ['Shoes', m.shoes], ['Category', m.category], ['Based', m.city]
    ].filter(function (f) { return f[1]; });
    var hero = photos[0] || '';
    var html = '<section class="portfolio-hero"><div class="wrap portfolio-hero-grid">';
    html += '<figure class="portfolio-cover">' + (hero ? '<img src="' + esc(hero) + '" alt="' + esc(m.name) + '">' : '') + '</figure>';
    html += '<div class="portfolio-meta"><p class="hero-eyebrow">' + esc(m.gender === 'male' ? 'Male' : 'Female') + (m.category ? ' \u00b7 ' + esc(m.category) : '') + '</p>';
    html += '<h1>' + esc(m.name) + '</h1>';
    if (m.bio) html += '<p class="portfolio-bio">' + esc(m.bio) + '</p>';
    html += '<dl class="portfolio-stats">';
    stats.forEach(function (f) { html += '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; });
    html += '</dl>';
    if (m.instagram) html += '<p><a class="btn btn-outline" href="' + esc(m.instagram) + '" target="_blank" rel="noopener">Instagram \u2192</a></p>';
    html += '<p class="portfolio-nav-inline"><a href="models.html">Roster</a>';
    html += '<a href="model.html?m=' + encodeURIComponent(prev.slug) + '">\u2190 ' + esc(prev.name) + '</a>';
    html += '<a href="model.html?m=' + encodeURIComponent(next.slug) + '">' + esc(next.name) + ' \u2192</a></p></div></div></section>';
    if (photos.length) {
      html += '<section class="portfolio-book"><div class="wrap"><div class="section-head"><h2>Portfolio</h2><span class="roster-count">' + photos.length + ' image' + (photos.length === 1 ? '' : 's') + '</span></div>';
      html += '<div class="portfolio-grid">';
      photos.forEach(function (src, i) {
        html += '<figure class="portfolio-shot"><img src="' + esc(src) + '" alt="' + esc(m.name) + ' ' + (i + 1) + '"></figure>';
      });
      html += '</div></div></section>';
    }
    root.innerHTML = html;
  }

  function renderHomeRoster() {
    var track = document.getElementById('home-roster-track');
    if (!track) return;
    var list = roster().map(withSlug);
    if (!list.length) return;
    function cards() {
      return list.map(function (m, i) {
        var img = (m.images && m.images[0]) ? m.images[0] : '';
        var n = String(i + 1).padStart(2, '0');
        return '<a class="roster-card" href="model.html?m=' + encodeURIComponent(m.slug) + '"><figure>' +
          (img ? '<img src="' + esc(img) + '" alt="' + esc(m.name) + '">' : '') +
          '<div class="roster-caption"><span class="roster-index">' + n + '</span><h3>' + esc(m.name) + '</h3></div></figure></a>';
      }).join('');
    }
    track.innerHTML = cards() + cards();
  }

  window.renderModels = renderModels;
  window.renderPortfolio = renderPortfolio;
  window.renderHomeRoster = renderHomeRoster;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('home-roster-track')) renderHomeRoster();
    if (document.getElementById('portfolio-root')) renderPortfolio();
  });
})();
