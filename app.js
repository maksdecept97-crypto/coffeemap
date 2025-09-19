ymaps.ready(init);

let map, coffeePlaces=[], userMarker=null, metroCircle=null, userCoords=null;

// Инициализация карты
function init(){
  map = new ymaps.Map("map",{center:[59.93,30.34], zoom:12, controls:['zoomControl','geolocationControl']});
  addCoffeePlaces();
  renderCoffeeList();
  initEventHandlers();
  locateUser();

  // Закрытие балуна при клике на карту
  map.events.add('click', () => { map.balloon.close(); });
}

// Добавление маркеров кофеен
function addCoffeePlaces(){
  coffeeData.forEach(coffee => {
    const balloonContentBody = `
      <div class="balloon-scroll">
        <div class="balloon-content">
          <div class="balloon-header">${coffee.name}</div>
          <div class="balloon-address">${coffee.address}</div>
          <div class="balloon-description">${coffee.description}</div>
          ${coffee.telegramEmbed ? `<iframe class="telegram-embed" src="${coffee.telegramEmbed}"></iframe>` : ''}
          <div class="balloon-footer">
            <button class="balloon-btn" onclick="openRoute(${coffee.coordinates[0]},${coffee.coordinates[1]})">Маршрут</button>
          </div>
        </div>
      </div>`;

    const placemark = new ymaps.Placemark(coffee.coordinates, {balloonContentHeader: coffee.name, balloonContentBody}, {
      iconLayout:'default#image',
      iconImageHref:'images/point.png',
      iconImageSize:[18,28],
      iconImageOffset:[-20,-40]
    });

    coffeePlaces.push({id: coffee.id, placemark, data: coffee});
    map.geoObjects.add(placemark);
    placemark.events.add('click', () => { highlightCoffeeItem(coffee.id); });
  });
}

// Отображение списка кофеен
function renderCoffeeList(){
  const list=document.querySelector('.coffee-list');
  list.innerHTML='';
  coffeeData.forEach(coffee=>{
    const li=document.createElement('li');
    li.className='coffee-item'; li.dataset.id=coffee.id;
    li.innerHTML=`<div class="coffee-name">${coffee.name}</div><div class="coffee-address">${coffee.address}</div>`;
    li.addEventListener('click',()=>{
      const cp=coffeePlaces.find(c=>c.id===coffee.id);
      if(cp){map.setCenter(cp.placemark.geometry.getCoordinates(),16); cp.placemark.balloon.open(); highlightCoffeeItem(coffee.id);}
    });
    list.appendChild(li);
  });
}

// Подсветка выбранной кофейни
function highlightCoffeeItem(id){
  document.querySelectorAll('.coffee-item').forEach(i=>i.classList.remove('active'));
  const selected=document.querySelector(`.coffee-item[data-id="${id}"]`);
  if(selected){selected.classList.add('active'); selected.scrollIntoView({behavior:'smooth',block:'nearest'});}
}

// Обработчики событий
function initEventHandlers(){
  document.querySelector('.search-box').addEventListener('input',applyFilters);
  document.querySelectorAll('.filter-btn').forEach(btn=>btn.addEventListener('click',function(){
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');
    applyFilters();
  }));
  document.getElementById('metro-filter').addEventListener('change',applyFilters);
  document.querySelector('.user-location-btn').addEventListener('click',locateUser);

  // Кнопка показа/скрытия панели
  document.querySelector('.show-sidebar-btn').addEventListener('click',()=>{
    document.querySelector('.sidebar').classList.toggle('show');
  });
}

// Фильтры поиска
function applyFilters(){
  const searchText=document.querySelector('.search-box').value.toLowerCase();
  const activeFilter=document.querySelector('.filter-btn.active').dataset.filter;
  const metroVal=document.getElementById('metro-filter').value;
  const radiusMeters=800;
  let metroCoords=null;

  if(metroCircle){map.geoObjects.remove(metroCircle); metroCircle=null;}
  if(metroVal){
    metroCoords=metroVal.split(',').map(Number);
    metroCircle=new ymaps.Circle([metroCoords,radiusMeters],{}, {fillColor:'#DB709380',strokeColor:'#990066',strokeWidth:1});
    map.geoObjects.add(metroCircle);
  }

  coffeePlaces.forEach(cp=>{
    const name=cp.data.name.toLowerCase(), addr=cp.data.address.toLowerCase();
    let visible=true;
    if(searchText && !name.includes(searchText) && !addr.includes(searchText)) visible=false;
    if(activeFilter!=='all' && !cp.data.tags.includes(activeFilter)) visible=false;
    if(metroCoords){
      const dist=ymaps.coordSystem.geo.getDistance(cp.data.coordinates,metroCoords);
      if(dist>radiusMeters) visible=false;
    }

    cp.placemark.options.set('visible',visible);
    const li=document.querySelector(`.coffee-item[data-id="${cp.id}"]`);
    if(li) li.style.display=visible?'block':'none';
  });
}

// Определение геолокации пользователя
function locateUser(){
  if(!navigator.geolocation){alert("Геолокация не поддерживается вашим браузером."); return;}
  navigator.geolocation.getCurrentPosition(pos=>{
    userCoords=[pos.coords.latitude,pos.coords.longitude];
    addUserMarker(userCoords);
  },err=>{console.error("Ошибка геолокации:",err); alert("Не удалось определить местоположение.");},{enableHighAccuracy:true,timeout:5000});
}

function addUserMarker(coords){
  if(userMarker){map.geoObjects.remove(userMarker);}
  userMarker=new ymaps.Placemark(coords,{balloonContent:'Вы здесь'},{preset:'islands#circleIcon',iconColor:'#3399ff'});
  map.geoObjects.add(userMarker); map.setCenter(coords,14,{duration:500});
}

// Открываем маршрут в новой вкладке через Яндекс.Карты
function openRoute(lat, lon){
  if(!userCoords){
    alert("Сначала определите ваше местоположение!");
    return;
  }
  const url = `https://yandex.ru/maps/?rtext=${userCoords[0]},${userCoords[1]}~${lat},${lon}&rtt=auto`;
  window.open(url,'_blank');
}
