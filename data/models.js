// ============================================================
// MODEL ROSTER
// ------------------------------------------------------------
// This one file controls the Models, Female Models, and Male
// Models pages. Add a model here and they automatically show
// up on the right page(s) — no HTML editing needed.
//
// HOW TO ADD A MODEL:
// 1. Upload their photo to your GitHub repo's /images folder.
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
  //   image: "https://raw.githubusercontent.com/spex-sudo/I2/main/images/example.jpg",
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

  container.innerHTML = list.map(function (m) {
    var html = '<div class="roster-card">';
    html += '<figure><img src="' + m.image + '" alt="' + m.name + '"></figure>';
    html += '<h3>' + m.name + '</h3>';
    html += '<p class="tag">' + m.age + ' &middot; ' + m.height + '</p>';
    html += '<p class="tag">' + m.category + ' &middot; ' + m.city + '</p>';
    if (m.instagram) {
      html += '<p class="tag"><a href="' + m.instagram + '" target="_blank" rel="noopener">Instagram &rarr;</a></p>';
    }
    html += '</div>';
    return html;
  }).join('');
}
