// Вміст для /assets/pumpkin-game.js (Версія 3.1 - Фінальна)

jQuery(document).ready(function ($) {
  // --- НАЛАШТУВАННЯ ---
  const MAX_COUNT = 20;
  const SPAWN_CHANCE = 50; 
  const SPAWN_DELAY = 1500;
  // --- КІНЕЦЬ НАЛАШТУВАНЬ ---

  const counterId = 'pumpkin-counter';
  const storageKey = 'foundPumpkinsList';
  console.log('[Pumpkin Game] Script v3.1 Loaded.');

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
    const $container = $('body');
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
   * Застосування знижки
   */
  function updateDiscountBasedOnPumpkins() {
    const foundPumpkins = getFoundPumpkins();
    const count = foundPumpkins.length;
    
    if (count === 0) {
      console.log('[Pumpkin Game] No pumpkins found, skipping discount.');
      return; 
    }
    
    const discountCode = `PUMPKIN${count}`;
    console.log(`[Pumpkin Game] Attempting to apply: ${discountCode}`);

    // Ми використовуємо jQuery.post, оскільки він надійний
    $.post('/discount/' + discountCode)
      .done(function() {
        console.log(`[Pumpkin Game] Successfully applied ${discountCode}`);
        // Оновлюємо кошик, щоб показати знижку
        // Багато тем потребують цього
        $.get('/cart.js'); 
      })
      .fail(function() {
        console.error(`[Pumpkin Game] Failed to apply ${discountCode}. Maybe cart is empty?`);
      });
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

    const new_count = foundPumpkins.length;
    $(`#pumpkin-counter-current`).text(new_count);
    console.log(`[Pumpkin Game] Found pumpkin! Total: ${new_count}`);

    updateDiscountBasedOnPumpkins(); 

    if (new_count >= MAX_COUNT) {
      alert(
        `🎃 ВІТАЄМО! 🎃\nВи зібрали всі ${MAX_COUNT} гарбузів! Ваша максимальна знижка (${MAX_COUNT}%) активована.`
      );
      $(`#${counterId}`).fadeOut();
    }
  });

  /**
   * [НОВИЙ "ШПИГУН" v3.1]
   * Цей код слухає всі кліки на сторінці. 
   * Якщо ви клікнули на кнопку "Додати в кошик", він чекає 2 секунди
   * і запускає нашу функцію знижки. Це надійно.
   */
  $('body').on('click', 'form[action="/cart/add"] [type="submit"], button[name="add"], .add-to-cart-button', function() {
    console.log('[Pumpkin Game] "Add to Cart" button clicked. Waiting 2 seconds to apply discount...');
    
    // Чекаємо 2 секунди, щоб Shopify 100% встиг обробити товар
    setTimeout(function() {
      updateDiscountBasedOnPumpkins();
    }, 2000); 
  });

  // --- ЗАПУСК ГРИ ---
  createPumpkinCounter();
  setTimeout(spawnPumpkin, SPAWN_DELAY);
  
  // Запускаємо 1 раз при завантаженні
  updateDiscountBasedOnPumpkins();
});