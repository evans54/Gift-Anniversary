// Interactive behavior for the One Month Surprise page
const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const shareBtn = document.getElementById('shareBtn');
const printBtn = document.getElementById('printBtn');
const shareQuick1 = document.getElementById('shareQuick1');
const shareQuick2 = document.getElementById('shareQuick2');

const section0 = document.getElementById('section0');
const section1 = document.getElementById('section1');
const section2 = document.getElementById('section2');
const section3 = document.getElementById('section3');

// collect all cards dynamically so adding/removing cards doesn't require updating this list
const cards = Array.from(document.querySelectorAll('.card'));
const backTo1 = document.getElementById('backTo1');
const backTo2 = document.getElementById('backTo2');

const storyCards = [
  document.getElementById('storyCard1'),
  document.getElementById('storyCard2'),
  document.getElementById('storyCard3'),
  document.getElementById('storyCard4')
];

// ordered list of story image sources (keeps viewer logic in one place)
const storyImages = [
  'images/image-1.jpeg',
  'images/image-2.jpeg',
  'images/image-3.jpeg',
  'images/image-4.jpeg'
];

// modal elements (added to DOM in index.html)
const storyModal = document.getElementById('storyModal');
const storyModalImg = document.getElementById('storyModalImg');
const storyModalPrev = document.querySelector('.sm-prev');
const storyModalNext = document.querySelector('.sm-next');
const storyModalClose = document.querySelector('.sm-close');
let currentStoryIndex = 0;

function showStoryIndex(i) {
  if (!storyModalImg) return;
  const idx = Math.max(0, Math.min(storyImages.length - 1, i));
  storyModalImg.src = storyImages[idx];
  storyModalImg.alt = 'Moment ' + (idx + 1);
  currentStoryIndex = idx;
}

function openStoryModal(i) {
  if (!storyModal) return;
  showStoryIndex(i);
  storyModal.removeAttribute('aria-hidden');
  storyModal.style.display = 'flex';
  // prevent background scroll while modal is open
  document.documentElement.style.overflow = 'hidden';
}

function closeStoryModal() {
  if (!storyModal) return;
  storyModal.setAttribute('aria-hidden', 'true');
  storyModal.style.display = 'none';
  document.documentElement.style.overflow = '';
}

// simple swipe handling for touch devices
let touchStartX = 0;
let touchEndX = 0;
function handleTouchStart(e) { touchStartX = e.touches ? e.touches[0].clientX : e.clientX; }
function handleTouchMove(e) { touchEndX = e.touches ? e.touches[0].clientX : e.clientX; }
function handleTouchEnd() {
  const dx = touchEndX - touchStartX;
  if (Math.abs(dx) > 40) {
    if (dx < 0) { // left swipe -> next
      showStoryIndex(currentStoryIndex + 1);
    } else { // right swipe -> prev
      showStoryIndex(currentStoryIndex - 1);
    }
  }
  touchStartX = touchEndX = 0;
}

if (storyModalPrev) storyModalPrev.addEventListener('click', () => showStoryIndex(currentStoryIndex - 1));
if (storyModalNext) storyModalNext.addEventListener('click', () => showStoryIndex(currentStoryIndex + 1));
if (storyModalClose) storyModalClose.addEventListener('click', closeStoryModal);
if (storyModal) {
  storyModal.addEventListener('click', (e) => { if (e.target === storyModal) closeStoryModal(); });
  storyModal.addEventListener('touchstart', handleTouchStart, { passive: true });
  storyModal.addEventListener('touchmove', handleTouchMove, { passive: true });
  storyModal.addEventListener('touchend', handleTouchEnd, { passive: true });
  // keyboard navigation within modal
  window.addEventListener('keydown', (e) => {
    if (storyModal && storyModal.getAttribute('aria-hidden') !== 'true') {
      if (e.key === 'Escape') closeStoryModal();
      if (e.key === 'ArrowLeft') showStoryIndex(currentStoryIndex - 1);
      if (e.key === 'ArrowRight') showStoryIndex(currentStoryIndex + 1);
    }
  });
}

