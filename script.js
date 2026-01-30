// Interactive behavior for the One Month Surprise page
// Initialize DOM elements with error handling
let elements = {};

function initializeElements() {
  try {
    elements = {
      btn1: document.getElementById('btn1'),
      btn2: document.getElementById('btn2'),
      shareBtn: document.getElementById('shareBtn'),
      printBtn: document.getElementById('printBtn'),
      shareQuick1: document.getElementById('shareQuick1'),
      shareQuick2: document.getElementById('shareQuick2'),
      section0: document.getElementById('section0'),
      section1: document.getElementById('section1'),
      section2: document.getElementById('section2'),
      section3: document.getElementById('section3'),
      backTo1: document.getElementById('backTo1'),
      backTo2: document.getElementById('backTo2'),
      skipStoryBtn: document.getElementById('skipStoryBtn'),
      startOverBtn: document.getElementById('startOverBtn'),
      storyModal: document.getElementById('storyModal'),
      storyModalImg: document.getElementById('storyModalImg'),
      storyModalPrev: document.querySelector('.sm-prev'),
      storyModalNext: document.querySelector('.sm-next'),
      storyModalClose: document.querySelector('.sm-close'),
      heart: document.getElementById('heartSVG'),
      confetti: document.getElementById('confetti')
    };
  } catch (error) {
    console.error('Error initializing DOM elements:', error);
  }
}

// collect all cards dynamically so adding/removing cards doesn't require updating this list
let cards = [];
let storyViews = [];
let storyCards = [];
let storyBackBtns = [];

function initializeCollections() {
  try {
    cards = Array.from(document.querySelectorAll('.card'));
    storyViews = [
      document.getElementById('storyView1'),
      document.getElementById('storyView2'),
      document.getElementById('storyView3'),
      document.getElementById('storyView4'),
      document.getElementById('storyView5')
    ];
    storyCards = [
      document.getElementById('storyCard1'),
      document.getElementById('storyCard2'),
      document.getElementById('storyCard3'),
      document.getElementById('storyCard4'),
      document.getElementById('storyCard5')
    ];
    storyBackBtns = document.querySelectorAll('.storyBackBtn');
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

// ordered list of story image sources (keeps viewer logic in one place)
const storyImages = [
  'images/image-1.png',
  'images/image-2.jpeg',
  'images/image-3.jpeg',
  'images/image-4.jpeg',
  'images/image-5.jpeg'
];

// Modal elements (added to DOM in index.html)
let currentStoryIndex = 0;

function showStoryIndex(i) {
  try {
    if (!elements.storyModalImg) {
      console.warn('Story modal image not found');
      return;
    }
    const idx = Math.max(0, Math.min(storyImages.length - 1, i));
    elements.storyModalImg.src = storyImages[idx];
    elements.storyModalImg.alt = 'Moment ' + (idx + 1);
    currentStoryIndex = idx;
  } catch (error) {
    console.error('Error in showStoryIndex:', error);
  }
}

function openStoryModal(i) {
  try {
    if (!elements.storyModal) {
      console.warn('Story modal not found');
      return;
    }
    showStoryIndex(i);
    elements.storyModal.removeAttribute('aria-hidden');
    elements.storyModal.style.display = 'flex';
    // prevent background scroll while modal is open
    document.documentElement.style.overflow = 'hidden';
  } catch (error) {
    console.error('Error in openStoryModal:', error);
  }
}

function closeStoryModal() {
  try {
    if (!elements.storyModal) {
      console.warn('Story modal not found');
      return;
    }
    elements.storyModal.setAttribute('aria-hidden', 'true');
    elements.storyModal.style.display = 'none';
    document.documentElement.style.overflow = '';
  } catch (error) {
    console.error('Error in closeStoryModal:', error);
  }
}

// simple swipe handling for touch devices
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  try {
    touchStartX = e.touches ? e.touches[0].clientX : e.clientX;
  } catch (error) {
    console.error('Error in handleTouchStart:', error);
  }
}

function handleTouchMove(e) {
  try {
    touchEndX = e.touches ? e.touches[0].clientX : e.clientX;
  } catch (error) {
    console.error('Error in handleTouchMove:', error);
  }
}

function handleTouchEnd() {
  try {
    const dx = touchEndX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) { // left swipe -> next
        showStoryIndex(currentStoryIndex + 1);
      } else { // right swipe -> prev
        showStoryIndex(currentStoryIndex - 1);
      }
    }
    touchStartX = touchEndX = 0;
  } catch (error) {
    console.error('Error in handleTouchEnd:', error);
  }
}

