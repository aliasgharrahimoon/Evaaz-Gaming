/* Public site: loads data/games.json, renders cards + modal */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let GAMES = [];

// Turn any YouTube link (or direct video URL) into an embed
function trailer(u) {
  if (!u) return '';
  const m = u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  if (m) return `<iframe class="vid" src="https://www.youtube.com/embed/${m[1]}" allowfullscreen></iframe>`;
  return `<video class="vid" src="${esc(u)}" controls></video>`;
}

function render() {
  $('#grid').innerHTML = GAMES.map((g, i) => `
    <article class="card reveal" data-i="${i}">
      <div class="cover" style="${g.cover ? `background-image:url('${esc(g.cover)}')` : ''}"></div>
      <div class="in"><span class="st">${esc(g.status)}</span><h3>${esc(g.title)}</h3>
      <p>${esc(g.tagline)}</p>${(g.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    </article>`).join('') || '<p>No games yet. Add some in the admin panel.</p>';
  document.querySelectorAll('.card').forEach(card => {
    card.onclick = () => openModal(GAMES[card.dataset.i]);
    // 3D tilt
    card.onmousemove = e => { const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; card.style.transform = `rotateY(${px * 18}deg) rotateX(${-py * 18}deg) translateZ(10px)`; };
    card.onmouseleave = () => card.style.transform = '';
    io.observe(card);
  });
}

function openModal(g) {
  $('#modal').innerHTML = `<div class="mbox">
    <button class="btn m x" onclick="closeModal()">Close ✕</button>
    <h2><span class="glitch" data-t="${esc(g.title)}">${esc(g.title)}</span></h2>
    <div class="big" style="${g.cover ? `background-image:url('${esc(g.cover)}')` : ''}"></div>
    ${(g.screenshots || []).length ? `<div class="shots">${g.screenshots.map(s => `<img src="${esc(s)}" alt="">`).join('')}</div>` : ''}
    ${trailer(g.trailer)}
    <p class="meta">${esc(g.status)} · ${esc(g.release)}</p>
    <p>${esc(g.description).replace(/\n/g, '<br>')}</p>
    <p>${(g.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</p><br>
    ${g.play ? `<a class="btn" href="${esc(g.play)}" target="_blank" rel="noopener">▶ Play</a> ` : ''}
    ${g.download ? `<a class="btn m" href="${esc(g.download)}" target="_blank" rel="noopener">⬇ Download</a>` : ''}
  </div>`;
  $('#modal').classList.add('open'); document.body.style.overflow = 'hidden';
}
function closeModal() { $('#modal').classList.remove('open'); document.body.style.overflow = ''; }
$('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };
addEventListener('keydown', e => e.key === 'Escape' && closeModal());

// Scroll-triggered reveal
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('on')), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Site info from config
$('#socials').innerHTML = Object.entries(SITE.socials).map(([k, v]) => `<a class="btn" href="${esc(v)}" target="_blank" rel="noopener">${esc(k)}</a>`).join(' ') + ` <a class="btn m" href="mailto:${esc(SITE.email)}">Email</a>`;

// Load data. Add ?preview to the URL to see unsaved admin drafts.
(async () => {
  const draft = location.search.includes('preview') && localStorage.getItem('na_draft');
  try {
    GAMES = draft ? JSON.parse(draft) : await (await fetch('games.json?' + Date.now())).json();
    render();
  } catch (e) {
    $('#grid').innerHTML = '<div class="err">Could not load data/games.json. Open the site through a local server (python -m http.server 8000), not by double-clicking index.html.</div>';
  }
})();
