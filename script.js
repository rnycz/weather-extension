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
const getFullDateFromTimestampFormat =(timestamp) =>{
  const date = new Date(timestamp * 1000);
  let year = date.getFullYear(),
  month = date.getMonth()+1,
  day = date.getDate();
  return year+"-"+pad(month)+"-"+pad(day);
}
const returnTime = (timezone) => {
  const date = new Date();
  let hours = date.getHours()+timezone,
  minutes = date.getMinutes();
  let infoGMT = "";
  if(timezone+1*2>0){ //*2 timezone change to summer
    infoGMT = "GMT+"+(timezone+1*2);
  }else if(timezone+1*2<0){
    infoGMT = "GMT"+(timezone+1*2);
  }else{
    infoGMT = "GMT0";
  }
  let newHours = hours - 24;
  if(hours>23){
    document.getElementById("current-time").innerHTML = "<i class='fa-solid fa-clock'></i> "+pad(newHours) + ":" + pad(minutes)+ " " +infoGMT;
    document.getElementById("forecast-current-time").innerHTML = "<i class='fa-solid fa-clock'></i> "+pad(newHours) + ":" + pad(minutes)+ " " +infoGMT;
  }else{
    document.getElementById("current-time").innerHTML = "<i class='fa-solid fa-clock'></i> "+pad(hours) + ":" + pad(minutes)+ " " +infoGMT;
    document.getElementById("forecast-current-time").innerHTML = "<i class='fa-solid fa-clock'></i> "+pad(hours) + ":" + pad(minutes)+ " " +infoGMT;
  }
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
        document.getElementById("temp").innerHTML = "<img src='http://openweathermap.org/img/wn/"+data.weather[0].icon+"@2x.png' class='icon'/>"+
        Math.round(parseFloat(data.main.temp)-273.15)+"&deg;C<span id='temp-feels'>"+Math.round(parseFloat(data.main.feels_like)-273.15)+"&deg;C</span>";
        let rain = data.hasOwnProperty('rain') ? '<i class="fa-solid fa-cloud-rain"></i> '+data.rain['1h']+' mm/h' : '<i class="fa-solid fa-cloud-rain"></i> 0 mm/h';
        let snow = data.hasOwnProperty('snow') ? '<i class="fa-regular fa-snowflake"></i> '+data.snow['1h']+' mm/h' : '<i class="fa-regular fa-snowflake"></i> 0 mm/h';
        document.getElementById("rain").innerHTML = rain;
        document.getElementById("snow").innerHTML = snow;
        document.getElementById("wind-speed").innerHTML = "Wiatr: "+Math.round(parseFloat(data.wind.speed)*(60*60)/1000)+" km/h";
        document.getElementById("clouds").innerHTML = "Zachmurzenie: "+data.clouds.all+"%";
        document.getElementById("pressure").innerHTML = "Ciśnienie: "+data.main.pressure+" hPa";
        document.getElementById("humidity").innerHTML = "Wilgotność: "+data.main.humidity+"%";
        document.getElementById("sunrise").innerHTML = "<img src='images/icons-ap/sunrise.png' /><br />" + getTimeFromTimestamp((data.sys.sunrise+data.timezone)-3600*2);
        document.getElementById("sunset").innerHTML = "<img src='images/icons-ap/sunset.png' /><br />" + getTimeFromTimestamp((data.sys.sunset+data.timezone)-3600*2);
        document.getElementById("content").style.display = "block";
        document.getElementById("footer").style.display = "block";

        const parent = document.getElementById("forecast");
        removeChild(parent);
        showForecast();
        returnTime((data.timezone/3600)-1*2);

        let lat = data.coord.lat;
        let lon = data.coord.lon;
        let timezone = data.timezone
        showAirPollution(lat, lon, timezone);
      })
      .catch(error => {
        console.log(error);
        alert("Nie ma takiego miasta");
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
    const timezone = forecast.city.timezone;
    document.getElementById("forecast-city").innerHTML = forecast.city.name+", "+forecast.city.country;
      forecast.list.forEach(data => {
        const container = document.createElement('div');
        container.className = "forecast-container";

        const time = document.createElement('div');
        time.className = "forecast-time";
        let dateFormat = data.dt
        time.innerHTML = getWeekday(getFullDateFromTimestampFormat((dateFormat+timezone)-3600*2)) + " "+ getTimeFromTimestamp((dateFormat+timezone)-3600*2) + "<br />"+
        "<span style='font-size: 12px'>"+ getFullDateFromTimestamp((dateFormat+timezone)-3600*2) +"</span>";
        container.appendChild(time);

        const icon = document.createElement('img');
        icon.className = "icon-forecast";
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

        let rain = data.hasOwnProperty('rain') ? '<i class="fa-solid fa-cloud-rain"></i> '+data.rain['3h']+' mm/3h' : '<i class="fa-solid fa-cloud-rain"></i> 0 mm/3h';
        let snow = data.hasOwnProperty('snow') ? '<i class="fa-regular fa-snowflake"></i> '+data.snow['3h']+' mm/3h' : '<i class="fa-regular fa-snowflake"></i> 0 mm/3h';
        const forecastPop = document.createElement('div');
        forecastPop.className = "forecast-pop-info";
        forecastPop.innerHTML = "<div>Szansa opadów: "+Math.round((data.pop)*100)+" %</div>"+
        "<div class='pop'>"+ rain +"</div>"+
        "<div class='pop'>"+ snow +"</div>";
        container.appendChild(forecastPop);

        const forecastInfo = document.createElement('div');
        forecastInfo.className = "forecast-info";
        forecastInfo.innerHTML = "<p>Wiatr: "+Math.round(parseFloat(data.wind.speed)*(60*60)/1000)+" km/h</p>"+
        "<p>Ciśnienie: "+data.main.pressure+" hPa</p>"+
        "<p>Zachmurzenie: "+data.clouds.all+"%</p>"+
        "<p>Wilgotność: "+data.main.humidity+"%</p>";
        container.appendChild(forecastInfo);

        document.getElementById("forecast").appendChild(container);
        forecastBgColor();
    })
  })
  .catch(error => {
    console.log(error);
  });
}

