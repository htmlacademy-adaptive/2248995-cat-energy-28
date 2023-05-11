const header = document.querySelector('.header');
const button = header.querySelector('.header__burger');

button.addEventListener('click', () => {
  header.classList.toggle('header__nav-nojs')
})
