const pad = (num) => ("0" + num).slice(-2);
const getTimeFromTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  let hours = date.getHours(),
  minutes = date.getMinutes();
  return pad(hours) + ":" + pad(minutes);
}
const getFullDateFromTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  let year = date.getFullYear(),
  month = date.getMonth()+1,
  day = date.getDate();
  return pad(day)+"."+pad(month)+"."+year;
}
const removeChild = (parent) => {
  while(parent.firstChild){
    parent.removeChild(parent.firstChild);
  }
}
const getWeekday = (date) => {
  const weekday = new Date(date).getDay();    
  return isNaN(weekday) ? null : 
    ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'][weekday];
}
const showWeather = () => {
  const city = document.getElementById("city-input").value;
  const url = 'https://api.openweathermap.org/data/2.5/weather?q='+city+'&appid=YOURAPIKEY';
    if(city==""){
      alert("Podaj miasto");
    }else{
      fetch(url)
      .then((resp) => resp.json())
      .then(data => {
        document.getElementById("city").innerHTML = data.name+", "+data.sys.country;
        document.getElementById("temp").innerHTML = "<img src='http://openweathermap.org/img/wn/"+data.weather[0].icon+
        "@2x.png' id='icon'/>"+Math.round(parseFloat(data.main.temp)-273.15)+"&deg;C<span id='temp-feels'>"+Math.round(parseFloat(data.main.feels_like)-273.15)+"&deg;C</span>";
        document.getElementById("desc").innerHTML = data.weather[0].main+" - "+data.weather[0].description;
        document.getElementById("wind-speed").innerHTML = "Wiatr: "+Math.round(parseFloat(data.wind.speed)*(60*60)/1000)+" km/h";
        document.getElementById("clouds").innerHTML = "Zachmurzenie: "+data.clouds.all+"%";
        document.getElementById("pressure").innerHTML = "Ciśnienie: "+data.main.pressure+" hPa";
        document.getElementById("humidity").innerHTML = "Wilgotność: "+data.main.humidity+"%";
        document.getElementById("sunrise").innerHTML = "Wschód słońca: "+getTimeFromTimestamp(data.sys.sunrise);
        document.getElementById("sunset").innerHTML = "Zachód słońca: "+getTimeFromTimestamp(data.sys.sunset);
        document.getElementById("content").style.display = "block";
        document.getElementById("footer").style.display = "block";

        const parent = document.getElementById("forecast");
        removeChild(parent);
        showForecast();
      })
      .catch(error => {
        console.log(error);
      });
    }
}
document.getElementById("show-weather").onclick = showWeather;

const showForecast = () => {
  const city = document.getElementById("city-input").value;
  const url = 'https://api.openweathermap.org/data/2.5/forecast?q='+city+'&appid=YOURAPIKEY';
  fetch(url)
  .then((resp) => resp.json())
  .then(forecast => {
    document.getElementById("forecast-city").innerHTML = forecast.city.name+", "+forecast.city.country;
      forecast.list.forEach(data => {
        const container = document.createElement('div');
        container.className = "forecast-container";

        const time = document.createElement('div');
        time.className = "forecast-time";
        let dateFormat = data.dt
        let date = data.dt_txt;
        let dateOutput = date.slice(0,10);
        time.innerHTML = getWeekday(dateOutput) + " " + date.slice(11,16)+"<br />"+
        "<span style='font-size: 12px'>"+ getFullDateFromTimestamp(dateFormat) +"</span>";
        container.appendChild(time);

        const icon = document.createElement('img');
        icon.src = 'http://openweathermap.org/img/wn/' + data.weather[0].icon + '.png';
        container.appendChild(icon);

        const temp = document.createElement('span');
        temp.className = "forecast-temp";
        temp.innerHTML = Math.round(parseFloat(data.main.temp)-273.15)+"&deg;";
        container.appendChild(temp);

        const tempLike = document.createElement('span');
        tempLike.className = "forecast-temp-like";
        tempLike.innerHTML = Math.round(parseFloat(data.main.feels_like)-273.15)+"&deg;";
        container.appendChild(tempLike);

        const forecastInfo = document.createElement('div');
        forecastInfo.className = "forecast-info";
        forecastInfo.innerHTML = "<p>Wiatr: "+Math.round(parseFloat(data.wind.speed)*(60*60)/1000)+" km/h</p>"+
        "<p>Ciśnienie: "+data.main.pressure+" hPa</p>"+
        "<p>Zachmurzenie: "+data.clouds.all+"%</p>"+
        "<p>Wilgotność: "+data.main.humidity+"%</p>";
        container.appendChild(forecastInfo);

        document.getElementById("forecast").appendChild(container);
    })
  })
  .catch(error => {
    console.log(error);
  });
}

const forecastWeather = document.getElementById("forecast-weather").style;
const currentWeather = document.getElementById("current-weather").style;
const footer = document.getElementById("footer").style;

const showForecastContent = () => {
  document.body.style.width = "560px";
  document.body.style.height = "600px";
  document.body.style.transition = "0.2s"
  forecastWeather.display = "block";
  currentWeather.display = "none"
  footer.display = "none";
}
document.getElementById("show-forecast").onclick = showForecastContent;

const showWeatherContent = () => {
  document.body.style.width = "280px";
  document.body.style.height = "auto";
  document.body.style.transition = "0.2s"
  forecastWeather.display = "none";
  currentWeather.display = "block";
  footer.display = "block";
}
document.getElementById("back-weather").onclick = showWeatherContent;

let favList = [];
const addElementToList = () => {
  const input = document.getElementById("city-input").value;
  if(!input){
    return;
  }
  favList.push({
    fav: input
  });
  localStorage.setItem("list", JSON.stringify(favList));
  renderList();
}
document.getElementById("add-fav").onclick = addElementToList;

const renderList = () => {
  const fav = document.getElementById("fav");
  fav.innerHTML = null;
  const list = localStorage.getItem("list")
  favList = JSON.parse(list) || [];
  for(let i = 0; i<favList.length; i++){
    const item = document.createElement("li");
    item.innerHTML = '<span class="element-list">'+favList[i].fav+'</span>';

    const deleteBTN = document.createElement("button");
    deleteBTN.className = "delete-list";
    deleteBTN.innerHTML = '<i class="fa fa-times"></i>'
    deleteBTN.addEventListener("click", function () {
      favList.splice(i, 1);
      localStorage.setItem("list", JSON.stringify(favList));
      renderList();
    });

    const searchBTN = document.createElement("button");
    searchBTN.className = "search-list";
    searchBTN.innerHTML = '<i class="fa fa-search"></i>'
    searchBTN.addEventListener("click", function () {
      document.getElementById("city-input").value = favList[i].fav;
      showWeather();
    });
    item.appendChild(searchBTN);
    item.appendChild(deleteBTN);
    fav.appendChild(item);
  }
}

window.onload = () => {
  renderList();
}