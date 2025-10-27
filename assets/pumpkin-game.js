// Вміст для /assets/pumpkin-game.js (Версія 3.9 - Правильний тригер)

jQuery(document).ready(function ($) {
  // --- НАЛАШТУВАННЯ ---
  const MAX_COUNT = 15;
  const SPAWN_CHANCE = 50; 
  const SPAWN_DELAY = 1500;
  // --- КІНЕЦЬ НАЛАШТУВАНЬ ---

  // ####### ВАШ УНІКАЛЬНИЙ СЕЛЕКТОР ВЖЕ ТУТ #######
  const YOUR_CART_BUTTON_SELECTOR = '.js-drawer-open-right-link-custom'; 
  // ##########################################

  const counterId = 'pumpkin-counter';
  const storageKey = 'foundPumpkinsList';
  console.log('[Pumpkin Game] Script v3.9 Loaded (Correct Trigger).');

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
   * [ОНОВЛЕНО v3.9] 
   * Застосовує знижку через офіційний endpoint /cart/update.js
   * Ця функція тепер викликається ПРИ КЛІКУ НА ІКОНКУ КОШИКА.
   */
  function updateDiscountBasedOnPumpkins() {
    const foundPumpkins = getFoundPumpkins();
    const count = foundPumpkins.length;
    
    if (count === 0) {
      console.log('[Pumpkin Game] 0 pumpkins, skipping discount.');
      return;
    }
    
    const discountCode = `PUMPKIN${count}`;
    console.log(`[Pumpkin Game] Applying discount via /cart/update.js: ${discountCode}`);

    // Відправляємо надійний AJAX-запит
    $.post('/cart/update.js', { discount: discountCode })
      .done(function() {
        console.log(`[Pumpkin Game] Successfully applied ${discountCode} via AJAX.`);
        // Після успішного застосування, ми перезавантажуємо кошик
        // (більшість тем роблять це автоматично, але ми допоможемо)
        
        // Ми НЕ оновлюємо сторінку, а просто оновлюємо дані кошика
        // Це змусить висувний кошик показати знижку
        $.get('/cart.js'); 
      })
      .fail(function() {
        console.error(`[Pumpkin Game] Failed to apply ${discountCode}.`);
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
    const new_count = getFoundPumpkins().length;
    $(`#pumpkin-counter-current`).text(new_count);
    console.log(`[Pumpkin Game] Found pumpkin! Total: ${new_count}`);

    if (new_count >= MAX_COUNT) {
      alert(
        `🎃 ВІТАЄMO! 🎃\nВи зібрали всі ${MAX_COUNT} гарбузів! Ваша максимальна знижка (${MAX_COUNT}%) активована.`
      );
      $(`#${counterId}`).fadeOut();
    }
  });

  /**
   * [НОВИЙ ГОЛОВНИЙ ОБРОБНИК v3.9]
   * Ми слухаємо кліки на іконці кошика в шапці сайту.
   */
  const cartSelectors = `a[href="/cart"], ${YOUR_CART_BUTTON_SELECTOR}`;
  
  $('body').on('click', cartSelectors, function() {
    console.log(`[Pumpkin Game] Cart icon clicked. Applying discount NOW.`);
    
    // Ми НЕ чекаємо. Ми застосовуємо знижку негайно,
    // поки висувний кошик завантажується.
    updateDiscountBasedOnPumpkins();
    
    // Ми не зупиняємо клік (e.preventDefault()), 
    // ми дозволяємо кошику відкритися як зазвичай.
  });
  
  // --- ЗАПУСК ГРИ ---
  createPumpkinCounter();
  setTimeout(spawnPumpkin, SPAWN_DELAY);
});