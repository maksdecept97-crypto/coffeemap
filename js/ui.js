/* ========== Функции для работы с UI ========== */

/* ========== Рендер списка в сайдбаре ========== */
function renderCoffeeList(){
  const list = document.querySelector('.coffee-list');
  list.innerHTML = '';
  
  coffeeData.forEach(coffee => {
    const li = document.createElement('li');
    li.className = 'coffee-item';
    li.dataset.id = coffee.id;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'coffee-name';
    nameDiv.textContent = coffee.name;
    
    const addressDiv = document.createElement('div');
    addressDiv.className = 'coffee-address';
    addressDiv.textContent = coffee.address;
    
    li.appendChild(nameDiv);
    li.appendChild(addressDiv);
    
    li.addEventListener('click', () => {
      const coffeePlace = coffeePlaces.find(cp => cp.id === coffee.id);
      if (coffeePlace) {
        map.setCenter(coffeePlace.placemark.geometry.getCoordinates(), 16);
        coffeePlace.placemark.balloon.open();
        window.highlightCoffeeItem(coffee.id);
        window.hideSidebar();
      }
    });
    
    list.appendChild(li);
  });
}

/* ========== Подсветка выбранной кофейни ========== */
window.highlightCoffeeItem = function(id){
  document.querySelectorAll('.coffee-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const selected = document.querySelector(`.coffee-item[data-id="${id}"]`);
  if (selected) { 
    selected.classList.add('active'); 
    selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
  }
}

/* ========== Функции показа/скрытия сайдбара ========== */
window.hideSidebar = function(){
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  sidebar.classList.remove('show');
  overlay.style.display = 'none';
}

window.showSidebar = function(){
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  sidebar.classList.add('show');
  overlay.style.display = 'block';
  adjustSidebarPosition();
}

/* ========== Динамическое позиционирование сайдбара ========== */
function adjustSidebarPosition(){
  const header = document.querySelector('.header');
  const filters = document.querySelector('.filter-container');
  
  if (!header || !filters) return;

  const headerRect = header.getBoundingClientRect();
  const filtersRect = filters.getBoundingClientRect();
  
  const topOffset = Math.ceil(filtersRect.bottom + window.scrollY);

  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  sidebar.style.top = topOffset + "px";
  sidebar.style.height = "calc(100vh - " + topOffset + "px)";
  overlay.style.top = topOffset + "px";
  overlay.style.height = "calc(100vh - " + topOffset + "px)";
}

/* ========== Применение фильтров ========== */
function applyFilters(){
  const searchText = document.querySelector('.search-box').value.toLowerCase();
  const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
  const metroVal = document.getElementById('metro-filter').value;
  const radiusMeters = 800;
  let metroCoords = null;

  // Удаляем старую окружность метро, если есть
  if (metroCircle) { 
    map.geoObjects.remove(metroCircle); 
    metroCircle = null; 
  }
  
  // Создаем новую окружность, если выбрана станция метро
  if (metroVal) {
    metroCoords = metroVal.split(',').map(Number);
    metroCircle = new ymaps.Circle(
      [metroCoords, radiusMeters], 
      {}, 
      { 
        fillColor: '#DB709380', 
        strokeColor: '#990066', 
        strokeWidth: 2,
        zIndex: 1
      }
    );
    map.geoObjects.add(metroCircle);
  }

  // Применяем фильтры к кофейням
  coffeePlaces.forEach(cp => {
    const name = cp.data.name.toLowerCase();
    const addr = (cp.data.address || '').toLowerCase();
    let visible = true;
    
    // Фильтр по тексту поиска
    if (searchText && !name.includes(searchText) && !addr.includes(searchText)) {
      visible = false;
    }
    
    // Фильтр по тегам
    if (activeFilter !== 'all' && !cp.data.tags.includes(activeFilter)) {
      visible = false;
    }
    
    // Фильтр по расстоянию до метро
    if (metroCoords) {
      const dist = ymaps.coordSystem.geo.getDistance(cp.data.coordinates, metroCoords);
      if (dist > radiusMeters) {
        visible = false;
      }
    }
    
    // Применяем видимость
    cp.placemark.options.set('visible', visible);
    
    const listItem = document.querySelector(`.coffee-item[data-id="${cp.id}"]`);
    if (listItem) {
      listItem.style.display = visible ? 'block' : 'none';
    }
  });
}

/* Обработчики событий окна */
window.addEventListener('load', adjustSidebarPosition);
window.addEventListener('resize', adjustSidebarPosition);
window.addEventListener('orientationchange', () => {
  setTimeout(adjustSidebarPosition, 300);
});