// Navigation handlers
function hideSection(s) {
  try {
    if (s) s.classList.remove('active');
  } catch (error) {
    console.error('Error in hideSection:', error);
  }
}

function showSection(s) {
  try {
    if (s) {
      // Hide all sections first
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });
      // Show the target section
      s.classList.add('active');
    }
  } catch (error) {
    console.error('Error in showSection:', error);
  }
}

function revealCards() {
  try {
    cards.forEach((c, i) => {
      c.style.setProperty('--delay', i * 140 + 'ms');
      c.classList.add('show');
    });
  } catch (error) {
    console.error('Error in revealCards:', error);
  }
}

let audioCtx = null;
let currentPlayer = null;
let currentCard = null;

function stopAudio() {
  try {
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
  } catch (error) {
    console.error('Error in stopAudio:', error);
  }
}

function ensureAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (!audioCtx) {
        throw new Error('AudioContext not supported');
      }
    } catch (error) {
      console.warn('Could not create AudioContext:', error);
      audioCtx = null;
    }
  }
  return audioCtx;
}

function playMelody(m) {
  const ctx = ensureAudioContext();
  if (!ctx) return { stop() {} };

  try {
    const timeouts = [];
    const oscs = [];
    m.forEach((note, i) => {
      const [freq, dur, type = 'sine'] = note;
      const delay = m.slice(0, i).reduce((s, x) => s + x[1], 0);
      const t = setTimeout(() => {
        try {
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
          osc.start();
          gain.gain.linearRampToValueAtTime(0, now + dur / 1000 - 0.02);
          setTimeout(() => {
            try { osc.stop(); osc.disconnect(); } catch (e) { /* ignore cleanup errors */ }
          }, dur + 40);
          oscs.push(osc);
        } catch (error) {
          console.warn('Error playing note:', error);
        }
      }, delay);
      timeouts.push(t);
    });
    return {
      stop() {
        timeouts.forEach(t => clearTimeout(t));
        oscs.forEach(o => { try { o.stop(); } catch (e) { /* ignore cleanup errors */ } });
      }
    };
  } catch (error) {
    console.warn('Error in playMelody:', error);
    return { stop() {} };
  }
}

