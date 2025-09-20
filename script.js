// shop.js — resilient версия с отладкой
document.addEventListener('DOMContentLoaded', () => {
  // ====== Данные товаров (вставь свой полный список) ======
  const productsData = [
    { name: "A Short Hike Plush", category: "A Short Hike", price: 32, image: "./plushes/A Short Hikemain.png" },
    { name: "Phoenix Wright Plush", category: "Ace Attorney", price: 28, image: "./plushes/ace attornei 1main.png" },
    { name: "Miles Edgeworth Plush", category: "Ace Attorney", price: 30, image: "./plushes/ace attornei 2main.png" },
    { name: "Astro Kratos Bot Plush", category: "Astro Bot", price: 39, image: "./plushes/ASTROBOT main.png" },
    { name: "Astro Plush", category: "Astro Bot", price: 36, image: "./plushes/astro bot main.png" },
    { name: "Baba Is Plush", category: "Baba Is You", price: 26, image: "./plushes/Baba is you main.png" },
    { name: "Banjo-Kazooie Plush Set", category: "Banjo-Kazooie", price: 39, image: "./plushes/Banjo kazooie 1 main.png" },
    { name: "Mumbo-Jumbo Plush", category: "Banjo-Kazooie", price: 22, image: "./plushes/banjo kazooie 2 main.png" },
    { name: "Plain Doll Plush", category: "BloodBorne", price: 36, image: "./plushes/BloodBorne main.png" },
    { name: "Brotato Plush", category: "Brotato", price: 24, image: "./plushes/brotato main.png" },
    { name: "Strabby Plush", category: "Bugsnax", price: 32, image: "./plushes/Bugsnax 1 main.png" },
    { name: "Bunger Plush", category: "Bugsnax", price: 39, image: "./plushes/Bugsnax 2 main.png" },
    { name: "Filto Fiddlepie Plush", category: "Bugsnax", price: 36, image: "./plushes/Bugsnax 3 main.png" },
    { name: "Cinnasnail Plush", category: "Bugsnax", price: 36, image: "./plushes/Bugsnax 4 main.png" },
    { name: "Kweeble Plush", category: "Bugsnax", price: 36, image: "./plushes/Bugsbax 5 main.png" },
    { name: "Madeline and Badeline Plush Set", category: "Celeste", price: 39, image: "./plushes/Celeste main.png" },
    { name: "Conker Talking Plush", category: "Conker", price: 36, image: "./plushes/Conker main.png" },
    { name: "Siegmeyer Plush", category: "Dark Souls", price: 36, image: "./plushes/Dark Souls main.png" },

   
  ];

  // ====== Селекторы и элементы ======
  const productsContainer = document.querySelector(".products");
  const sortSelect = document.getElementById("sort");
  const checkboxes = document.querySelectorAll(".sidebar input[type=checkbox]");
  const pageInfo = document.querySelector(".page-info");
  // попытки найти контейнер пагинации (несколько уровней fallback'а)
  let paginationContainer = document.querySelector(".pagination-wrapper .pagination") || document.querySelector(".pagination");
  let paginationWrapperParent = document.querySelector(".pagination-wrapper");
  const paginationInfo = document.querySelector(".pagination-info");

  console.log("shop.js: elements initial:", {
    productsContainerExists: !!productsContainer,
    sortSelectExists: !!sortSelect,
    checkboxesCount: checkboxes.length,
    paginationContainerFound: !!paginationContainer,
    paginationWrapperFound: !!paginationWrapperParent,
    paginationInfoExists: !!paginationInfo,
  });

  // Если .pagination отсутствует — создаём его (помещаем после productsContainer если возможно)
  if (!paginationContainer) {
    if (!paginationWrapperParent && productsContainer) {
      paginationWrapperParent = document.createElement('div');
      paginationWrapperParent.className = 'pagination-wrapper';
      const p = document.createElement('p');
      p.className = 'pagination-info';
      p.textContent = '';
      paginationWrapperParent.appendChild(p);
      paginationContainer = document.createElement('div');
      paginationContainer.className = 'pagination';
      paginationWrapperParent.appendChild(paginationContainer);
      productsContainer.insertAdjacentElement('afterend', paginationWrapperParent);
      console.log("shop.js: создал pagination-wrapper и pagination после .products");
    } else if (paginationWrapperParent && !paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.className = 'pagination';
      paginationWrapperParent.appendChild(paginationContainer);
      console.log("shop.js: создал .pagination внутри существующего .pagination-wrapper");
    } else {
      // последний вариант: создаём просто <div class="pagination"> в конце body
      paginationContainer = document.createElement('div');
      paginationContainer.className = 'pagination';
      document.body.appendChild(paginationContainer);
      console.warn("shop.js: создал .pagination в конце body (fallback)");
    }
  }

  // Обновляем reference на paginationInfo и pageInfo (если они появились при создании)
  const paginationInfoRef = document.querySelector(".pagination-info");
  const pageInfoRef = document.querySelector(".page-info");

  let currentPage = 1;
  const itemsPerPage = 18;
  let filteredProducts = [...productsData];

  // helper: убедиться что блок видим (если CSS скрывает его)
  function ensureVisible(elem) {
    if (!elem) return;
    const comp = window.getComputedStyle(elem);
    if (comp.display === 'none') {
      elem.style.display = 'block';
      console.log("shop.js: сделал visible для", elem);
    }
  }

  // ====== Рендер товаров ======
  function renderProducts() {
    if (!productsContainer) {
      console.error("shop.js: .products контейнер не найден — прерываю renderProducts");
      return;
    }

    console.log("shop.js: renderProducts — filtered length:", filteredProducts.length, "currentPage:", currentPage);

    productsContainer.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productsToShow = filteredProducts.slice(start, end);

    // если товаров нет — можно отрисовать сообщение
    if (productsToShow.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'no-products';
      empty.textContent = "No products found.";
      productsContainer.appendChild(empty);
    } else {
      productsToShow.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML = `
          <img src="${p.image}" alt="${p.name}">
          <div class="product-name">${p.name}</div>
          <div class="product-category">${p.category}</div>
          <div class="product-price">$${p.price}</div>
        `;
        productsContainer.appendChild(div);
      });
    }

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    if (pageInfoRef) pageInfoRef.textContent = `Page ${currentPage} of ${totalPages}`;
    if (paginationInfoRef) paginationInfoRef.textContent = `Showing ${Math.min(filteredProducts.length, start + 1)}–${Math.min(end, filteredProducts.length)} of ${filteredProducts.length}`;

    renderPagination(totalPages);
  }

  // ====== Сортировка ======
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const value = sortSelect.value;
      if (value === "price-asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (value === "price-desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
      } else if (value === "ABC") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      } else if (value === "CBA") {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      }
      currentPage = 1;
      renderProducts();
    });
  } else {
    console.warn("shop.js: select#sort не найден — сортировка отключена");
  }

  // ====== Фильтрация ======
  if (checkboxes && checkboxes.length > 0) {
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const selected = Array.from(checkboxes)
          .filter(x => x.checked)
          .map(x => x.parentElement.textContent.trim().split("(")[0].trim());

        if (selected.length > 0) {
          filteredProducts = productsData.filter(p => selected.includes(p.category));
        } else {
          filteredProducts = [...productsData];
        }
        currentPage = 1;
        renderProducts();
      });
    });
  } else {
    console.warn("shop.js: чекбоксов для фильтрации не найдено");
  }

  // ====== Пагинация (всегда отображаем) ======
  function renderPagination(totalPages) {
    console.log("shop.js: renderPagination totalPages=", totalPages, "paginationContainer:", !!paginationContainer);
    if (!paginationContainer) {
      console.error("shop.js: paginationContainer не найден, не рисую пагинацию");
      return;
    }

    // убедимся, что wrapper видим
    if (paginationWrapperParent) ensureVisible(paginationWrapperParent);
    ensureVisible(paginationContainer);

    paginationContainer.innerHTML = "";

    // style fallback чтобы кнопки были видимы даже при странном CSS
    paginationContainer.style.display = paginationContainer.style.display || 'inline-flex';
    paginationContainer.style.gap = paginationContainer.style.gap || '8px';
    paginationContainer.style.flexWrap = 'wrap';
    paginationContainer.style.alignItems = 'center';

    // Prev
    const prev = document.createElement("button");
    prev.textContent = "Previous";
    prev.disabled = currentPage === 1;
    prev.className = 'js-prev';
    prev.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderProducts();
      }
    });
    paginationContainer.appendChild(prev);

    // Номера страниц (если много страниц — можно добавить логику с точками, но пока простая)
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = 'js-page';
      if (i === currentPage) btn.classList.add('active');
      btn.addEventListener("click", () => {
        currentPage = i;
        renderProducts();
      });
      paginationContainer.appendChild(btn);
    }

    // Next
    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = currentPage === totalPages;
    next.className = 'js-next';
    next.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
      }
    });
    paginationContainer.appendChild(next);
  }

  // ====== Первый рендер ======
  renderProducts();

  // ====== Небольшие подсказки в консоль для отладки ======
  console.log("shop.js ready. Debug tips:");
  console.log(" - Проверить существование элементов: document.querySelector('.products'), document.querySelector('.pagination-wrapper .pagination')");
  console.log(" - Если пагинация всё ещё не видна — откройте DevTools (F12) и посмотрите ошибки/лог из этой страницы.");
});
