ymaps.ready(init);
let map, coffeePlaces=[], userMarker=null, metroCircle=null, userCoords=null;

// Данные кофеен
const coffeeData = [
  {id:1,name:"Tour Coffee",coordinates:[59.911946,30.316499],address:"7-я Красноармейская ул., 5Д",description:"Tour coffee — это предвкушение каждый раз чего-то нового: разные сорта, разные обжарщики. Здесь подают гриль-чизы и свежие десерты. И конечно кофе.",telegramEmbed:"https://t.me/teplo_coffeeroutes/4?embed=1",tags:["center","with-food"]},
  {id:2,name:"UNIC",coordinates:[59.960012,30.311556],address:"ул. Кронверская, 12",description:"UNIC — место, куда хочется приходить за едой и кофе.",telegramEmbed:"https://t.me/teplo_coffeeroutes/8?embed=1",tags:["center","with-food"]},
  {id:3,name:"Verlé",coordinates:[59.963493, 30.314817],address:"Каменноостровский пр-т, 25/2",description:"Уютное место с отличным кофе и атмосферой.",telegramEmbed:"https://t.me/teplo_coffeeroutes/15?embed=1",tags:["center"]},
  {id:4,name:"Щегол",coordinates:[59.941899, 30.363427],address:"ул. Радищева, 38/20",description:"Уютная кофейня с тёплым, домашним дизайном, куда хочется заходить в любое время года.",telegramEmbed:"https://t.me/teplo_coffeeroutes/22?embed=1",tags:["center","with-food"]},
  {id:5,name:"Bolshecoffee roasters",coordinates:[59.927991, 30.353581],address:"ул. Марата, 22-2",description:"Bolshecoffee Roasters — это место, где вы можете насладиться ароматным кофе и вкусными десертами. Здесь вы найдете широкий выбор кофейных зерен.",telegramEmbed:"",tags:["center","with-food"]},
  {id:6,name:"Сибаристика",coordinates:[59.910412, 30.284159],address:"наб. Обводного канала, 199-201К",description:"Sibaristica — это часть большого пространства, в которое входят коворкинг и школа бариста. В меню вошли почти два десятка видов кофе от классических черных до авторских — латте ройбуш, раф соленый арахис, флэт уайт, бариста-сет из трех напитков.",telegramEmbed:"https://t.me/teplo_coffeeroutes/35",tags:["with-food"]},
  {id:7,name:"Щегол",coordinates:[59.912521, 30.317260],address:"6-я Красноармейская ул., 1",description:"Приятная кофейня с вкусным меню и прекрасным кофе.Просторные стеклянные двери, которые распахиваются в хорошую погоду, полка во всю стену с модными журналами, аккуратные столики и стильные лампы, гармонично вписывающиеся в интерьер.",telegramEmbed:"https://t.me/teplo_coffeeroutes/22?embed=1",tags:["with-food"]}
];

function init(){
  map = new ymaps.Map("map",{center:[59.93,30.34], zoom:12, controls:['zoomControl','geolocationControl']});
  addCoffeePlaces();
  renderCoffeeList();
  initEventHandlers();
  locateUser();
}

// Добавление меток на карту
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

    const placemark = new ymaps.Placemark(coffee.coordinates, {
      balloonContentHeader: coffee.name,
