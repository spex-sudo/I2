document.addEventListener('DOMContentLoaded', function () {

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Page transition (fade-out on internal link clicks) ----------
  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    var isInternal = href && !href.startsWith('http') && !href.startsWith('mailto:') &&
      !href.startsWith('#') && link.target !== '_blank';
    if (!isInternal || reduceMotion) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(function () { window.location.href = href; }, 350);
    });
  });

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  // Mobile dropdown accordion (tap "Models" to reveal Males/Females on small screens)
  document.querySelectorAll('.nav-item > a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });

  // ---------- Scroll progress bar ----------
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    progress.style.transform = 'scaleX(' + Math.min(scrolled, 1) + ')';
  }, { passive: true });

  // ---------- Cursor dot ----------
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    document.addEventListener('mousemove', function (e) {
      dot.classList.add('is-active');
      dot.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
    });
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { dot.classList.add('is-hovering'); });
      el.addEventListener('mouseleave', function () { dot.classList.remove('is-hovering'); });
    });
  }

  // ---------- Scroll reveal ----------
  var revealTargets = document.querySelectorAll(
    '.hero-copy > *, .hero-overlay > *, .section-head, .roster-card, .value-item, .form-wrap'
  );
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', (i % 4) * 0.08 + 's');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  // ---------- Marquee (homepage only, right under the hero) ----------
  var slideshowEl = document.querySelector('.hero-slideshow');
  if (slideshowEl) {
    var words = ['Editorial', 'Commercial', 'Runway', 'Fitness', 'Kingston, Jamaica'];
    var marquee = document.createElement('div');
    marquee.className = 'marquee';
    var track = document.createElement('div');
    track.className = 'marquee-track';
    for (var r = 0; r < 2; r++) {
      words.forEach(function (w) {
        var span = document.createElement('span');
        span.textContent = w;
        track.appendChild(span);
      });
    }
    marquee.appendChild(track);
    slideshowEl.insertAdjacentElement('afterend', marquee);
  }

  // ---------- Roster carousel (native scroll, touch/drag friendly, JS auto-advances) ----------
  var carousel = document.querySelector('.roster-carousel');
  if (carousel) {
    var rTrack = carousel.querySelector('.roster-track');
    var rPaused = false;
    var rResumeTimer;
    var rLastTime = null;
    var rSpeed = 46; // pixels per second — medium pace

    function rPause() {
      rPaused = true;
      clearTimeout(rResumeTimer);
    }
    function rScheduleResume() {
      clearTimeout(rResumeTimer);
      rResumeTimer = setTimeout(function () { rPaused = false; rLastTime = null; }, 2200);
    }

    carousel.addEventListener('mouseenter', rPause);
    carousel.addEventListener('mouseleave', function () { rPaused = false; rLastTime = null; });
    carousel.addEventListener('touchstart', rPause, { passive: true });
    carousel.addEventListener('touchend', rScheduleResume);
    carousel.addEventListener('pointerdown', rPause);
    carousel.addEventListener('pointerup', rScheduleResume);
    carousel.addEventListener('wheel', function () { rPause(); rScheduleResume(); }, { passive: true });

    if (!reduceMotion) {
      requestAnimationFrame(function step(timestamp) {
        if (rLastTime === null) rLastTime = timestamp;
        var delta = timestamp - rLastTime;
        rLastTime = timestamp;
        if (!rPaused) {
          carousel.scrollLeft += rSpeed * (delta / 1000);
          var half = rTrack.scrollWidth / 2;
          if (carousel.scrollLeft >= half) {
            carousel.scrollLeft -= half;
          }
        }
        requestAnimationFrame(step);
      });
    }
  }

  // Hero slideshow
  var slideshow = document.querySelector('.hero-slideshow');
  if (slideshow) {
    var slides = Array.prototype.slice.call(slideshow.querySelectorAll('.slide'));
    var dotsWrap = slideshow.querySelector('.slide-dots');
    var prevBtn = slideshow.querySelector('.slide-arrow.prev');
    var nextBtn = slideshow.querySelector('.slide-arrow.next');
    var current = 0;
    var timer;

    // Real width/height of each photo, in the same order as the .slide elements.
    // Update these two arrays if you add, remove, or reorder slides.
    // Order matches the .slide elements above: IMG_0093, IMG_0094, IMG_0095, IMG_0096
    var ratios = [1425 / 950, 1920 / 1080, 1425 / 950, 800 / 450];

    slides.forEach(function (_, i) {
      var slideDot = document.createElement('button');
      slideDot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      if (i === 0) slideDot.classList.add('active');
      slideDot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(slideDot);
    });

    var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('button'));

    function updateHeight() {
      var w = slideshow.clientWidth;
      var ratio = ratios[current] || 1.5;
      slideshow.style.height = (w / ratio) + 'px';
    }

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      updateHeight();
      resetTimer();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, 5000);
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    var lastKnownWidth = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth !== lastKnownWidth) {
        lastKnownWidth = window.innerWidth;
        updateHeight();
      }
    });

    updateHeight();
    resetTimer();
  }
});
