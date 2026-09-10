(function () {
  function getPath(obj, path) {
    if (!obj || !path) return undefined;
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function applySite() {
    var site = window.SITE;
    if (!site) return;

    document.querySelectorAll('[data-site]').forEach(function (el) {
      var val = getPath(site, el.getAttribute('data-site'));
      if (val == null || typeof val === 'object') return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (!el.value) el.placeholder = String(val);
        return;
      }
      el.textContent = String(val);
    });

    document.querySelectorAll('[data-site-html]').forEach(function (el) {
      var val = getPath(site, el.getAttribute('data-site-html'));
      if (val == null || typeof val === 'object') return;
      el.innerHTML = String(val);
    });

    var titleKey = document.body && document.body.getAttribute('data-site-title');
    if (titleKey) {
      var t = getPath(site, titleKey);
      if (t) document.title = String(t);
    }

    var word = site.wordmark;
    if (word) {
      document.querySelectorAll('.wordmark').forEach(function (el) {
        el.textContent = word;
      });
    }

    if (site.home && site.home.slides && site.home.slides.length) {
      var slides = document.querySelectorAll('.hero-slideshow .slide');
      slides.forEach(function (slide, i) {
        if (site.home.slides[i]) {
          slide.style.backgroundImage = "url('" + site.home.slides[i] + "')";
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySite);
  } else {
    applySite();
  }
})();
