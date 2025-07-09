// about.js
document.addEventListener('DOMContentLoaded', () => {
  // Animation d'apparition progressive des sections
  const sections = document.querySelectorAll('.about-section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
  });
});