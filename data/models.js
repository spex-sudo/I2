// ============================================================
// MODEL ROSTER
// ------------------------------------------------------------
// This one file controls the Models, Female Models, and Male
// Models pages. You can edit it by hand, or use admin.html to
// manage it through a form instead.
// ============================================================
window.MODELS = [
  {
    "name": "Christina johnson",
    "gender": "female",
    "age": 0,
    "height": "5’8",
    "category": "Editorial",
    "city": "",
    "images": [
      "https://raw.githubusercontent.com/spex-sudo/I2/main/images/1788927870223-0-IMG_0135.jpeg",
      "https://raw.githubusercontent.com/spex-sudo/I2/main/images/1788927872217-1-IMG_0119.jpeg",
      "https://raw.githubusercontent.com/spex-sudo/I2/main/images/1788927873624-2-IMG_0119.jpeg",
      "https://raw.githubusercontent.com/spex-sudo/I2/main/images/1788927875174-3-IMG_0101.jpeg"
    ],
    "instagram": ""
  }
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

    var html = '<div class="roster-card">';
    html += '<figure>' + imagesHtml + dotsHtml + '</figure>';
    html += '<h3>' + m.name + '</h3>';
    html += '<p class="tag">' + m.age + ' · ' + m.height + '</p>';
    html += '<p class="tag">' + m.category + ' · ' + m.city + '</p>';
    if (m.instagram) {
      html += '<p class="tag"><a href="' + m.instagram + '" target="_blank" rel="noopener">Instagram →</a></p>';
    }
    html += '</div>';
    return html;
  }).join('');

  container.addEventListener('click', function (e) {
    var dot = e.target.closest('.model-photo-dots button');
    if (!dot) return;
    var photoIdx = dot.getAttribute('data-photo');
    var figure = dot.closest('figure');

    figure.querySelectorAll('.stack-img').forEach(function (img) {
      img.classList.toggle('active', img.getAttribute('data-photo') === photoIdx);
    });
    figure.querySelectorAll('.model-photo-dots button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-photo') === photoIdx);
    });
  });
}