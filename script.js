let unit = 'metric';  // Default unit is Celsius
let isDarkMode = false;

document.getElementById('search-button').addEventListener('click', getWeather);
document.getElementById('geo-button').addEventListener('click', getWeatherByGeolocation);
document.getElementById('unit-toggle').addEventListener('click', toggleUnits);
document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

// Geolocation Support
async function getWeatherByGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await getWeatherByCoordinates(lat, lon);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function getWeatherByCoordinates(lat, lon) {
    const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API Key
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    try {
        const [currentResponse, forecastResponse] = await Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)]);
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        displayWeatherInfo(currentData);
        displayForecast(forecastData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Fetch weather data based on the input city
async function getWeather() {
    const location = document.getElementById('location-input').value;
    if (!location) return;

    const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API Key
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location},ZA&appid=${apiKey}&units=${unit}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location},ZA&appid=${apiKey}&units=${unit}`;

    try {
        const [currentResponse, forecastResponse] = await Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)]);
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        displayWeatherInfo(currentData);
        displayForecast(forecastData);
        localStorage.setItem('lastCity', location);  // Save city to local storage
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function displayWeatherInfo(data) {
    const weatherInfo = document.getElementById('weather-info');
    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;  // Weather icon
    const condition = data.weather[0].main.toLowerCase();
    document.body.classList.remove('sunny', 'rainy', 'cloudy'); // Remove previous condition classes
    document.body.classList.add(condition); // Add new condition class for background

    weatherInfo.innerHTML = `
        <h2>${data.name} <img src="${icon}" alt="${data.weather[0].description}" /></h2>
        <p>Temperature: ${data.main.temp} °${unit === 'metric' ? 'C' : 'F'}</p>
        <p>Feels Like: ${data.main.feels_like} °${unit === 'metric' ? 'C' : 'F'}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <p>Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
        <p>Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
        <p>Description: ${data.weather[0].description}</p>
    `;
}

function displayForecast(data) {
    const forecastInfo = document.getElementById('forecast-info');
    forecastInfo.innerHTML = `
        <h3>7-Day Forecast</h3>
        <div class="chart-container">
            <canvas id="forecastChart"></canvas>
        </div>
    `;
    const labels = data.list.filter((item, index) => index % 8 === 0).map(item => item.dt_txt.split(' ')[0]);
    const temps = data.list.filter((item, index) => index % 8 === 0).map(item => item.main.temp);

    const ctx = document.getElementById('forecastChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperature (${unit === 'metric' ? '°C' : '°F'})`,
                data: temps,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        }
    });
}

function toggleUnits() {
    unit = unit === 'metric' ? 'imperial' : 'metric';
    document.getElementById('unit-toggle').textContent = unit === 'metric' ? '°C' : '°F';
    getWeather();  // Re-fetch weather data with new unit
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
}

document.getElementById('share-button').addEventListener('click', () => {
    const weatherData = document.getElementById('weather-info').innerText;
    const url = encodeURIComponent(window.location.href);
    const shareText = `Check out the weather: ${weatherData}\n${url}`;
    window.open(`https://twitter.com/share?text=${shareText}`, '_blank');
});

// On page load, check if a last searched city exists
const lastCity = localStorage.getItem('lastCity');
if (lastCity) {
    document.getElementById('location-input').value = lastCity;
    getWeather();
}
