document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carouselTrack');
  const cards = document.querySelectorAll('.card-empresa');
  const anteriorBtn = document.getElementById('antBt');
  const proximoBtn = document.getElementById('proxBt');

  let currentIndex = 0;

  function getVisibleCount() {
    const wrapperWidth = track.parentElement.offsetWidth;
    const cardWidth = cards[0].offsetWidth;
    return Math.round(wrapperWidth / cardWidth);
  }

  function getCardWidth() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].offsetWidth + gap;
  }

  function updateCarousel() {
    const offset = currentIndex * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
    anteriorBtn.disabled = currentIndex === 0;
    if (proximoBtn) {
      proximoBtn.disabled = currentIndex >= cards.length - getVisibleCount();
    }
  }

  window.slide = function(direction) {
    const maxIndex = cards.length - getVisibleCount();
    currentIndex = Math.min(Math.max(currentIndex + direction, 0), maxIndex);
    updateCarousel();
  };

  window.addEventListener('resize', () => {
    const maxIndex = cards.length - getVisibleCount();
    if (currentIndex > maxIndex) currentIndex = Math.max(0, maxIndex);
    updateCarousel();
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) window.slide(diff > 0 ? 1 : -1);
  });

  updateCarousel();
});