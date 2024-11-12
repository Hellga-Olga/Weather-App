const searchBtn = document.getElementById('search-btn');
const weatherWindow = document.getElementById('weather-window');
const backgroundImg = document.getElementById('photo-background');
const cityInput = document.getElementById('city-input');
const backgroundApiKey = config.BACKGROUND_API_KEY; // an image API key imported from config.js
const weatherApiKey = config.WEATHER_API_KEY; // a weather API key imported from config.js

// selects a random image url from the recieved data
function randomBackgroundImage(data) {
    const index = Math.floor(Math.random() * 20);
    const imgUrl = data.results[index].urls.regular;
    backgroundImg.style.backgroundImage = `url('${imgUrl}')`;
}

// sets up a background colour of the app
function noPhotoBackground() {
    backgroundImg.style.backgroundImage = "linear-gradient(to bottom right, pink, yellow, lightgreen)";
}

// determines the current season
function getSeason() {
    let season;
    const currentDate = new Date();
    if ([11, 0, 1].includes(currentDate.getMonth())) {
        season = "winter";
    } else if ([2, 3, 4].includes(currentDate.getMonth())) {
        season = "spring";
    } else if ([5, 6, 7].includes(currentDate.getMonth())) {
        season = "summer";
    } else {
        season = "autumn"
    };
    return season;
}

async function fetchWeather() {
    const city = cityInput.value;
        /* if input is empty or only spaces are entered, the input field is highligted,
        its contents are cleared, then function returns */
        if (city.trim() === "") {
            cityInput.style.backgroundColor = "coral";
            cityInput.value = "";
            return;
        }
        /* creates a url for a query ("q=") specified by the value of the "city" constant,
        resolving authorisation with "weatherApiKey" to the Openweathermap API */
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;
    try {
        weatherWindow.innerHTML = `<p class="loader"></p>`; // displays loader during fetching weather data
        const response = await fetch(url); // calling weather API
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json(); // parsing fully loaded weather data to json
        cityInput.style.backgroundColor = "aliceblue";
        displayWeather(data);
        fetchBackgroundPhoto(city);
    } catch (error) {
        // if API response failed, an error message is displayed
        weatherWindow.innerHTML = `<p>Error: ${error.message}</p>`
    } finally {
        cityInput.value = "";
    }
}

async function fetchBackgroundPhoto(input) {
    let query = input;
    if (query === "") {
        query = getSeason();
    }
    /* creates a url for 1 page of 20 objects for a query to the Unsplash API
    where query is specified by the "place" constant */
    const url = `https://api.unsplash.com/search/photos?page=1&per_page=20&query=${query}`;

    try {
        const response = await fetch(url, {
            headers: { // resolves authorisation in the Unsplash API
            'Authorization': `Client-ID ${backgroundApiKey}`
        }});
        if (!response.ok) {
            throw new Error("no photo found")
        }
        const data = await response.json();
        randomBackgroundImage(data); // applies an image to the background
        console.log(data)
    } catch (error) {
        noPhotoBackground(); // applies background colour if image API fails
        console.log(error.message);
    }
}

function displayWeather(data) {
    // retrieving weather data from the response
    const feels = data.main.feels_like;
    const tempCurrent = data.main.temp;
    const tempMax = data.main.temp_max;
    const tempMin = data.main.temp_min;
    const pressure = data.main.pressure;
    const description = data.weather[0].description;
    const wind = data.wind.speed;
    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    // rendering weather data in html
    weatherWindow.innerHTML = `
    <h3>Weather in ${data.name}, ${data.sys.country}</h3>
    <img src="${icon}" alt="${description}">
    <p>Current temperature: ${tempCurrent}</p>
    <p>Feels like ${feels}</p>
    <p>Maximum temperature: ${tempMax}</p>
    <p>Minimum temperature: ${tempMin}</p>
    <p>Wind speed: ${wind}</p>
    <p>Pressure: ${pressure}</p>`
}

searchBtn.addEventListener("click", fetchWeather);

cityInput.addEventListener("focus", () => {
    cityInput.style.backgroundColor = "white";
})

cityInput.addEventListener("blur", () => {
    cityInput.style.backgroundColor = "aliceblue";
})

// adds event that is triggered by pressing the Enter key
cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        fetchWeather();
    }
})

fetchBackgroundPhoto(cityInput.value);