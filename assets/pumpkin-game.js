// Вміст для /assets/pumpkin-game.js (Версія 3.5 - Ін'єкція коду)

jQuery(document).ready(function ($) {
  // --- НАЛАШТУВАННЯ ---
  const MAX_COUNT = 20;
  const SPAWN_CHANCE = 50; 
  const SPAWN_DELAY = 1500;
  // --- КІНЕЦЬ НАЛАШТУВАНЬ ---

  const counterId = 'pumpkin-counter';
  const storageKey = 'foundPumpkinsList';
  console.log('[Pumpkin Game] Script v3.5 Loaded (Injector).');

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
   * [НОВИЙ ГОЛОВНИЙ ОБРОБНИК v3.5]
   * Ми слухаємо кліки на кнопці "Оформити замовлення"
   * (стандартний селектор Shopify - [name="checkout"]).
   */
  const checkoutButtonSelector = '[name="checkout"]';
  
  $('body').on('click', checkoutButtonSelector, function(e) {
    // Не чіпаємо фінальну сторінку оплати
    if (window.location.href.includes('checkout.shopify.com')) {
      return; 
    }

    const foundPumpkins = getFoundPumpkins();
    const count = foundPumpkins.length;

    // Якщо гарбузів 0, нічого не робимо, відпускаємо клік
    if (count === 0) {
      console.log('[Pumpkin Game] 0 pumpkins, proceeding normally.');
      return; 
    }

    // Якщо гарбузи є, зупиняємо клік!
    e.preventDefault();
    console.log('[Pumpkin Game] Checkout button clicked. Intercepting to inject code.');

    const $button = $(this);
    const $form = $button.closest('form');

    // Якщо не можемо знайти форму, відпускаємо
    if (!$form.length) {
      console.error('[Pumpkin Game] Could not find parent <form>. Letting click proceed.');
      return true; // Відпускаємо клік
    }
    
    const discountCode = `PUMPKIN${count}`;
    console.log(`[Pumpkin Game] Injecting discount code: ${discountCode}`);

    // Знаходимо (або створюємо) приховане поле для знижки
    let $discountInput = $form.find('input[name="discount"]');
    if (!$discountInput.length) {
      $discountInput = $('<input type="hidden" name="discount">').appendTo($form);
    }

    // Встановлюємо наш код
    $discountInput.val(discountCode);

    // Блокуємо кнопку, щоб уникнути подвійних кліків
    $button.text('Застосовуємо знижку...');
    $button.prop('disabled', true);

    // Відправляємо форму
    $form.submit();
  });
  
  // --- ЗАПУСК ГРИ ---
  createPumpkinCounter();
  setTimeout(spawnPumpkin, SPAWN_DELAY);
});