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

document.addEventListener("DOMContentLoaded", function() {
  let isCartPage = document.querySelector('.template-cart') !== null;

  if (!isCartPage) {
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
        await applyDiscountToCartDrawer();
        await updateCartDrawer();
      }
    });
  } else {
    applyDiscountToCartDrawer(isCartPage);
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
      await applyDiscountToCartDrawer();
      await updateCartDrawer(index);
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
      await applyDiscountToCartDrawer();
      await updateCartDrawer(index);
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

// Discount Applying START
const stringToBoolean = str => str.toLowerCase() === 'true';

async function applyDiscountToCartDrawer (isCartPage) {
  const wrapper = document.querySelector('#PageContainer');

  const is_minimum_quantity_of_items = wrapper.getAttribute('data-buy_x_get_y_is_minimum_quantity_of_items');
  const is_minimum_purchase_amount = wrapper.getAttribute('data-buy_x_get_y_is_minimum_purchase_amount');
  const minimum_quantity_of_items = wrapper.getAttribute('data-buy_x_get_y_minimum_quantity_of_items');
  const minimum_purchase_amount = wrapper.getAttribute('data-buy_x_get_y_minimum_purchase_amount');
  const product_list = wrapper.getAttribute('data-buy_x_get_y_product_list');
  const product_gift_id = wrapper.getAttribute('data-buy_x_get_y_product_gift_id');
  const product_gift_variant_id = wrapper.getAttribute('data-buy_x_get_y_product_gift_variant_id');
  const product_gift_product_quantity = wrapper.getAttribute('data-buy_x_get_y_product_gift_product_quantity');
  const start_date = wrapper.getAttribute('data-buy_x_get_y_start_date');
  const end_date = wrapper.getAttribute('data-buy_x_get_y_end_date');

  const startDate = new Date(start_date).getTime();
  const endDate = end_date ? new Date(end_date).getTime() : Infinity;
  const currentDate = Date.now();

  const isNotExpired = currentDate >= startDate && currentDate <= endDate;

  if (isNotExpired) {
    function checkAndApplyDiscount() {
      fetch('/cart.js')
        .then(response => response.json())
        .then(cart => {
          const eligibleProducts = product_list;
          const freeProductId = product_gift_variant_id;

          if (stringToBoolean(is_minimum_quantity_of_items)) {
            let eligibleCount = 0;
            let isGiftInTheCart = false;

            cart.items.forEach(item => {
              if (eligibleProducts.includes(item.product_id.toString())) {
                eligibleCount += item.quantity;
              }

              // if (item.product_id.toString() == product_gift_id && item.discounts.length > 0) {
              if (item.product_id.toString() == product_gift_id) {
                isGiftInTheCart = true;
              }
            })

            // console.log(cart);

            // console.log(isGiftInTheCart);

            if (eligibleCount >= Number(minimum_quantity_of_items) && !isGiftInTheCart) {
              let formData = {
              'items': [{
                'id': freeProductId,
                'quantity': Number(product_gift_product_quantity)
                }]
              };

              fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
              })
              .then(response => {
                if (isCartPage) {
                  window.location.reload();
                }
                updateCartDrawer();
                return response.json();
              })
              .catch((error) => {
                console.error('Error:', error);
              });
            }
          }

          if (stringToBoolean(is_minimum_purchase_amount)) {
            let totalPrice = 0;
            let isGiftInTheCart = false;

            cart.items.forEach(item => {
              if (eligibleProducts.includes(item.product_id.toString())) {
                totalPrice += (item.price / 100) * item.quantity
              }
              // if (item.product_id.toString() == product_gift_id && item.discounts.length > 0) {
              if (item.product_id.toString() == product_gift_id) {
                isGiftInTheCart = true;
              }
            })

            if (totalPrice >= Number(minimum_purchase_amount) && !isGiftInTheCart) {
              let formData = {
              'items': [{
                'id': freeProductId,
                'quantity': Number(product_gift_product_quantity)
                }]
              };

              fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
              })
              .then(response => {
                if (isCartPage) {
                  window.location.reload();
                }
                updateCartDrawer();

                return response.json();
              })
              .catch((error) => {
                console.error('Error:', error);
              });
            }
          }
      });
    }

    checkAndApplyDiscount();
  }
}
// Discount Applying END