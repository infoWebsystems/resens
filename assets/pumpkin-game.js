// Вміст для /assets/pumpkin-game.js (Версія 3.4 - Перехоплювач)

jQuery(document).ready(function ($) {
  // --- НАЛАШТУВАННЯ ---
  const MAX_COUNT = 20;
  const SPAWN_CHANCE = 50; 
  const SPAWN_DELAY = 1500;
  // --- КІНЕЦЬ НАЛАШТУВАНЬ ---

  const counterId = 'pumpkin-counter';
  const storageKey = 'foundPumpkinsList';
  console.log('[Pumpkin Game] Script v3.4 Loaded.');

  function getFoundPumpkins() {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  }

  function createPumpkinCounter() {
    const current_count = getFoundPumpkins().length;
    if (current_count >= MAX_COUNT) return;
    const counterHTML = `
      <div id="${counterId}">
        🎃 <span id="pumpkin-counter-current">${current_count}</span> / ${MAX_COUNT}
      </div>
    `;
    $('body').append(counterHTML);
  }

  function spawnPumpkin() {
    if (Math.random() * 100 > SPAWN_CHANCE) return;
    const foundPumpkins = getFoundPumpkins();
    const current_count = foundPumpkins.length;
    if (current_count >= MAX_COUNT) return;

    let pumpkinId;
    do {
      pumpkinId = `pumpkin-${Math.floor(Math.random() * MAX_COUNT) + 1}`;
    } while (foundPumpkins.includes(pumpkinId));

    const $pumpkin = $(
      `<span class="collectible-pumpkin is-spawning" data-id="${pumpkinId}">🎃</span>`
    );
    $container = $('body');
    const padding = 50;
    const randX =
      Math.floor(Math.random() * ($container.width() - padding * 2)) +
      padding;
    const viewHeight = $(window).height() + $(window).scrollTop();
    const randY =
      Math.floor(Math.random() * (viewHeight - padding * 2)) + padding;
    $pumpkin.css({
      top: `${randY}px`,
      left: `${randX}px`,
    });
    $container.append($pumpkin);
    setTimeout(() => $pumpkin.removeClass('is-spawning'), 100);
  }

  /**
   * [ОНОВЛЕНО] Застосовує знижку і повертає "Проміс",
   * щоб ми знали, коли він закінчить.
   */
  function updateDiscountBasedOnPumpkins() {
    // Ця функція повертає jQuery Promise
    return $.Deferred(function(def) {
      const foundPumpkins = getFoundPumpkins();
      const count = foundPumpkins.length;
      
      if (count === 0) {
        console.log('[Pumpkin Game] 0 pumpkins, skipping discount.');
        def.resolve(); // 0 гарбузів, просто продовжуємо
        return;
      }
      
      const discountCode = `PUMPKIN${count}`;
      console.log(`[Pumpkin Game] Applying discount: ${discountCode}`);

      $.post('/discount/' + discountCode)
        .done(function() {
          console.log(`[Pumpkin Game] Successfully applied ${discountCode}`);
          def.resolve(); // Знижка застосована, продовжуємо
        })
        .fail(function() {
          console.error(`[Pumpkin Game] Failed to apply ${discountCode}.`);
          def.resolve(); // Помилка, але все одно продовжуємо (щоб користувач міг оплатити)
        });
    }).promise();
  }

  /**
   * Обробник кліків по гарбузу
   */
  $('body').on('click', '.collectible-pumpkin', function (e) {
    e.preventDefault();
    const $pumpkin = $(this);
    const pumpkinId = $pumpkin.data('id');
    if ($pumpkin.hasClass('found')) return;
    $pumpkin.addClass('found');

    let foundPumpkins = getFoundPumpkins();
    if (!foundPumpkins.includes(pumpkinId)) {
      foundPumpkins.push(pumpkinId);
      localStorage.setItem(storageKey, JSON.stringify(foundPumpkins));
    }
    const new_count = getFoundPumpkins().length;
    $(`#pumpkin-counter-current`).text(new_count);
    console.log(`[Pumpkin Game] Found pumpkin! Total: ${new_count}`);

    if (new_count >= MAX_COUNT) {
      alert(
        `🎃 ВІТАЄМО! 🎃\nВи зібрали всі ${MAX_COUNT} гарбузів! Ваша максимальна знижка (${MAX_COUNT}%) активована.`
      );
      $(`#${counterId}`).fadeOut();
    }
  });

  /**
   * [НОВИЙ ГОЛОВНИЙ ОБРОБНИК v3.4]
   * Ми слухаємо кліки на кнопці "Оформити замовлення"
   * (стандартний селектор Shopify - [name="checkout"]).
   */
  const checkoutButtonSelector = '[name="checkout"]';
  
  $('body').on('click', checkoutButtonSelector, function(e) {
    // Перевіряємо, чи це *не* сторінка checkout.shopify.com
    if (window.location.href.includes('checkout.shopify.com')) {
      return; // Не чіпаємо фінальну сторінку оплати
    }

    console.log('[Pumpkin Game] Checkout button clicked. Intercepting...');
    
    // 1. Зупиняємо перехід
    e.preventDefault();
    
    const $button = $(this);
    const originalButtonText = $button.text();
    
    // 2. Блокуємо кнопку на час запиту
    $button.text('Застосовуємо знижку...');
    $button.prop('disabled', true);

    // 3. Запускаємо функцію знижки і чекаємо, поки вона закінчиться
    updateDiscountBasedOnPumpkins().always(function() {
      console.log('[Pumpkin Game] Discount logic finished. Proceeding to checkout.');
      
      // 4. Повертаємо кнопку і відправляємо форму
      $button.text(originalButtonText);
      $button.prop('disabled', false);
      
      const $form = $button.closest('form');
      if ($form.length) {
        $form.submit(); // Відправляємо користувача на оплату
      } else {
        // Якщо раптом не знайшли форму, просто йдемо на checkout
        window.location.href = '/checkout';
      }
    });
  });
  
  // --- ЗАПУСК ГРИ ---
  createPumpkinCounter();
  setTimeout(spawnPumpkin, SPAWN_DELAY);
});