const showAirPollution = (lat, lon, timezone) => {
  const url = "https://api.openweathermap.org/data/2.5/air_pollution?lat="+lat+"&lon="+lon+"&appid=YOURAPIKEY";
  fetch(url)
  .then((resp) => resp.json())
  .then(air => {
    air.list.forEach(data => {
      let aqi = data.main.aqi;
      const airPollution = document.getElementById("air-pollution").style;
      const iconAP = document.getElementById("icon-ap");
      if(aqi==1){
        airPollution.backgroundColor = "#79bc6a";
        iconAP.src = "images/icons-ap/1.png";
      }
      if(aqi==2){
        airPollution.backgroundColor = "#bbcf4c";
        iconAP.src  = "images/icons-ap/2.png";
      }
      if(aqi==3){
        airPollution.backgroundColor = "#eec20b";
        iconAP.src  = "images/icons-ap/3.png";
      }
      if(aqi==4){
        airPollution.backgroundColor = "#f29305";
        iconAP.src  = "images/icons-ap/4.png";
      }
      if(aqi==5){
        airPollution.backgroundColor = "#e8416f";
        iconAP.src  = "images/icons-ap/5.png";
      }
      document.getElementById("air-pollution-time").innerHTML = getTimeFromTimestamp((data.dt+timezone)-3600*2);
      document.getElementById("air-pollution-aqi").innerHTML = "<a href='https://en.wikipedia.org/wiki/Air_quality_index#CAQI' target='_blank'>AQI:</a> "+aqi;
    })
  })
  .catch(error => {
    console.log(error);
  });
}

const forecastBgColor = () =>{
  const containerColor = document.getElementsByClassName("forecast-container");
  const iconSrc = document.getElementsByClassName("icon-forecast");
  for(let i=0; i<iconSrc.length; i++){
    const sliceSrc = iconSrc[i].src.slice(35,36);
    if(sliceSrc=="d"){
      containerColor[i].style.backgroundColor = "#1ab2ff";
    } 
  }
}
const forecastWeather = document.getElementById("forecast-weather").style;
const currentWeather = document.getElementById("current-weather").style;
const chartWeather = document.getElementById("chart-weather").style;
const forecast = document.getElementById("forecast").style;
const footer = document.getElementById("footer").style;
const backWeather = document.getElementById("back-weather").style;
const backForecast = document.getElementById("back-forecast").style;

