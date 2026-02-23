const currentPath = window.location.pathname;
let pathToFooter = currentPath.includes('/pages/') 
  ? '../components/footer/footer.html' 
  : 'components/footer/footer.html';

fetch(pathToFooter)
  .then(res => res.text())
  .then(data => {
    const container = document.getElementById('footer-container');
    if (container) container.innerHTML = data;
  });