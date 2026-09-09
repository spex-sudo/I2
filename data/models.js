// ============================================================
// MODEL ROSTER
// ------------------------------------------------------------
// This one file controls the Models, Female Models, and Male
// Models pages. Add a model here and they automatically show
// up on the right page(s) — no HTML editing needed.
//
// HOW TO ADD A MODEL:
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
//   small dots appear on their card so visitors can click
//   through the set.
// - instagram is optional. Leave it as "" (empty) if unused.
// ============================================================

window.MODELS = [

  // EXAMPLE — copy this block to add a real model, or delete
  // it once you've added your first one.
  // {
  //   name: "Model Name",
  //   gender: "female",
  //   age: 22,
  //   height: "5'9\"",
  //   category: "Editorial",
  //   city: "Kingston",
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

    var html = '<div class="roster-card">';
    html += '<figure>' + imagesHtml + dotsHtml + '</figure>';
    html += '<h3>' + m.name + '</h3>';
    html += '<p class="tag">' + m.age + ' &middot; ' + m.height + '</p>';
    html += '<p class="tag">' + m.category + ' &middot; ' + m.city + '</p>';
    if (m.instagram) {
      html += '<p class="tag"><a href="' + m.instagram + '" target="_blank" rel="noopener">Instagram &rarr;</a></p>';
    }
    html += '</div>';
    return html;
  }).join('');

  // One click listener handles every card's dots (event delegation) —
  // works no matter how many models are on the page.
  container.addEventListener('click', function (e) {
    var dot = e.target.closest('.model-photo-dots button');
    if (!dot) return;
    var modelIdx = dot.getAttribute('data-model');
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