const melodies = {
  card1: [[440, 300], [392, 300], [349, 400]],
  card2: [[660, 160, 'square'], [880, 160, 'square'], [660, 300, 'square']],
  card3: [[523, 200, 'triangle'], [783, 220, 'triangle'], [659, 380, 'triangle']]
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  try {
    initializeElements();
    initializeCollections();
    setupEventListeners();
    initializeMusicPlayer();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

function setupEventListeners() {
  try {
    // Navigation buttons
    if (elements.btn1) elements.btn1.addEventListener('click', () => { hideSection(elements.section1); showSection(elements.section2); });
    if (elements.btn2) elements.btn2.addEventListener('click', () => { hideSection(elements.section2); showSection(elements.section3); });
    if (elements.skipStoryBtn) elements.skipStoryBtn.addEventListener('click', () => { hideSection(elements.section0); showSection(elements.section1); });
    if (elements.startOverBtn) elements.startOverBtn.addEventListener('click', () => { hideSection(elements.section3); showSection(elements.section0); });

    // open the fullscreen story modal when clicking a story card
    storyCards.forEach((c, i) => { if (c) c.addEventListener('click', () => { openStoryModal(i); }); });
    if (elements.skipStoryBtn) elements.skipStoryBtn.addEventListener('click', () => { hideSection(elements.section0); showSection(elements.section1); });
    storyBackBtns.forEach(b => b.addEventListener('click', () => { storyViews.forEach(v => hideSection(v)); showSection(elements.section0); }));

    // Story navigation
    const nextStory1 = document.getElementById('nextStory1');
    const nextStory2 = document.getElementById('nextStory2');
    const nextStory3 = document.getElementById('nextStory3');
    const nextStory4 = document.getElementById('nextStory4');
    const nextStory5 = document.getElementById('nextStory5');

    if (nextStory1) nextStory1.addEventListener('click', () => { hideSection(storyViews[0]); showSection(storyViews[1]); });
    if (nextStory2) nextStory2.addEventListener('click', () => { hideSection(storyViews[1]); showSection(storyViews[2]); });
    if (nextStory3) nextStory3.addEventListener('click', () => { hideSection(storyViews[2]); showSection(storyViews[3]); });
    if (nextStory4) nextStory4.addEventListener('click', () => { hideSection(storyViews[3]); showSection(storyViews[4]); });
    if (nextStory5) nextStory5.addEventListener('click', () => { hideSection(storyViews[4]); showSection(elements.section1); });

    // Share buttons
    if (elements.shareBtn) elements.shareBtn.addEventListener('click', () => tryShare({ 
      title: 'One Month Anniversary 💕', 
      text: 'I made something special for our one month anniversary. You make me happier than I ever imagined. Here\'s to many more months together. 💕✨', 
      url: window.location.href 
    }));
    if (elements.shareQuick1) elements.shareQuick1.addEventListener('click', () => tryShare({ title: 'One month surprise', text: 'Check this out' }));
    if (elements.shareQuick2) elements.shareQuick2.addEventListener('click', () => tryShare({ title: 'One month surprise', text: 'Check this out' }));
    if (elements.printBtn) elements.printBtn.addEventListener('click', () => window.print());

    // Card interactions
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

    // Modal event listeners
    if (elements.storyModalPrev) elements.storyModalPrev.addEventListener('click', () => showStoryIndex(currentStoryIndex - 1));
    if (elements.storyModalNext) elements.storyModalNext.addEventListener('click', () => showStoryIndex(currentStoryIndex + 1));
    if (elements.storyModalClose) elements.storyModalClose.addEventListener('click', closeStoryModal);

    if (elements.storyModal) {
      elements.storyModal.addEventListener('click', (e) => { if (e.target === elements.storyModal) closeStoryModal(); });
      elements.storyModal.addEventListener('touchstart', handleTouchStart, { passive: true });
      elements.storyModal.addEventListener('touchmove', handleTouchMove, { passive: true });
      elements.storyModal.addEventListener('touchend', handleTouchEnd, { passive: true });

      // keyboard navigation within modal
      window.addEventListener('keydown', (e) => {
        if (elements.storyModal && elements.storyModal.getAttribute('aria-hidden') !== 'true') {
          if (e.key === 'Escape') closeStoryModal();
          if (e.key === 'ArrowLeft') showStoryIndex(currentStoryIndex - 1);
          if (e.key === 'ArrowRight') showStoryIndex(currentStoryIndex + 1);
        }
      });
    }

    // Accessibility helpers
    window.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.documentElement.classList.add('show-focus'); }, { once: true });
    window.addEventListener('mousedown', () => document.documentElement.classList.remove('show-focus'));
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }
}

