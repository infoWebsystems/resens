function getCurrentLanguage() {
  return document.documentElement.getAttribute('lang')
}

let currentLanguage = getCurrentLanguage() ? getCurrentLanguage() : 'uk';

if (currentLanguage === 'uk') {
  document.querySelector('.language-switcher-header .disclosure').insertAdjacentHTML('afterbegin', '<a href="#" aria-current="true" hreflang="en" lang="en" data-value="en">English <span class="divider">|</span> EN</a>');
} else if (currentLanguage === 'en') {
  document.querySelector('.language-switcher-header .disclosure').insertAdjacentHTML('afterbegin', '<a href="#" aria-current="true" hreflang="uk" lang="uk" data-value="uk">Ukraine <span class="divider">|</span> UK</a>');
}

document.querySelector('.language-switcher-header .disclosure .disclosure__button').style.display = 'none';