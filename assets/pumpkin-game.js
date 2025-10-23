// Вміст для /assets/pumpkin-game.js

jQuery(document).ready(function ($) {
  // --- НАЛАШТУВАННЯ ---
  const MAX_COUNT = 20; // Максимальна кількість гарбузів
  const SPAWN_CHANCE = 50; // Шанс появи (у %)
  const SPAWN_DELAY = 1500; // Час очікування (1.5 сек)
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
    if (current_count >= MAX_COUNT) return; // Не показувати, якщо гра пройдена

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
    // 1. Перевірка шансу
    if (Math.random() * 100 > SPAWN_CHANCE) {
      return;
    }

    const foundPumpkins = getFoundPumpkins();
    const current_count = foundPumpkins.length;

    // 2. Перевірка, чи гра не закінчена
    if (current_count >= MAX_COUNT) {
      return;
    }

    // 3. Генеруємо ID, який ще не знайдено
    let pumpkinId;
    do {
      pumpkinId = `pumpkin-${Math.floor(Math.random() * MAX_COUNT) + 1}`;
    } while (foundPumpkins.includes(pumpkinId));

    // 4. Створюємо HTML
    const $pumpkin = $(
      `<span class="collectible-pumpkin is-spawning" data-id="${pumpkinId}">🎃</span>`
    );

    // 5. Обираємо координати
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

    // 6. Додаємо на сторінку
    $container.append($pumpkin);
    setTimeout(() => $pumpkin.removeClass('is-spawning'), 100);
  }

  /**
   * Обробник кліків
   */
  $('body').on('click', '.collectible-pumpkin', function (e) {
    e.preventDefault();
    const $pumpkin = $(this);
    const pumpkinId = $pumpkin.data('id');

    if ($pumpkin.hasClass('found')) return;
    $pumpkin.addClass('found');

    // Зберігаємо прогрес у localStorage
    let foundPumpkins = getFoundPumpkins();
    if (!foundPumpkins.includes(pumpkinId)) {
      foundPumpkins.push(pumpkinId);
      localStorage.setItem(storageKey, JSON.stringify(foundPumpkins));
    }

    // Оновлюємо лічильник
    const new_count = foundPumpkins.length;
    $(`#pumpkin-counter-current`).text(new_count);

    // Спроба застосувати знижку
    applyShopifyDiscount(new_count);

    if (new_count >= MAX_COUNT) {
      alert(
        `🎃 ВІТАЄМО! 🎃\nВи зібрали всі ${MAX_COUNT} гарбузів! Ваша максимальна знижка (${MAX_COUNT}%) активована.`
      );
      $(`#${counterId}`).fadeOut();
    }
  });

  /**
   * Магія Shopify: застосування знижки через AJAX
   */
  function applyShopifyDiscount(count) {
    if (count === 0) return;
    const discountCode = `PUMPKIN${count}`;

    // Використовуємо API Shopify для застосування коду
    $.post('/discount/' + discountCode).always(function () {
      // Опціонально: оновити кошик, щоб показати знижку
      // Це може бути специфічно для вашої теми
      // fetch('/cart.js').then(res => res.json()).then(cart => console.log(cart));
    });
  }

  // --- ЗАПУСК ГРИ ---
  createPumpkinCounter();
  setTimeout(spawnPumpkin, SPAWN_DELAY);
});