function createConfetti(count = 40) {
  try {
    const container = elements.confetti;
    if (!container) {
      console.warn('Confetti container not found');
      return;
    }

    const colors = ['#ff5e5e', '#ffd166', '#6ee7b7', '#7dd3fc', '#c4b5fd'];
    for (let i = 0; i < count; i++) {
      try {
        const x = Math.random() * 100;
        if (Math.random() < 0.25) {
          createConfettiFlower(container, colors, x);
        } else {
          createConfettiPiece(container, colors, x);
        }
      } catch (error) {
        console.warn('Error creating confetti piece:', error);
      }
    }
  } catch (error) {
    console.error('Error in createConfetti:', error);
  }
}

function createConfettiFlower(container, colors, x) {
  const el = document.createElement('div');
  el.className = 'confetti-flower';
  const size = 14 + 18 * Math.random();
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = x + 80 * Math.random() - 40 + 'vw';
  el.style.top = '-12vh';
  el.style.opacity = 0.85 + 0.15 * Math.random();
  el.style.transform = 'rotate(' + 360 * Math.random() + 'deg)';
  const fallDur = 1600 + 1400 * Math.random();
  const rotDur = 1600 + 2000 * Math.random();
  const swayDur = 1200 + 1600 * Math.random();
  const delay = Math.floor(Math.random() * 300);

  el.style.setProperty('--fall-dur', fallDur + 'ms');
  el.style.setProperty('--rot-dur', rotDur + 'ms');
  el.style.setProperty('--sway-dur', swayDur + 'ms');
  el.style.setProperty('--delay', delay + 'ms');
  el.style.setProperty('--sway', (8 + 28 * Math.random()) + 'px');

  const fill = colors[Math.floor(colors.length * Math.random())];
  el.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g transform="translate(12,12)"><circle r="2.2" fill="' + fill + '"/><g fill="' + fill + '" opacity="0.95"><ellipse rx="1.8" ry="3.6" transform="rotate(0) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(60) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(120) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(180) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(240) translate(0,-6)"/><ellipse rx="1.8" ry="3.6" transform="rotate(300) translate(0,-6)"/></g></g></svg>';

  container.appendChild(el);
  setTimeout(() => el.remove(), fallDur + 600);
}

function createConfettiPiece(container, colors, x) {
  const el = document.createElement('div');
  el.className = 'confetti-piece';
  const w = 8 + 10 * Math.random();
  const h = w * (0.8 + 0.6 * Math.random());
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.background = colors[Math.floor(colors.length * Math.random())];
  el.style.left = x + 80 * Math.random() - 40 + 'vw';
  el.style.top = '-10vh';
  el.style.opacity = 0.85 + 0.15 * Math.random();
  el.style.transform = 'rotate(' + 360 * Math.random() + 'deg)';

  const fallDur = 1400 + 1600 * Math.random();
  const rotDur = 1000 + 2000 * Math.random();
  const swayDur = 1000 + 1400 * Math.random();
  const delay = Math.floor(Math.random() * 300);

  el.style.setProperty('--fall-dur', fallDur + 'ms');
  el.style.setProperty('--rot-dur', rotDur + 'ms');
  el.style.setProperty('--sway-dur', swayDur + 'ms');
  el.style.setProperty('--delay', delay + 'ms');
  el.style.setProperty('--sway', (6 + 26 * Math.random()) + 'px');

  container.appendChild(el);
  setTimeout(() => el.remove(), fallDur + 800);
}

function popHeart() {
  try {
    const heart = elements.heart;
    if (!heart) {
      console.warn('Heart element not found');
      return;
    }
    heart.classList.remove('pop');
    void heart.offsetWidth; // Force reflow
    heart.classList.add('pop');
  } catch (error) {
    console.error('Error in popHeart:', error);
  }
}

function triggerCelebrate() {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    createConfetti(40);
    popHeart();
  } catch (error) {
    console.error('Error in triggerCelebrate:', error);
  }
}

// Background Music Player
let backgroundMusic = null;
let isMusicPlaying = false;
let musicVolume = 0.3;

