function openCartDrawer() {
  document.getElementById('sideCart').classList.remove('drawer--right-hidden');
  document.body.classList.add('js-drawer-open-right');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  document.getElementById('sideCart').classList.add('drawer--right-hidden');
  document.body.classList.remove('js-drawer-open-right');
  document.body.style.overflow = '';
}

async function updateCartDrawer(index = null) {
  if (index) {
    document
      .querySelectorAll('.cart-product-loader')
      [+index - 1].classList.remove('hidden');
  }

  const currentLanguage = document.documentElement.lang;

  const res = await fetch(`/${currentLanguage}/cart/?section_id=right-drawer`);
  const text = await res.text();

  const html = document.createElement('div');
  html.innerHTML = text;

  const newBox = html.querySelector('#sideCart').innerHTML;
  const oldBox = document.querySelector('#sideCart');

  oldBox.innerHTML = newBox;

  addCartDrawerListeners();
}

async function updateCartAJAX(key, qty = 0) {
  const res = await fetch('/cart/update.js', {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ updates: { [key]: qty } })
  });
}

window.addEventListener('submit', async e => {
  e.preventDefault();

  if (e.target.getAttribute('action').includes('/cart/add')) {
    const form = e.target;

    // Open cart drawer
    openCartDrawer();

    await fetch('/cart/add', {
      method: 'post',
      body: new FormData(form)
    });

    // // Update Cart
    await updateCartDrawer();
  }
});

function addCartDrawerListeners() {
  // Update quantities
  document.querySelectorAll('.ajaxcart__qty-adjust').forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault();

      const closestButtonParent = button.closest('.ajaxcart__product');
      // Get line item key
      const key = closestButtonParent.getAttribute('data-line-item-key');

      // Get new quantity
      const quantity = closestButtonParent.querySelector(
        'input.ajaxcart__qty-num'
      ).value;

      let newQuantity;

      switch (button.dataset.action) {
        case '+':
          newQuantity = +quantity + 1;
          break;
        case '-':
          newQuantity = +quantity - 1;
          break;
      }

      // AJAX update
      await updateCartAJAX(key, newQuantity);

      // Update cart
      const index = closestButtonParent.dataset.index;
      updateCartDrawer(index);
    });
  });

  // Delete item
  document.querySelectorAll('.ajaxcart__qty-remove').forEach(item => {
    item.addEventListener('click', async e => {
      e.preventDefault();

      const itemClosestParent = item.closest('.ajaxcart__product');

      // Get line item key
      const key = itemClosestParent.getAttribute('data-line-item-key');

      // AJAX update
      await updateCartAJAX(key);

      // Update cart
      const index = itemClosestParent.dataset.index;
      updateCartDrawer(index);
    });
  });

  // Redirect to checkout Page
  const checkoutBtn = document.querySelector('.js-right_drawer_cart_checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function(event) {
      event.preventDefault();
      window.location.href = '/checkout';
    });
  }

  document.querySelector('.js-drawer-close .icon-fallback-text')
  .addEventListener('click', () => {
    closeCartDrawer();
  });

  document.querySelector('#DrawerOverlay').addEventListener('click', () => {
    closeCartDrawer();
  });
}

addCartDrawerListeners();

// Open cart drawer
document.querySelectorAll('.js-drawer-open-right-link').forEach(item => {
  item.addEventListener('click', () => {
    openCartDrawer();
  });
})