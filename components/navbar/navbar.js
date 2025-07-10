// Determine the path to the navbar HTML based on the current URL
const currentPath = window.location.pathname;
let pathToNavbar = currentPath.includes('/pages/') ? '../components/navbar/navbar.html' : 'components/navbar/navbar.html';

fetch(pathToNavbar)
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-container').innerHTML = data;

    const hamburger = document.querySelector('.hamburger');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (hamburger && navbarMenu) {
      hamburger.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
      });

      const navLinks = document.querySelectorAll('.navbar-list li a');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navbarMenu.classList.remove('active');
        });
      });

      document.addEventListener('click', (e) => {
        if (!navbarMenu.contains(e.target) && !hamburger.contains(e.target)) {
          navbarMenu.classList.remove('active');
        }
      });
    }
  });