const storyView1 = document.getElementById('storyView1');
const storyView2 = document.getElementById('storyView2');
const storyView3 = document.getElementById('storyView3');
const storyView4 = document.getElementById('storyView4');
const storyViews = [storyView1, storyView2, storyView3, storyView4];
const skipStoryBtn = document.getElementById('skipStoryBtn');
const nextStory1 = document.getElementById('nextStory1');
const nextStory2 = document.getElementById('nextStory2');
const nextStory3 = document.getElementById('nextStory3');
const nextStory4 = document.getElementById('nextStory4');
const storyBackBtns = document.querySelectorAll('.storyBackBtn');

let audioCtx = null;
let currentPlayer = null;
let currentCard = null;

function revealCards() {
  cards.forEach((c, i) => {
    c.style.setProperty('--delay', i * 140 + 'ms');
    c.classList.add('show');
  });
}

function hideSection(s) {
  if (s) s.classList.remove('active');
}

function showSection(s) {
  if (s) s.classList.add('active');
}

function stopAudio() {
  if (currentPlayer && currentPlayer.element && typeof currentPlayer.element.pause === 'function') {
    try { currentPlayer.element.pause(); currentPlayer.element.currentTime = 0; } catch (e) {}
  }
  if (currentPlayer && typeof currentPlayer.stop === 'function') {
    try { currentPlayer.stop(); } catch (e) {}
  }
  if (currentCard) {
    currentCard.classList.remove('active');
    currentCard.setAttribute('aria-pressed', 'false');
  }
  currentCard = null;
  currentPlayer = null;
}

function ensureAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audioCtx = null;
    }
  }
  return audioCtx;
}

function playMelody(m) {
  const ctx = ensureAudioContext();
  if (!ctx) return { stop() {} };
  const timeouts = [];
  const oscs = [];
  m.forEach((note, i) => {
    const [freq, dur, type = 'sine'] = note;
    const delay = m.slice(0, i).reduce((s, x) => s + x[1], 0);
    const t = setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      try { osc.start(); } catch (e) {}
      gain.gain.linearRampToValueAtTime(0, now + dur / 1000 - 0.02);
      setTimeout(() => { try { osc.stop(); } catch (e) {} try { osc.disconnect(); } catch (e) {} }, dur + 40);
      oscs.push(osc);
    }, delay);
    timeouts.push(t);
  });
  return {
    stop() {
      timeouts.forEach(t => clearTimeout(t));
      oscs.forEach(o => { try { o.stop(); } catch (e) {} });
    }
  };
}

const melodies = {
  card1: [[440, 300], [392, 300], [349, 400]],
  card2: [[660, 160, 'square'], [880, 160, 'square'], [660, 300, 'square']],
  card3: [[523, 200, 'triangle'], [783, 220, 'triangle'], [659, 380, 'triangle']]
};

// Navigation handlers
if (btn1) btn1.addEventListener('click', () => { hideSection(section0); hideSection(section1); showSection(section2); revealCards(); });
if (btn2) btn2.addEventListener('click', () => { hideSection(section2); showSection(section3); triggerCelebrate(); });
if (backTo1) backTo1.addEventListener('click', () => { stopAudio(); cards.forEach(c => c.classList.remove('show')); hideSection(section2); showSection(section1); });
if (backTo2) backTo2.addEventListener('click', () => { document.getElementById('confetti').innerHTML = ''; hideSection(section3); showSection(section2); revealCards(); });

// open the fullscreen story modal when clicking a story card
storyCards.forEach((c, i) => { if (c) c.addEventListener('click', () => { openStoryModal(i); }); });
if (skipStoryBtn) skipStoryBtn.addEventListener('click', () => { hideSection(section0); showSection(section1); });
storyBackBtns.forEach(b => b.addEventListener('click', () => { storyViews.forEach(v => hideSection(v)); showSection(section0); }));
if (nextStory1) nextStory1.addEventListener('click', () => { hideSection(storyView1); showSection(storyView2); });
if (nextStory2) nextStory2.addEventListener('click', () => { hideSection(storyView2); showSection(storyView3); });
if (nextStory3) nextStory3.addEventListener('click', () => { hideSection(storyView3); showSection(storyView4); });
if (nextStory4) nextStory4.addEventListener('click', () => { hideSection(storyView4); showSection(section1); });

