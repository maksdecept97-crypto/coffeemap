ymaps.ready(() => {
  initMap();
  populateList();

  document.getElementById("toggleList").addEventListener("click", toggleList);

  // фильтрация по метро
  document.getElementById("metroFilter").addEventListener("change", e => {
    const metro = e.target.value;
    placemarks.forEach(({ placemark, data }) => {
      if (!metro || data.metro === metro) {
        placemark.options.set("visible", true);
      } else {
        placemark.options.set("visible", false);
      }
    });
  });

  // фильтрация по радиусу
  document.getElementById("radiusFilter").addEventListener("change", e => {
    const radius = parseInt(e.target.value);
    if (metroCircle) {
      map.geoObjects.remove(metroCircle);
      metroCircle = null;
    }
    if (radius > 0 && userLocation) {
      metroCircle = new ymaps.Circle([userLocation, radius], {}, {
        fillColor: "#DB709377",
        strokeColor: "#990066",
        strokeOpacity: 0.8,
        strokeWidth: 2
      });
      map.geoObjects.add(metroCircle);
    }
  });

  // поиск
  document.getElementById("searchBox").addEventListener("input", e => {
    const query = e.target.value.toLowerCase();
    placemarks.forEach(({ placemark, data }) => {
      placemark.options.set("visible", data.name.toLowerCase().includes(query));
    });
  });
});
