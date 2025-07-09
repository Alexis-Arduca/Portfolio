async function setLanguage(lang) {
  const res = await fetch(`lang/${lang}.json`);
  const data = await res.json();

  document.getElementById('projects-title').innerText = data.projectsTitle;

  const descriptionContainer = document.getElementById('project1-description');
  descriptionContainer.innerHTML = '';
  data.project1Description.forEach(p => {
    const paragraph = document.createElement('p');
    paragraph.textContent = p;
    descriptionContainer.appendChild(paragraph);
  });
}

// By default, it will be setup as French (because I'm French)
window.onload = () => setLanguage('fr');
