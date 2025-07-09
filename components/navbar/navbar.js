const currentPath = window.location.pathname;
let pathToNavbar = '';

if (currentPath.includes('/pages/')) {
  pathToNavbar = '../components/navbar/navbar.html';
} else {
  pathToNavbar = 'components/navbar/navbar.html';
}

fetch(pathToNavbar)
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-container').innerHTML = data;
  });
