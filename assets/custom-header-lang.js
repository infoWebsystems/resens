function getCurrentLanguage() {
  // let url = window.location.href;

  // let match = url.match(/\/([a-z]{2})(?:\/|$)/);

  // return match ? match[1] : null;

  return document.documentElement.getAttribute('lang');
}

let currentLanguage = getCurrentLanguage() ? getCurrentLanguage() : 'uk';


if (currentLanguage === 'uk') {
  document.querySelector('.language-switcher-header .disclosure').insertAdjacentHTML('afterbegin', '<a href="#" aria-current="true" hreflang="en" lang="en" data-value="en">English <span class="divider">|</span> EN</a>');
} else if (currentLanguage === 'en') {
  document.querySelector('.language-switcher-header .disclosure').insertAdjacentHTML('afterbegin', '<a href="#" aria-current="true" hreflang="uk" lang="uk" data-value="uk">Ukraine <span class="divider">|</span> UK</a>');
}

document.querySelector('.language-switcher-header .disclosure .disclosure__button').style.display = 'none';