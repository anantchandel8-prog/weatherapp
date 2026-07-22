// ==========================================================
// SkyCast Weather App
// Clean Version - Part 1
// ==========================================================

// =======================
// WeatherAPI Key
// =======================

const API_KEY = "5f3102bda1d4450d9fd184940261907";

// =======================
// WeatherAPI URL
// =======================

const BASE_URL =
"https://api.weatherapi.com/v1/forecast.json";

// =======================
// DOM Elements
// =======================

const cityInput =
document.getElementById("cityInput");

const searchBtn =
document.getElementById("searchBtn");

const locationBtn =
document.getElementById("locationBtn");

const cityName =
document.getElementById("cityName");

const temperature =
document.getElementById("temperature");

const condition =
document.getElementById("condition");

const weatherIcon =
document.getElementById("weatherIcon");

const humidity =
document.getElementById("humidity");

const wind =
document.getElementById("wind");

const pressure =
document.getElementById("pressure");

const feels =
document.getElementById("feels");

const visibility =
document.getElementById("visibility");

const uv =
document.getElementById("uv");

const cloud =
document.getElementById("cloud");

const country =
document.getElementById("country");

const dateTime =
document.getElementById("dateTime");

const forecastContainer =
document.getElementById("forecast");

const aqi =
document.getElementById("aqi");

const loading =
document.getElementById("loading");

const errorBox =
document.getElementById("error");

// =======================
// Loading Functions
// =======================

function showLoading(){

    if(loading){

        loading.style.display = "block";

    }

}

function hideLoading(){

    if(loading){

        loading.style.display = "none";

    }

}

// =======================
// Error Functions
// =======================

function showError(message){

    if(errorBox){

        errorBox.style.display = "block";

        errorBox.innerHTML = message;

    }

}

function hideError(){

    if(errorBox){

        errorBox.style.display = "none";

        errorBox.innerHTML = "";

    }

}

// =======================
// Search History
// =======================

function saveHistory(city){

    let history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];

    if(!history.includes(city)){

        history.unshift(city);

    }

    history = history.slice(0,8);

    localStorage.setItem(

        "history",

        JSON.stringify(history)

    );

}

// =======================
// Dynamic Background
// =======================

function updateBackground(data){

    const weather =
    data.current.condition.text.toLowerCase();

    const isDay =
    data.current.is_day;

    if(weather.includes("rain")){

        document.body.style.background =
        "linear-gradient(135deg,#3a6073,#16222A)";

    }

    else if(weather.includes("cloud")){

        document.body.style.background =
        "linear-gradient(135deg,#757F9A,#D7DDE8)";

    }

    else if(weather.includes("snow")){

        document.body.style.background =
        "linear-gradient(135deg,#E6DADA,#274046)";

    }

    else if(isDay){

        document.body.style.background =
        "linear-gradient(135deg,#4facfe,#00f2fe)";

    }

    else{

        document.body.style.background =
        "linear-gradient(135deg,#141E30,#243B55)";

    }

}

// =======================
// AQI Status
// =======================

function getAQIStatus(index){

    switch(index){

        case 1:
            return "Good";

        case 2:
            return "Moderate";

        case 3:
            return "Unhealthy for Sensitive Groups";

        case 4:
            return "Unhealthy";

        case 5:
            return "Very Unhealthy";

        case 6:
            return "Hazardous";

        default:
            return "Unknown";

    }

}// ==========================================================
// Get Weather Data
// ==========================================================

async function getWeather(query){

    showLoading();

    hideError();

    try{

        const response = await fetch(

            `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&days=5&aqi=yes&alerts=no`

        );

        const data = await response.json();

        if(data.error){

            throw new Error(data.error.message);

        }

        // Save Search
        saveHistory(data.location.name);

        // Change Background
        updateBackground(data);

        // =======================
        // Current Weather
        // =======================

        cityName.textContent = data.location.name;

        country.textContent = data.location.country;

        dateTime.textContent = data.location.localtime;

        temperature.textContent =
            Math.round(data.current.temp_c) + "°C";

        condition.textContent =
            data.current.condition.text;

        weatherIcon.src =
            "https:" + data.current.condition.icon;

        weatherIcon.alt =
            data.current.condition.text;

        humidity.textContent =
            data.current.humidity + "%";

        wind.textContent =
            data.current.wind_kph + " km/h";

        pressure.textContent =
            data.current.pressure_mb + " mb";

        feels.textContent =
            Math.round(data.current.feelslike_c) + "°C";

        visibility.textContent =
            data.current.vis_km + " km";

        uv.textContent =
            data.current.uv;

        cloud.textContent =
            data.current.cloud + "%";

        // =======================
        // AQI
        // =======================

        if(aqi && data.current.air_quality){

            const index =
                Number(data.current.air_quality["us-epa-index"]);

            aqi.innerHTML = `

                <strong>${index}</strong>

                <br>

                <small>${getAQIStatus(index)}</small>

            `;

        }

        // =======================
        // Forecast
        // =======================

        renderForecast(

            data.forecast.forecastday

        );

    }

    catch(err){

        showError(err.message);

        console.error(err);

    }

    finally{

        hideLoading();

    }

}// ==========================================================
// Search Weather
// ==========================================================

