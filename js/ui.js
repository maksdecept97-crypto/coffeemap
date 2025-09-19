/* ========== Функции для работы с UI ========== */

/* ========== Рендер списка в сайдбаре ========== */
function renderCoffeeList(){
  const list = document.querySelector('.coffee-list');
  list.innerHTML = '';
  coffeeData.forEach(coffee=>{
    const li = document.createElement('li');
    li.className = 'coffee-item';
    li.dataset.id = coffee.id;
    li.innerHTML = `<div class="coffee-name">${coffee.name}</div><div class="coffee-address">${coffee.address}</div>`;
    li.addEventListener('click', ()=>{
      const cp = coffeePlaces.find(c=>c.id === coffee.id);
      if(cp){
        map.setCenter(cp.placemark.geometry.getCoordinates(), 16);
        cp.placemark.balloon.open();
        highlightCoffeeItem(coffee.id);
        hideSidebar(); // скрываем сайдбар после выбора
      }
    });
    list.appendChild(li);
  });
}

/* ========== Подсветка выбранной кофейни ========== */
function highlightCoffeeItem(id){
  document.querySelectorAll('.coffee-item').forEach(i=>i.classList.remove('active'));
  const selected = document.querySelector(`.coffee-item[data-id="${id}"]`);
  if(selected){ selected.classList.add('active'); selected.scrollIntoView({behavior:'smooth', block:'nearest'}); }
}

/* ========== Функции показа/скрытия сайдбара ========== */
function hideSidebar(){
  document.querySelector('.sidebar').classList.remove('show');
  document.querySelector('.sidebar-overlay').style.display = 'none';
}

/* ========== Динамическое позиционирование сайдбара ========== */
/* Считает высоту header + filter-container и ставит top и height для sidebar и overlay */
function adjustSidebarPosition(){
  const header = document.querySelector('.header');
  const filters = document.querySelector('.filter-container');
  if(!header || !filters) return;

  const headerRect = header.getBoundingClientRect();
  const filtersRect = filters.getBoundingClientRect();
  // topOffset = расстояние от верхней части страницы до нижней границы блока фильтров
  const topOffset = Math.ceil(filtersRect.bottom + window.scrollY);

  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  // ставим top и высоту
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

  if(metroCircle){ map.geoObjects.remove(metroCircle); metroCircle = null; }
  if(metroVal){
    metroCoords = metroVal.split(',').map(Number);
    metroCircle = new ymaps.Circle([metroCoords, radiusMeters], {}, { fillColor:'#DB709380', strokeColor:'#990066', strokeWidth:1 });
    map.geoObjects.add(metroCircle);
  }

  coffeePlaces.forEach(cp=>{
    const name = cp.data.name.toLowerCase();
    const addr = (cp.data.address || '').toLowerCase();
    let visible = true;
    if(searchText && !name.includes(searchText) && !addr.includes(searchText)) visible = false;
    if(activeFilter !== 'all' && !cp.data.tags.includes(activeFilter)) visible = false;
    if(metroCoords){
      const dist = ymaps.coordSystem.geo.getDistance(cp.data.coordinates, metroCoords);
      if(dist > radiusMeters) visible = false;
    }
    cp.placemark.options.set('visible', visible);
    const li = document.querySelector(`.coffee-item[data-id="${cp.id}"]`);
    if(li) li.style.display = visible ? 'block' : 'none';
  });
}
