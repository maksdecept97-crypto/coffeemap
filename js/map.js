/* ========== Функции для работы с картой ========== */

// Глобальные переменные для карты
let map, coffeePlaces = [], userMarker = null, metroCircle = null, userCoords = null;

/* ========== Добавление меток (Placemark) ========== */
function addCoffeePlaces(){
  coffeeData.forEach(coffee=>{
    // содержимое балуна (HTML)
    const balloonContentBody = `
      <div class="balloon-scroll">
        <div class="balloon-content">
          <div class="balloon-header">${coffee.name}</div>
          <div class="balloon-address">${coffee.address}</div>
          <div class="balloon-description">${coffee.description}</div>
          ${coffee.telegramEmbed ? `<iframe class="telegram-embed" src="${coffee.telegramEmbed}"></iframe>` : ''}
          <div class="balloon-footer">
            <button class="balloon-btn" onclick="window.openRoute(${coffee.coordinates[0]},${coffee.coordinates[1]})">Маршрут</button>
          </div>
        </div>
      </div>`;

    // опции метки: иконка + параметры балуна для мобильных
    const placemark = new ymaps.Placemark(coffee.coordinates, {
      balloonContentHeader: coffee.name,
      balloonContentBody: balloonContentBody
    }, {
      iconLayout:'default#image',
      iconImageHref:'https://github.com/maksdecept97-crypto/coffeemap/blob/main/point.png?raw=true',
      iconImageSize:[13,25],
      iconImageOffset:[-9,-28],
      // важные параметры для корректного отображения балуна на мобильных
      balloonMaxWidth: 350,
      balloonOffset: [0, -32],
      balloonPanelMaxMapArea: 0
    });

    coffeePlaces.push({ id: coffee.id, placemark, data: coffee });
    map.geoObjects.add(placemark);

    // при клике на метку подсвечиваем элемент в списке (но не показываем overlay)
    placemark.events.add('click', ()=>{ window.highlightCoffeeItem(coffee.id); });
  });
}

/* ========== Геолокация пользователя ========== */
function locateUser(){
  if(!navigator.geolocation){ alert("Геолокация не поддерживается вашим браузером."); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    userCoords = [pos.coords.latitude, pos.coords.longitude];
    addUserMarker(userCoords);
  }, err=>{ console.error("Ошибка геолокации:", err); alert("Не удалось определить местоположение."); }, { enableHighAccuracy:true, timeout:5000 });
}

function addUserMarker(coords){
  if(userMarker){ map.geoObjects.remove(userMarker); }
  userMarker = new ymaps.Placemark(coords, { balloonContent: 'Вы здесь' }, { preset:'islands#circleIcon', iconColor:'#3399ff' });
  map.geoObjects.add(userMarker);
  map.setCenter(coords, 14, { duration: 500 });
}

/* ========== Закрытие всех балунов ========== */
function closeAllBalloons(){
  coffeePlaces.forEach(cp => { try{ cp.placemark.balloon.close(); } catch(e){/* noop */} });
}

/* ========== Открыть маршрут в новой вкладке (внешний Яндекс.Карты) ========== */
window.openRoute = function(lat, lon){
  if(!userCoords){ alert("Сначала определите ваше местоположение!"); return; }
  const url = `https://yandex.ru/maps/?rtext=${userCoords[0]},${userCoords[1]}~${lat},${lon}&rtt=auto`;
  window.open(url, '_blank');
}
