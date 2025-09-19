let map;
let userLocation;
let metroCircle;
let placemarks = [];

function initMap() {
  map = new ymaps.Map("map", {
    center: [59.9342802, 30.3350986],
    zoom: 12,
    controls: ["zoomControl", "geolocationControl"]
  });

  // геолокация
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        userLocation = [pos.coords.latitude, pos.coords.longitude];
        const userPlacemark = new ymaps.Placemark(userLocation, {
          balloonContent: "Вы здесь"
        }, {
          preset: "islands#blueDotIcon"
        });
        map.geoObjects.add(userPlacemark);
        map.setCenter(userLocation, 14);
      },
      () => console.warn("Не удалось определить геопозицию")
    );
  }

  // добавляем кофейни
  coffeeData.forEach(coffee => {
    const balloonContentBody = `
      <div>
        <p>${coffee.description}</p>
        ${coffee.photos.map(photo => `<iframe src="${photo}" width="240" height="200"></iframe>`).join("")}
        <br>
        <a href="https://yandex.ru/maps/?rtext=~${coffee.coordinates[0]},${coffee.coordinates[1]}" target="_blank">Маршрут</a>
      </div>
    `;

    const placemark = new ymaps.Placemark(coffee.coordinates, {
      balloonContentHeader: coffee.name,
      balloonContentBody: balloonContentBody
    }, {
      iconLayout: "default#image",
      iconImageHref: "https://github.com/maksdecept97-crypto/coffeemap/blob/main/cartpoint.png?raw=true",
      iconImageSize: [32, 32],
      iconImageOffset: [-16, -16]
    });

    map.geoObjects.add(placemark);
    placemarks.push({ placemark, data: coffee });
  });

  // клик по карте скрывает балуны и список
  map.events.add("click", () => {
    map.balloon.close();
    document.getElementById("coffeeList").classList.remove("active");
  });
}
