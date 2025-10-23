// Вміст для /assets/pumpkin-game.js (Версія 2.0)

jQuery(document).ready(function ($) {
  // --- НАЛАШТУВАННЯ ---
  const MAX_COUNT = 20;
  const SPAWN_CHANCE = 50; 
  const SPAWN_DELAY = 1500;
  // --- КІНЕЦЬ НАЛАШТУВАНЬ ---

  const counterId = 'pumpkin-counter';
  const storageKey = 'foundPumpkinsList';

  /**
   * Отримує список знайдених гарбузів з localStorage
   */
  function getFoundPumpkins() {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  }

  /**
   * Створює лічильник
   */
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

  /**
   * Створює гарбуз у випадковому місці
   */
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
   * [НОВА ФУНКЦІЯ]
   * Читає localStorage і застосовує потрібну знижку до кошика.
   */
  function updateDiscountBasedOnPumpkins() {
    const foundPumpkins = getFoundPumpkins();
    const count = foundPumpkins.length;
    
    // Якщо гарбузів 0, нічого не робимо
    if (count === 0) {
      return; 
    }
    
    const discountCode = `PUMPKIN${count}`;
    console.log(`[Pumpkin Game] Cart updated. Attempting to apply: ${discountCode}`);

    // Цей запит тепер спрацює, тому що ця функція
    // буде викликана ПІСЛЯ додавання товару в кошик.
    $.post('/discount/' + discountCode);
  }

  /**
   * Обробник кліків (ЗМІНЕНО)
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

    // [ВИДАЛЕНО]
    // applyShopifyDiscount(new_count); // Більше не викликаємо це тут

    // [НОВЕ]
    // Ми викликаємо нову функцію. Вона спробує застосувати
    // знижку негайно, *якщо* в кошику ВЖЕ є товари.
    updateDiscountBasedOnPumpkins(); 

    if (new_count >= MAX_COUNT) {
      alert(
        `🎃 ВІТАЄМО! 🎃\nВи зібрали всі ${MAX_COUNT} гарбузів! Ваша максимальна знижка (${MAX_COUNT}%) активована.`
      );
      $(`#${counterId}`).fadeOut();
    }
  });

  // --- ЗАПУСК ГРИ ---
  createPumpkinCounter();
  setTimeout(spawnPumpkin, SPAWN_DELAY);
  
  // [НОВИЙ ОБРОБНИК]
  // Це "слухач", який відстежує всі AJAX-запити на сайті.
  // Якщо він бачить, що тема оновлює кошик (додає товар),
  // він запускає нашу функцію знижки.
  $(document).ajaxComplete(function(event, xhr, settings) {
    // Шукаємо запити, які оновлюють кошик
    if (settings.url.includes('/cart/add') || settings.url.includes('/cart/change')) {
      console.log('[Pumpkin Game] Detected cart update. Running discount check.');
      // Чекаємо 500мс, щоб Shopify встиг обробити кошик
      setTimeout(updateDiscountBasedOnPumpkins, 500);
    }
  });

  // [НОВЕ]
  // Також запускаємо 1 раз при завантаженні сторінки.
  // Це застосує знижку, якщо користувач оновить сторінку
  // або повернеться на сайт пізніше, вже маючи товари в кошику.
  updateDiscountBasedOnPumpkins();
});