cards.forEach(card => {
  if (!card) return;
  function activate() {
    const id = card.id;
    if (currentCard === card) { stopAudio(); currentCard = null; return; }
    stopAudio();
    card.classList.add('active');
    card.setAttribute('aria-pressed', 'true');
    currentCard = card;
    currentPlayer = playMelody(melodies[id] || melodies.card1);
  }
  card.addEventListener('click', activate);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
});

async function tryShare(d = {}) {
  const text = d.text || 'A sweet one month surprise';
  const url = d.url || window.location.href;
  const title = d.title || document.title;
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return true; } catch (e) { console.warn('share failed', e); }
  }
  if (navigator.clipboard) {
    try { await navigator.clipboard.writeText(title + ' - ' + text + '\n' + url); alert('Link copied to clipboard'); return true; } catch (e) { console.warn('clipboard failed', e); }
  }
  prompt('Copy this link', url);
  return false;
}

if (shareBtn) shareBtn.addEventListener('click', () => tryShare({ title: 'Happy one month', text: 'A small surprise for you' }));
if (shareQuick1) shareQuick1.addEventListener('click', () => tryShare({ title: 'One month surprise', text: 'Check this out' }));
if (shareQuick2) shareQuick2.addEventListener('click', () => tryShare({ title: 'One month surprise', text: 'Check this out' }));
if (printBtn) printBtn.addEventListener('click', () => window.print());

function createConfetti(count = 40) {
  const container = document.getElementById('confetti');
  const colors = ['#ff5e5e', '#ffd166', '#6ee7b7', '#7dd3fc', '#c4b5fd'];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    if (Math.random() < 0.25) {
      const el = document.createElement('div');
      el.className = 'confetti-flower';
      const size = 14 + 18 * Math.random();
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = x + 80 * Math.random() - 40 + 'vw';
      el.style.top = '-12vh';
      el.style.opacity = 0.9 + 0.1 * Math.random();
      el.style.transform = 'rotate(' + 360 * Math.random() + 'deg)';
      const dur = 1200 + 1200 * Math.random();
      el.style.animationDuration = dur + 'ms';
      const fill = colors[Math.floor(colors.length * Math.random())];
      el.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g transform="translate(12,12)"><circle r="2.2" fill="' + fill + '"/><g fill="' + fill + '" opacity="0.95"><ellipse rx="1.8" ry="3.6" transform="rotate(0) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(60) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(120) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(180) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(240) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(300) translate(0,-6)"/></g></g></svg>';
      container.appendChild(el);
      setTimeout(() => el.remove(), dur + 400);
    } else {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const w = 8 + 10 * Math.random();
      const h = w * (0.8 + 0.6 * Math.random());
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.style.background = colors[Math.floor(colors.length * Math.random())];
      el.style.left = x + 80 * Math.random() - 40 + 'vw';
      el.style.top = '-10vh';
      el.style.opacity = 0.9 + 0.1 * Math.random();
      el.style.transform = 'rotate(' + 360 * Math.random() + 'deg)';
      const dur = 1100 + 1200 * Math.random();
      el.style.animationDuration = dur + 'ms';
      container.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  }
}

const heart = document.getElementById('heartSVG');
function popHeart() {
  if (!heart) return;
  heart.classList.remove('pop');
  void heart.offsetWidth;
  heart.classList.add('pop');
}

function triggerCelebrate() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  createConfetti(40);
  popHeart();
}

// Minor accessibility helpers
window.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.documentElement.classList.add('show-focus'); }, { once: true });
window.addEventListener('mousedown', () => document.documentElement.classList.remove('show-focus'));