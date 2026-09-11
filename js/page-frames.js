(function () {
  function collect() {
    var out = [];
    var seen = {};
    function add(src, name) {
      if (!src || seen[src]) return;
      seen[src] = true;
      out.push({ src: src, name: name || '' });
    }
    (window.MODELS || []).forEach(function (m) {
      (m.images || []).forEach(function (src) { add(src, m.name); });
    });
    if (window.SITE && SITE.home && SITE.home.slides) {
      SITE.home.slides.forEach(function (src) { add(src, ''); });
    }
    return out;
  }

  function fill() {
    var slots = document.querySelectorAll('[data-frame]');
    if (!slots.length) return;
    var photos = collect();
    var start = 0;
    var page = document.body.getAttribute('data-page') || '';
    if (page === 'camp') start = 3;
    slots.forEach(function (slot, i) {
      var fig = slot.querySelector('figure') || slot;
      if (!photos.length) return;
      var item = photos[(start + i) % photos.length];
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = item.name || '';
      img.addEventListener('load', function () { slot.classList.add('has-image');
      });
      img.addEventListener('error', function () { img.remove(); });
      fig.appendChild(img);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fill);
  } else {
    fill();
  }
})();
