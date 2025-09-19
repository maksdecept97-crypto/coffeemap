/* ========== Инициализация приложения ========== */
ymaps.ready(init);

function init(){
  map = new ymaps.Map("map", { center:[59.93,30.34], zoom:12, controls:['zoomControl','geolocationControl'] });

  addCoffeePlaces();      // добавить метки
  renderCoffeeList();     // сформировать список в сайдбаре
  initEventHandlers();    // зарегистрировать обработчики
  locateUser();           // попытаться определить пользователя

  // корректируем позицию сайдбара под фильтрами (динамически)
  adjustSidebarPosition();
  window.addEventListener('load', adjustSidebarPosition);
  window.addEventListener('resize', adjustSidebarPosition);

  // клик по карте: закрываем все балуны и скрываем сайдбар
  map.events.add('click', ()=>{ closeAllBalloons(); hideSidebar(); });
}

/* ========== Обработчики событий ========== */
function initEventHandlers(){
  // Поиск
  document.querySelector('.search-box').addEventListener('input', applyFilters);

  // Фильтры по кнопкам
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click', function(){
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      applyFilters();
    });
  });

  // metro select
  document.getElementById('metro-filter').addEventListener('change', applyFilters);

  // кнопка геолокации
  document.querySelector('.user-location-btn').addEventListener('click', locateUser);

  // кнопка показа/скрытия сайдбара (в филтерной строке)
  document.querySelector('.show-sidebar-btn').addEventListener('click', ()=>{
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('show');
    // выставляем позицию перед показом (на случай смены размера)
    adjustSidebarPosition();
    overlay.style.display = sidebar.classList.contains('show') ? 'block' : 'none';
  });

  // клик по overlay скрывает сайдбар
  document.querySelector('.sidebar-overlay').addEventListener('click', hideSidebar);
}

/* Пересчитываем позицию при загрузке/resize/rotate */
window.addEventListener('load', adjustSidebarPosition);
window.addEventListener('resize', adjustSidebarPosition);
window.addEventListener('orientationchange', ()=>{ setTimeout(adjustSidebarPosition,300); });