function searchWeather(){

    const city = cityInput.value.trim();

    if(city === ""){

        showError("Please enter a city name.");

        cityInput.focus();

        return;

    }

    getWeather(city);

}

// ==========================================================
// Search Button
// ==========================================================

searchBtn.addEventListener("click", function(){

    searchWeather();

});

// ==========================================================
// Enter Key Search
// ==========================================================

cityInput.addEventListener("keydown", function(event){

    if(event.key === "Enter"){

        searchWeather();

    }

});

// ==========================================================
// Hide Error While Typing
// ==========================================================

cityInput.addEventListener("input", function(){

    hideError();

});

// ==========================================================
// Get Current Location
// ==========================================================

function getCurrentLocation(){

    if(!navigator.geolocation){

        showError("Geolocation is not supported.");

        return;

    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        function(position){

            const latitude = position.coords.latitude;

            const longitude = position.coords.longitude;

            getWeather(`${latitude},${longitude}`);

        },

        function(error){

            hideLoading();

            switch(error.code){

                case error.PERMISSION_DENIED:

                    showError("Location permission denied.");

                    break;

                case error.POSITION_UNAVAILABLE:

                    showError("Location unavailable.");

                    break;

                case error.TIMEOUT:

                    showError("Location request timed out.");

                    break;

                default:

                    showError("Unable to get current location.");

            }

        }

    );

}

// ==========================================================
// Location Button
// ==========================================================

locationBtn.addEventListener("click", function(){

    getCurrentLocation();

});// ==========================================================
// Render 5-Day Forecast
// ==========================================================

function renderForecast(forecastDays){

    // Check container
    if(!forecastContainer){

        return;

    }

    // Remove old forecast
    forecastContainer.innerHTML = "";

    forecastDays.forEach(function(day){

        // Create Card
        const card = document.createElement("div");

        card.className = "forecast-card";

        // Convert Date → Day Name

        const date = new Date(day.date);

        const dayName = date.toLocaleDateString(

            "en-US",

            {

                weekday:"short"

            }

        );

        card.innerHTML = `

            <h3>${dayName}</h3>

            <img
                src="https:${day.day.condition.icon}"
                alt="${day.day.condition.text}"
            >

            <h4>

                ${Math.round(day.day.avgtemp_c)}°C

            </h4>

            <p>

                ${day.day.condition.text}

            </p>

            <small>

                H:
                ${Math.round(day.day.maxtemp_c)}°

                |

                L:
                ${Math.round(day.day.mintemp_c)}°

            </small>

        `;

        forecastContainer.appendChild(card);

    });

}

// ==========================================================
// Load Search History
// ==========================================================

function loadHistory(){

    const history =

        JSON.parse(

            localStorage.getItem("history")

        ) || [];

    console.log("Recent Searches");

    console.table(history);

}// ==========================================================
// App Initialization
// ==========================================================

function initializeApp() {

    hideLoading();

    hideError();

    // Load previous search history
    loadHistory();

    // Show default city on first load
    getWeather("New Delhi");

}

// ==========================================================
// Window Load
// ==========================================================

window.addEventListener("load", initializeApp);

// ==========================================================
// Utility Function
// ==========================================================

function clearSearchBox(){

    cityInput.value = "";

}

// ==========================================================
// Optional Refresh Button Support
// ==========================================================

const refreshBtn = document.getElementById("refreshBtn");

if(refreshBtn){

    refreshBtn.addEventListener("click", function(){

        const city = cityName.textContent.trim();

        if(city !== ""){

            getWeather(city);

        }

    });

}

// ==========================================================
// Auto Focus
// ==========================================================

if(cityInput){

    cityInput.focus();

}

// ==========================================================
// End of SkyCast Weather App
// ==========================================================

console.log("SkyCast Weather App Loaded Successfully.");