const showForecastContent = () => {
  const chart = document.getElementById("tempChart").style;
  document.body.style.width = "560px";
  document.body.style.height = "580px";
  document.body.style.transition = "0.2s"
  forecastWeather.display = "block";
  forecast.display = "block";
  backWeather.display = "block";
  chartWeather.display = "block";
  currentWeather.display = "none"
  footer.display = "none";
  backForecast.display = "none";
  chart.display = "none";
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

const showChartContent = () => {
  const chart = document.getElementById("tempChart").style;
  forecastIntoArray();
  document.body.style.height = "auto";
  forecast.display = "none";
  backWeather.display = "none";
  backForecast.display = "block";
  chartWeather.display = "none";
  chart.display = "block";
  createChart();
}
document.getElementById("chart-weather").onclick = showChartContent;

document.getElementById("back-forecast").onclick = showForecastContent;

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
    deleteBTN.innerHTML = '<i class="fa-solid fa-xmark"></i>'
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

//charts
let tempArray = new Array();
let dateArray = new Array();
let tempFeelsArray = new Array();
let maxTemp = 0;
const forecastIntoArray = () =>{
  tempArray.length = 0;
  dateArray.length = 0;
  tempFeelsArray.length = 0;
  const tempChart = document.getElementsByClassName("forecast-temp");
  const dateChart = document.getElementsByClassName("forecast-time");
  const tempFeelsChart = document.getElementsByClassName("forecast-temp-like");
  for(let i=0; i<tempChart.length; i++){
    tempArray.push(parseInt(tempChart[i].innerHTML))    
  }
  for(let i=0; i<dateChart.length; i++){
    let position = dateChart[i].innerHTML.search(":00");
    dateArray.push(dateChart[i].innerHTML.slice(0,position+3));
  }
  for(let i=0; i<tempFeelsChart.length; i++){
    tempFeelsArray.push(parseInt(tempFeelsChart[i].innerHTML));
  }
  maxTemp = Math.max(...tempArray);
}

const createChart = () => {
  const canvasRemove = document.getElementById("tempChart");
  if(canvasRemove){
    canvasRemove.remove();
  }
  const canvas = document.createElement("canvas");
  canvas.id = "tempChart";
  const parent = document.getElementById("forecast-weather");
  parent.appendChild(canvas);
  const canvasStyle = document.getElementById("tempChart");
  canvasStyle.height = 200;
  canvasStyle.style = "margin-top: 45px; display:inline;";

  const ctx = document.getElementById('tempChart').getContext('2d');
  const data = {
  labels: dateArray,
  datasets: [{
    label: 'Temperatura °C',
    data: tempArray,
    fill: true,
    backgroundColor: 'rgb(179, 0, 0, 0.3)',
    borderColor: '#e60000',
    borderWidth: 2,
    pointBackgroundColor: '#4d0000',
    pointBorderColor: '#4d0000',
    pointBorderWidth: 1,
    pointHoverBorderColor: '#000000',
    pointHoverBorderWidth: 3,
    pointHoverBackgroundColor: '#000000',
    tension: 0.6,
    },
    {
      label: 'Temp. odczuwalna °C',
      data: tempFeelsArray,
      fill: true,
      backgroundColor: 'rgb(0, 0, 230, 0.3)',
      borderColor: '#0000e6',
      borderWidth: 2,
      pointBackgroundColor: '#000066',
      pointBorderColor: '#000066',
      pointBorderWidth: 1,
      pointHoverBorderColor: '#000000',
      pointHoverBorderWidth: 3,
      pointHoverBackgroundColor: '#000000',
      tension: 0.6,
    }],
  };
  const tempChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      plugins: {
        tooltip: {
          backgroundColor: 'black',
          displayColors: false,
          bodyFontSize: 14,
          intersect: true
        },
        legend: {
          labels: {
            color: 'black'
          }
        },
      },
      scales: {
        x:{
          ticks: {
            maxTicksLimit: 16,
            color: 'black',
            minRotation: 0,
            maxRotation: 90
          },
        },
        y: {
          suggestedMin: 0,
          suggestedMax: maxTemp+10,
          ticks: {
            color: 'black',
            stepSize: 5
          }
        }
      }
    }
  });
}
Chart.defaults.plugins.legend.onHover = function() { 
  document.body.style.cursor = 'pointer'; 
};
Chart.defaults.plugins.legend.onLeave = function() { 
  document.body.style.cursor = 'default'; 
};