// ============================================================
// MODEL ROSTER
// ------------------------------------------------------------
// EASIEST WAY TO USE THIS FILE: don't. Go to admin.html on your
// site, log in, and use the form there — it edits this file for
// you automatically, photo uploads included. You never need to
// open this file at all if the admin panel is working for you.
//
// This one file controls the Models, Female Models, and Male
// Models pages. Add a model here and they automatically show
// up on the right page(s) — no HTML editing needed.
//
// HOW TO ADD A MODEL BY HAND (optional — skip this if using admin.html):
// 1. Upload their photo(s) to your GitHub repo's /images folder.
// 2. Copy one of the { ... } blocks below (including the comma
//    after it) and paste it into the list.
// 3. Fill in their details. Keep the quote marks.
// 4. Commit — they'll appear automatically.
//
// HOW TO REMOVE A MODEL:
// Delete their whole { ... } block (and its trailing comma).
//
// FIELD NOTES:
// - gender must be exactly "male" or "female" (lowercase) —
//   this decides which page they appear on. They always also
//   appear on the combined Models page.
// - category should be one of: Editorial, Commercial, Runway,
//   Fitness — or any short word you prefer.
// - images is a LIST of photo URLs, not a single one — a model
//   can have just one, or several. If there's more than one,
//   small dots appear on their card and visitors can swipe or
//   click through the set.
// - eyes, hair, chest, waist, hips, shoes show up in a "Details"
//   dropdown on the card, below the photo. Leave any of them as
//   "" (empty) if you don't want to show that stat.
// - instagram is optional. Leave it as "" (empty) if unused.
// ============================================================

window.MODELS = [

  // EXAMPLE — copy this block to add a real model, or delete
  // it once you've added your first one.
  // {
  //   name: "Model Name",
  //   gender: "female",
  //   height: "5'9\"",
  //   category: "Editorial",
  //   city: "Kingston",
  //   eyes: "Brown",
  //   hair: "Black",
  //   chest: "34\"",
  //   waist: "26\"",
  //   hips: "36\"",
  //   shoes: "8 US",
  //   images: [
  //     "https://raw.githubusercontent.com/spex-sudo/I2/main/images/example-1.jpg",
  //     "https://raw.githubusercontent.com/spex-sudo/I2/main/images/example-2.jpg"
  //   ],
  //   instagram: "https://instagram.com/username"
  // },

];

// ============================================================
// RENDERING — you shouldn't need to edit anything below this
// line. This runs automatically on each Models page and builds
// the cards from the list above.
// ============================================================

function renderModels(gender) {
  var container = document.getElementById('model-grid');
  if (!container) return;

  var list = (gender === 'all')
    ? window.MODELS
    : window.MODELS.filter(function (m) { return m.gender === gender; });

  if (!list || list.length === 0) {
    container.innerHTML =
      '<p style="grid-column:1/-1;color:var(--gray);background:var(--white);padding:48px 24px;text-align:center;">' +
      'No models added yet — open data/models.js and follow the instructions at the top to add your first one.' +
      '</p>';
    return;
  }

  container.innerHTML = list.map(function (m, modelIndex) {
    var photos = (m.images && m.images.length) ? m.images : [];

    var imagesHtml = photos.map(function (src, i) {
      return '<img class="stack-img' + (i === 0 ? ' active' : '') + '" src="' + src + '" alt="' + m.name + '" data-model="' + modelIndex + '" data-photo="' + i + '">';
    }).join('');

    var dotsHtml = '';
    if (photos.length > 1) {
      dotsHtml = '<div class="model-photo-dots">' + photos.map(function (_, i) {
        return '<button' + (i === 0 ? ' class="active"' : '') + ' data-model="' + modelIndex + '" data-photo="' + i + '" aria-label="Photo ' + (i + 1) + '"></button>';
      }).join('') + '</div>';
    }

    var statFields = [
      ['Gender', m.gender ? (m.gender.charAt(0).toUpperCase() + m.gender.slice(1)) : ''],
      ['Height', m.height],
      ['Eyes', m.eyes],
      ['Hair', m.hair],
      ['Chest', m.chest],
      ['Waist', m.waist],
      ['Hips', m.hips],
      ['Shoes', m.shoes]
    ];
    var statsHtml = statFields.filter(function (f) { return f[1]; }).map(function (f) {
      return '<span class="stat-pair"><strong>' + f[0] + '</strong> ' + f[1] + '</span>';
    }).join('');

    var html = '<div class="roster-card">';
    html += '<figure data-model="' + modelIndex + '" data-photo-count="' + photos.length + '">' + imagesHtml + dotsHtml + '</figure>';
    html += '<h3>' + m.name + '</h3>';
    html += '<p class="tag">' + m.category + ' &middot; ' + m.city + '</p>';
    if (m.instagram) {
      html += '<p class="tag"><a href="' + m.instagram + '" target="_blank" rel="noopener">Instagram &rarr;</a></p>';
    }
    if (statsHtml) {
      html += '<button type="button" class="details-toggle">Details &#9662;</button>';
      html += '<div class="details-panel">' + statsHtml + '</div>';
    }
    html += '</div>';
    return html;
  }).join('');

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

  // Dot clicks and the Details toggle — one delegated listener handles
  // every card on the page, however many there are.
  container.addEventListener('click', function (e) {
    var dot = e.target.closest('.model-photo-dots button');
    if (dot) {
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

  // Swipe support — lets visitors swipe left/right on a card's photo to
  // move through that model's set, in addition to tapping the dots.
  container.querySelectorAll('figure[data-photo-count]').forEach(function (figure) {
    var count = Number(figure.getAttribute('data-photo-count'));
    if (count < 2) return;
    var startX = null;

    figure.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });

    figure.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var deltaX = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(deltaX) < 35) return; // too small to count as a swipe

      var current = Number(figure.querySelector('.stack-img.active').getAttribute('data-photo'));
      var next = deltaX < 0 ? current + 1 : current - 1;
      next = (next + count) % count;
      showPhoto(figure, next);
    }, { passive: true });
  });
}
