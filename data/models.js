// ============================================================
// MODEL ROSTER
// ------------------------------------------------------------
// This one file controls the Models, Female Models, and Male
// Models pages. You can edit it by hand, or use admin.html to
// manage it through a form instead.
// ============================================================
window.MODELS = [
  {
    "name": "Christina Johnson",
    "gender": "female",
    "age": 0,
    "height": "5’8",
    "category": "Editorial",
    "city": "",
    "image": "https://raw.githubusercontent.com/spex-sudo/I2/main/images/1788926518705-IMG_0119.jpeg",
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

  container.innerHTML = list.map(function (m) {
    var html = '<div class="roster-card">';
    html += '<figure><img src="' + m.image + '" alt="' + m.name + '"></figure>';
    html += '<h3>' + m.name + '</h3>';
    html += '<p class="tag">' + m.age + ' · ' + m.height + '</p>';
    html += '<p class="tag">' + m.category + ' · ' + m.city + '</p>';
    if (m.instagram) {
      html += '<p class="tag"><a href="' + m.instagram + '" target="_blank" rel="noopener">Instagram →</a></p>';
    }
    html += '</div>';
    return html;
  }).join('');
}