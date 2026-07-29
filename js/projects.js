document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    const filter = button.dataset.filter;
    document.querySelectorAll('.category-section').forEach(section => {
      if (filter === 'all' || section.dataset.category === filter) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
  });
});

function closeModal(modal) {
  if (!modal) return;
  modal.style.display = 'none';
  const trigger = document.querySelector(`[data-modal-trigger="${modal.id.replace('modal-', '')}"]`);
  if (trigger) trigger.focus();
}

document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const modalId = `modal-${trigger.dataset.modalTrigger}`;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    }
  });
});

document.querySelectorAll('.modal-close').forEach(close => {
  // Make the close control keyboard-operable (it's a <span>, not a <button>)
  close.setAttribute('role', 'button');
  close.setAttribute('tabindex', '0');

  close.addEventListener('click', () => closeModal(close.closest('.modal')));
  close.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeModal(close.closest('.modal'));
    }
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openModal = document.querySelector('.modal[style*="flex"]');
    if (openModal) closeModal(openModal);
  }
});