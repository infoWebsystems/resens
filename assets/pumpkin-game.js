// Вміст для /assets/pumpkin-game.js (Версія 3.0)

jQuery(document).ready(function ($) {
  // --- НАЛАШТУВАННЯ ---
  const MAX_COUNT = 20;
  const SPAWN_CHANCE = 50; // 50% шанс
  const SPAWN_DELAY = 1500; // 1.5 сек
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
   * [НОВА ЛОГІКА]
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

    // Використовуємо $.post (jQuery) для застосування
    $.post('/discount/' + discountCode);
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

    let foundPumpkins = getFoundPumpkins();
    if (!foundPumpkins.includes(pumpkinId)) {
      foundPumpkins.push(pumpkinId);
      localStorage.setItem(storageKey, JSON.stringify(foundPumpkins));
    }

    const new_count = foundPumpkins.length;
    $(`#pumpkin-counter-current`).text(new_count);

    // Спробуємо застосувати знижку негайно,
    // на випадок, якщо товари в кошику ВЖЕ є.
    updateDiscountBasedOnPumpkins(); 

    if (new_count >= MAX_COUNT) {
      alert(
        `🎃 ВІТАЄМО! 🎃\nВи зібрали всі ${MAX_COUNT} гарбузів! Ваша максимальна знижка (${MAX_COUNT}%) активована.`
      );
      $(`#${counterId}`).fadeOut();
    }
  });

  /**
   * [НОВИЙ "ШПИГУН" ЗА КОШИКОМ]
   * Цей код замінює глобальну функцію `fetch` на нашу власну,
   * щоб "підслухати", коли тема оновить кошик.
   */
  function patchFetch() {
      const originalFetch = window.fetch; // Зберігаємо оригінал
      
      window.fetch = function() {
          const [url, options] = arguments; // Отримуємо URL
          
          // Викликаємо оригінальний fetch
          const fetchPromise = originalFetch.apply(this, arguments);

          // Перевіряємо, чи це операція з кошиком
          if (typeof url === 'string' && (url.includes('/cart/add') || url.includes('/cart/change') || url.includes('/cart/update'))) {
              
              console.log('[Pumpkin Game] Detected "fetch" cart update. Attaching discount logic.');
              
              // Коли запит виконано, запускаємо нашу логіку
              fetchPromise.then(() => {
                  // Чекаємо 500мс, щоб Shopify встиг оновити кошик
                  setTimeout(updateDiscountBasedOnPumpkins, 500); 
              });
          }
          
          return fetchPromise; // Повертаємо оригінальний запит
      };
  }

  // --- ЗАПУСК ГРИ ---
  createPumpkinCounter();
  setTimeout(spawnPumpkin, SPAWN_DELAY);
  
  // Активуємо нашого "шпигуна"
  patchFetch(); 

  // Запускаємо 1 раз при завантаженні сторінки
  // (Це спрацює, якщо користувач оновить сторінку З товарами в кошику)
  updateDiscountBasedOnPumpkins();
});