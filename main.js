
// ── HAMBURGER ──
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu?.classList.toggle('open');
  document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : '';
});
document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── ACTIVE NAV LINK ──
const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
  const href = a.getAttribute('href').replace(/\/$/, '');
  if (currentPath.endsWith(href) || (href === 'index.html' && (currentPath === '' || currentPath === '/'))) {
    a.classList.add('active');
  }
});

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── LOAD CONTENT FROM JSON ──
async function loadJSON(path) {
  try {
    const r = await fetch(path + '?v=' + Date.now());
    return await r.json();
  } catch { return null; }
}

// ── RENDER EVENTS ──
async function renderEvents(containerId, showAll = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const data = await loadJSON('/content/events.json');
  if (!data || !data.events || data.events.length === 0) {
    container.innerHTML = `<div class="no-events"><p>Aktuell keine Veranstaltungen geplant.</p><p style="margin-top:0.5rem;font-size:0.75rem;color:var(--text-muted)">Schau bald wieder vorbei!</p></div>`;
    return;
  }
  const events = showAll ? data.events : data.events.filter(e => !e.past).slice(0, 3);
  if (events.length === 0) {
    container.innerHTML = `<div class="no-events"><p>Aktuell keine Veranstaltungen geplant.</p><p style="margin-top:0.5rem;font-size:0.75rem;color:var(--text-muted)">Schau bald wieder vorbei!</p></div>`;
    return;
  }
  container.innerHTML = events.map(ev => `
    <div class="event-card${ev.past ? ' past' : ''} reveal">
      ${ev.image ? `<img class="event-img" src="${ev.image}" alt="${ev.title}" loading="lazy">` : '<div style="width:70px;height:90px;background:var(--surface-2);border:1px solid var(--border)"></div>'}
      <div>
        <div class="event-date">${ev.date}${ev.time ? ' · ' + ev.time : ''}</div>
        <div class="event-title">${ev.title}</div>
        <div class="event-venue">${ev.venue}</div>
        ${ev.description ? `<p style="margin-top:0.5rem;font-size:0.85rem">${ev.description}</p>` : ''}
      </div>
      <div>
        ${ev.past ? '<span class="past-badge">Vergangen</span>' : ev.ticket_url ? `<a href="${ev.ticket_url}" target="_blank" rel="noopener" class="btn btn-primary">Tickets</a>` : '<span class="past-badge">Demnächst</span>'}
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── NETLIFY IDENTITY ──
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) window.netlifyIdentity.on('login', () => { document.location.href = '/admin/'; });
  });
}
