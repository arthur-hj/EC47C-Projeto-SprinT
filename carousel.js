// carousel.js
// Seleciona os elementos principais
const track = document.getElementById('carouselTrack');
const cards = document.querySelectorAll('.card-empresa');
const anteriorBtn = document.getElementById('antBt');

// Botão de próximo (adicione id="proxBt" no HTML correspondente)
const proximoBtn = document.getElementById('proxBt');

let currentIndex = 0;

// Quantos cards ficam visíveis por vez (ajuste conforme seu layout)
function getVisibleCount() {
  const wrapperWidth = track.parentElement.offsetWidth;
  const cardWidth = cards[0].offsetWidth;
  return Math.round(wrapperWidth / cardWidth);
}

function getCardWidth() {
  // Inclui o gap entre os cards (lê do computedStyle do track)
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  return cards[0].offsetWidth + gap;
}

function updateCarousel() {
  const offset = currentIndex * getCardWidth();
  track.style.transform = `translateX(-${offset}px)`;
  track.style.transition = 'transform 0.4s ease';

  // Controla estado dos botões (desabilita nas extremidades)
  anteriorBtn.disabled = currentIndex === 0;
  if (proximoBtn) {
    proximoBtn.disabled = currentIndex >= cards.length - getVisibleCount();
  }
}

function slide(direction) {
  const maxIndex = cards.length - getVisibleCount();

  currentIndex += direction;

  // Limita nos extremos
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > maxIndex) currentIndex = maxIndex;

  updateCarousel();
}

// Suporte a toque (swipe mobile)
let touchStartX = 0;

track.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

track.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;

  if (Math.abs(diff) > 50) { // threshold mínimo de 50px
    slide(diff > 0 ? 1 : -1);
  }
});

// Recalcula ao redimensionar a janela
window.addEventListener('resize', () => {
  // Garante que o índice ainda seja válido após resize
  const maxIndex = cards.length - getVisibleCount();
  if (currentIndex > maxIndex) currentIndex = Math.max(0, maxIndex);
  updateCarousel();
});

// Estado inicial
updateCarousel();