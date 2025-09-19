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
        balloonContentHeader: coffee.name,
        balloonContentBody: balloonContent.outerHTML
      }, 
      {
        iconLayout: 'default#image',
        iconImageHref: 'https://github.com/maksdecept97-crypto/coffeemap/blob/main/point.png?raw=true',
        iconImageSize: [13, 25],
        iconImageOffset: [-9, -28],
        balloonMaxWidth: 350,
        balloonOffset: [0, -32],
        balloonPanelMaxMapArea: 0
      }
    );

    coffeePlaces.push({ id: coffee.id, placemark, data: coffee });
    map.geoObjects.add(placemark);

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
// Если геолокация еще не определена, запрашиваем ее
  if (!userCoords) {
    if (!navigator.geolocation) { 
      alert("Геолокация не поддерживается вашим браузером."); 
      return; 
    }
    
    // Запрашиваем геолокацию
    navigator.geolocation.getCurrentPosition(
      pos => {
        userCoords = [pos.coords.latitude, pos.coords.longitude];
        addUserMarker(userCoords);
        
        // После получения геолокации открываем маршрут
        const url = `https://yandex.ru/maps/?rtext=${userCoords[0]},${userCoords[1]}~${lat},${lon}&rtt=auto`;
        window.open(url, '_blank');
      }, 
      err => { 
        console.error("Ошибка геолокации:", err); 
        
        // Если не удалось получить геолокацию, предлагаем ввести адрес вручную
        const userAddress = prompt("Не удалось определить ваше местоположение. Введите ваш адрес или ориентир:");
        if (userAddress) {
          // Используем геокодирование для получения координат из адреса
          ymaps.geocode(userAddress, { results: 1 }).then(function (res) {
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) {
              const coords = firstGeoObject.geometry.getCoordinates();
              const url = `https://yandex.ru/maps/?rtext=${coords[0]},${coords[1]}~${lat},${lon}&rtt=auto`;
              window.open(url, '_blank');
            } else {
              alert("Не удалось найти указанный адрес. Пожалуйста, проверьте правильность ввода.");
            }
          }).catch(error => {
            console.error("Ошибка геокодирования:", error);
            alert("Произошла ошибка при определении адреса.");
          });
        }
      }, 
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  } else {
    // Если геолокация уже определена, сразу открываем маршрут
    const url = `https://yandex.ru/maps/?rtext=${userCoords[0]},${userCoords[1]}~${lat},${lon}&rtt=auto`;
    window.open(url, '_blank');
  }
};



