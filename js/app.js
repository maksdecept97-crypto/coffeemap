/* ========== Инициализация приложения ========== */
ymaps.ready(init);

function init(){
  // Создаем карту
  map = new ymaps.Map("map", { 
    center: [59.93, 30.34], 
    zoom: 12, 
    controls: ['zoomControl', 'geolocationControl'] 
  });

  // Инициализируем приложение
  addCoffeePlaces();
  renderCoffeeList();
  initEventHandlers();
  
  // Корректируем позицию сайдбара
  adjustSidebarPosition();

  // Клик по карте: закрываем все балуны и скрываем сайдбар
  map.events.add('click', () => {
    closeAllBalloons();
    window.hideSidebar();
  });
}

/* ========== Обработчики событий ========== */
function initEventHandlers(){
  // Поиск
  const searchBox = document.querySelector('.search-box');
  if (searchBox) {
    searchBox.addEventListener('input', applyFilters);
  }

  // Фильтры по кнопкам
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      applyFilters();
    });
  });

  // Фильтр по метро
  const metroFilter = document.getElementById('metro-filter');
  if (metroFilter) {
    metroFilter.addEventListener('change', applyFilters);
  }

  // Кнопка геолокации
  const locationBtn = document.querySelector('.user-location-btn');
  if (locationBtn) {
    locationBtn.addEventListener('click', locateUser);
  }

  // Кнопка показа/скрытия сайдбара
  const sidebarBtn = document.querySelector('.show-sidebar-btn');
  if (sidebarBtn) {
    sidebarBtn.addEventListener('click', () => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar.classList.contains('show')) {
        window.hideSidebar();
      } else {
        window.showSidebar();
      }
    });
  }

  // Клик по overlay скрывает сайдбар
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', window.hideSidebar);
  }
}
