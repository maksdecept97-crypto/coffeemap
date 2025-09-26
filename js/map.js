/* ========== Функции для работы с картой ========== */

// Глобальные переменные для карты
let map, coffeePlaces = [], userMarker = null, metroCircle = null, userCoords = null;

/* ========== Добавление меток (Placemark) ========== */
function addCoffeePlaces(){
  coffeeData.forEach(coffee => {
    // Создаем кнопку для маршрута
    const routeButton = document.createElement('button');
    routeButton.className = 'balloon-btn';
    routeButton.textContent = 'Маршрут';
    routeButton.onclick = function() {
      window.openRoute(coffee.coordinates[0], coffee.coordinates[1]);
    };
    
    // Создаем содержимое балуна
    const balloonContent = document.createElement('div');
    balloonContent.className = 'balloon-scroll';
    
    const balloonInner = document.createElement('div');
    balloonInner.className = 'balloon-content';
    
    const header = document.createElement('div');
    header.className = 'balloon-header';
    header.textContent = coffee.name;
    
    const address = document.createElement('div');
    address.className = 'balloon-address';
    address.textContent = coffee.address;
    
    const description = document.createElement('div');
    description.className = 'balloon-description';
    description.textContent = coffee.description;
    
    const footer = document.createElement('div');
    footer.className = 'balloon-footer';
    footer.appendChild(routeButton);
    
    balloonInner.appendChild(header);
    balloonInner.appendChild(address);
    balloonInner.appendChild(description);
    
    if (coffee.telegramEmbed) {
      const telegramIframe = document.createElement('iframe');
      telegramIframe.className = 'telegram-embed';
      telegramIframe.src = coffee.telegramEmbed;
      telegramIframe.frameBorder = '0';
      balloonInner.appendChild(telegramIframe);
    }
    
    balloonInner.appendChild(footer);
    balloonContent.appendChild(balloonInner);
    
    // Создаем метку
    const placemark = new ymaps.Placemark(
       coffee.coordinates,
      {
        balloonContentHeader: coffee.name
													
      },
      {
        iconLayout: 'default#image',
        iconImageHref: 'https://github.com/maksdecept97-crypto/coffeemap/blob/main/point.png?raw=true',
        iconImageSize: [13, 25],
        iconImageOffset: [-9, -28],
        balloonMaxWidth: 350,
        balloonOffset: [0, -32],
        balloonPanelMaxMapArea: 0,
        balloonContentLayout: ymaps.templateLayoutFactory.createClass(`
          <div class="balloon-scroll">
            <div class="balloon-content">
              <div class="balloon-header">${coffee.name}</div>
              <div class="balloon-address">${coffee.address}</div>
              <div class="balloon-description">${coffee.description}</div>
              ${coffee.telegramEmbed ? `<iframe class="telegram-embed" src="${coffee.telegramEmbed}" frameborder="0"></iframe>` : ''}
              <div class="balloon-footer">
                <button class="balloon-btn" id="route-btn-${coffee.id}">Маршрут</button>
              </div>
            </div>
          </div>
        `)
      }
    );

    coffeePlaces.push({ id: coffee.id, placemark, data: coffee });
    map.geoObjects.add(placemark);

    // Привязка обработчика кнопки маршрута при открытии балуна
    placemark.events.add('balloonopen', () => {
      const btn = document.getElementById(`route-btn-${coffee.id}`);
      if (btn) {
        btn.onclick = () => window.openRoute(coffee.coordinates[0], coffee.coordinates[1]);
      }
    });

   // При клике на метку подсвечиваем элемент в списке
    placemark.events.add('click', () => {
      window.highlightCoffeeItem(coffee.id);
    });
  });
}

/* ========== Геолокация пользователя ========== */
function locateUser(){
  if (!navigator.geolocation) { 
    alert("Геолокация не поддерживается вашим браузером."); 
    return; 
  }
  
  navigator.geolocation.getCurrentPosition(
    pos => {
      userCoords = [pos.coords.latitude, pos.coords.longitude];
      addUserMarker(userCoords);
    }, 
    err => { 
      console.error("Ошибка геолокации:", err); 
      alert("Не удалось определить местоположение."); 
    }, 
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function addUserMarker(coords){
  if (userMarker) { 
    map.geoObjects.remove(userMarker); 
  }
  
  userMarker = new ymaps.Placemark(
    coords, 
    { balloonContent: 'Вы здесь' }, 
    { 
      preset: 'islands#circleIcon', 
      iconColor: '#3399ff',
      zIndex: 1000
    }
  );
  
  map.geoObjects.add(userMarker);
  map.setCenter(coords, 14, { duration: 500 });
}

/* ========== Закрытие всех балунов ========== */
function closeAllBalloons(){
  coffeePlaces.forEach(cp => { 
    try { 
      cp.placemark.balloon.close(); 
    } catch(e) {
      // Игнорируем ошибки
    } 
  });
}

/* ========== Открыть маршрут в новой вкладке ========== */
window.openRoute = function(lat, lon){
  if (!userCoords) { 
    alert("Сначала определите ваше местоположение!"); 
    return; 
  }
  
  const url = `https://yandex.ru/maps/?rtext=${userCoords[0]},${userCoords[1]}~${lat},${lon}&rtt=auto`;
  window.open(url, '_blank');
};


});