function initializeMusicPlayer() {
  try {
    elements.musicToggle = document.getElementById('musicToggle');
    elements.volumeControls = document.getElementById('volumeControls');
    elements.volumeSlider = document.getElementById('volumeSlider');
    elements.volumeLabel = document.getElementById('volumeLabel');
    elements.musicPlayer = document.getElementById('musicPlayer');
    elements.playIcon = document.querySelector('.music-play-icon');
    elements.pauseIcon = document.querySelector('.music-pause-icon');

    // Create audio element
    backgroundMusic = new Audio();
    backgroundMusic.loop = true;
    backgroundMusic.volume = musicVolume;
    
    // Set the romantic song file
    backgroundMusic.src = 'music/romantic-song.mp3';
    
    // Load user preferences
    const savedVolume = localStorage.getItem('musicVolume');
    
    if (savedVolume) {
      musicVolume = parseFloat(savedVolume) / 100;
      backgroundMusic.volume = musicVolume;
      elements.volumeSlider.value = savedVolume;
      elements.volumeLabel.textContent = savedVolume + '%';
    }
    
    // Event listeners
    if (elements.musicToggle) {
      elements.musicToggle.addEventListener('click', toggleMusic);
    }
    
    if (elements.volumeSlider) {
      elements.volumeSlider.addEventListener('input', updateVolume);
    }
    
    // Add audio event listeners for debugging
    backgroundMusic.addEventListener('loadstart', () => console.log('🎵 Audio loading started'));
    backgroundMusic.addEventListener('canplay', () => {
      console.log('✅ Audio can play - ready for playback');
    });
    backgroundMusic.addEventListener('play', () => {
      console.log('🎶 Audio playing');
      isMusicPlaying = true;
      if (elements.musicToggle) {
        elements.musicToggle.classList.add('playing');
        elements.musicToggle.setAttribute('aria-label', 'Pause music');
      }
      localStorage.setItem('musicPlaying', 'true');
    });
    backgroundMusic.addEventListener('pause', () => {
      console.log('⏸️ Audio paused');
      isMusicPlaying = false;
      if (elements.musicToggle) {
        elements.musicToggle.classList.remove('playing');
        elements.musicToggle.setAttribute('aria-label', 'Play music');
      }
      localStorage.setItem('musicPlaying', 'false');
    });
    backgroundMusic.addEventListener('error', (e) => {
      console.error('❌ Audio error:', e);
      console.error('Audio error details:', backgroundMusic.error);
    });
    
    // Load the audio file
    backgroundMusic.load();
    
  } catch (error) {
    console.error('Error initializing music player:', error);
  }
}

function toggleMusic() {
  try {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  } catch (error) {
    console.error('Error toggling music:', error);
  }
}

function playMusic() {
  try {
    if (backgroundMusic && elements.musicToggle) {
      backgroundMusic.play().then(() => {
        isMusicPlaying = true;
        elements.musicToggle.classList.add('playing');
        elements.musicToggle.setAttribute('aria-label', 'Pause music');
        localStorage.setItem('musicPlaying', 'true');
      }).catch(error => {
        console.warn('Could not play music:', error);
      });
    }
  } catch (error) {
    console.error('Error playing music:', error);
  }
}

function pauseMusic() {
  try {
    if (backgroundMusic && elements.musicToggle) {
      backgroundMusic.pause();
      isMusicPlaying = false;
      elements.musicToggle.classList.remove('playing');
      elements.musicToggle.setAttribute('aria-label', 'Play music');
      localStorage.setItem('musicPlaying', 'false');
    }
  } catch (error) {
    console.error('Error pausing music:', error);
  }
}

function updateVolume() {
  try {
    if (elements.volumeSlider && elements.volumeLabel && backgroundMusic) {
      const volume = elements.volumeSlider.value;
      musicVolume = volume / 100;
      backgroundMusic.volume = musicVolume;
      elements.volumeLabel.textContent = volume + '%';
      localStorage.setItem('musicVolume', volume);
    }
  } catch (error) {
    console.error('Error updating volume:', error);
  }
}

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