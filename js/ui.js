function populateList() {
  const list = document.getElementById("listContent");
  list.innerHTML = "";
  coffeeData.forEach(coffee => {
    const li = document.createElement("li");
    li.textContent = coffee.name;
    li.addEventListener("click", () => {
      map.setCenter(coffee.coordinates, 15);
      placemarks.find(p => p.data.name === coffee.name).placemark.balloon.open();
    });
    list.appendChild(li);
  });
}

function toggleList() {
  const list = document.getElementById("coffeeList");
  list.classList.toggle("active");
}
