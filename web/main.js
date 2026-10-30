// Número de WhatsApp del gym, con código de país y sin "+" ni espacios. Cámbialo aquí y vale para toda la página.
const WHATSAPP = '5350000000';

const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

for (const a of document.querySelectorAll('[data-wa]')) a.href = waLink(a.dataset.wa);

// Arma tu mensaje: las opciones elegidas escriben el WhatsApp que se envía.
const picker = document.getElementById('picker');
const bubble = document.getElementById('bubble');
const waText = document.getElementById('wa-text');
picker.action = `https://wa.me/${WHATSAPP}`;
const compose = () => {
  const f = new FormData(picker);
  const msg = `Hola, quiero ${f.get('goal')} y entreno ${f.get('time')}. ¿Cuánto cuesta ${f.get('plan')}?`;
  bubble.textContent = msg;
  waText.value = msg;
};
picker.addEventListener('change', compose);
picker.addEventListener('submit', (e) => {
  e.preventDefault();
  compose();
  window.open(waLink(waText.value), '_blank', 'noopener');
});

// Entradas al hacer scroll, una vez.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}, { rootMargin: '0px 0px -10% 0px' });
for (const el of document.querySelectorAll('[data-reveal], .blocks')) io.observe(el);

// Los objetos de la nevera y la vitrina bajan despacio con el scroll.
const drifts = [...document.querySelectorAll('.drift')];
// Las tarjetas del menú se doblan en lomos al bajar (solo en pantallas anchas).
const wrap = document.querySelector('.deck-wrap');
const cards = [...document.querySelectorAll('.card')];
const wide = matchMedia('(min-width: 901px)');
const SPINE = 124;
const STEP = 628;
let active = -1;

const layoutDeck = (i) => {
  if (i === active) return;
  active = i;
  cards.forEach((c, k) => {
    const later = k > i + 1;
    const x = k <= i ? k * SPINE : later ? innerWidth : i * SPINE + STEP;
    c.style.setProperty('--x', `${x}px`);
    c.style.zIndex = String(k);
    c.classList.toggle('is-spine', k < i);
    c.classList.toggle('is-later', later);
  });
};

cards.forEach((c, k) => c.addEventListener('click', (e) => {
  if (!wide.matches || !c.classList.contains('is-spine') || e.target.closest('a')) return;
  const span = wrap.offsetHeight - innerHeight;
  scrollTo({ top: wrap.offsetTop + ((k + 0.5) / cards.length) * span, behavior: reduce ? 'auto' : 'smooth' });
}));

let ticking = false;
const onScroll = () => {
  ticking = false;
  if (!reduce) for (const d of drifts) {
    const r = d.parentElement.getBoundingClientRect();
    const p = (innerHeight - r.top) / (innerHeight + r.height);
    d.style.setProperty('--drift', String(Math.round((p - 0.5) * 80)));
  }
  if (wide.matches) {
    const span = wrap.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, (scrollY - wrap.offsetTop) / span));
    layoutDeck(Math.min(cards.length - 1, Math.floor(p * cards.length)));
  } else if (active !== -1) {
    active = -1;
    cards.forEach((c) => { c.style.removeProperty('--x'); c.classList.remove('is-spine', 'is-later'); });
  }
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', onScroll);
onScroll();
