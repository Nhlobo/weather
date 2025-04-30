// Unit Toggle: Global variable to track selected unit
let unit = 'metric'; // Default to Celsius

// Add event listener for search button
document.getElementById('search-button').addEventListener('click', getWeather);

// Add event listener for geolocation button
document.getElementById('geo-button').addEventListener('click', getWeatherByGeolocation);

// Add event listener for unit toggle
document.getElementById('toggle-units').addEventListener('click', toggleUnits);

// Add event listener for share button
document.getElementById('share-button').addEventListener('click', showShareModal);

// Add event listener for close button in the share modal
document.getElementById('close-modal').addEventListener('click', closeShareModal);

// Event listeners for social media sharing icons
document.getElementById('whatsapp-icon').addEventListener('click', () => handleShare('whatsapp'));
document.getElementById('twitter-icon').addEventListener('click', () => handleShare('twitter'));
document.getElementById('facebook-icon').addEventListener('click', () => handleShare('facebook'));
document.getElementById('linkedin-icon').addEventListener('click', () => handleShare('linkedin'));

// Show the Share Modal
function showShareModal() {
    document.getElementById('share-modal').style.display = 'block';
}

// Close the Share Modal
function closeShareModal() {
    document.getElementById('share-modal').style.display = 'none';
}

// Handle social media sharing logic
function handleShare(platform) {
    const location = document.getElementById('location-input').value;
    const temperature = document.getElementById('temperature').textContent;
    const feelsLike = document.getElementById('feels-like').textContent;
    const humidity = document.getElementById('humidity').textContent;
    const windSpeed = document.getElementById('wind-speed').textContent;
    const weatherDescription = document.getElementById('weather-info').querySelector('p:nth-child(7)').textContent;

    // Build the message
    const message = `Weather in ${location}:\nTemperature: ${temperature}, Feels Like: ${feelsLike}, Humidity: ${humidity}, Wind Speed: ${windSpeed}, Weather: ${weatherDescription}`;

    let shareUrl = '';

    switch (platform) {
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(message)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(message)}`;
            break;
        default:
            break;
    }

    // Open the respective social media platform with the message
    window.open(shareUrl, '_blank');

    // Close the share modal after 2 seconds
    setTimeout(() => {
        closeShareModal();
    }, 2000);
}

// Fetch and display weather data
async function getWeather() {
    const location = document.getElementById('location-input').value;
    const apiKey = '27590cdf19ad5bc53ef27ac7ec78ae64'; // OpenWeatherMap API key
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location},ZA&appid=${apiKey}&units=${unit}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location},ZA&appid=${apiKey}&units=${unit}`;

    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        displayHourlyForecast(forecastData); // Display hourly forecast
        getAirQuality(currentData.coord.lat, currentData.coord.lon); // Get air quality data
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Get weather by geolocation
async function getWeatherByGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiKey = '27590cdf19ad5bc53ef27ac7ec78ae64'; // OpenWeatherMap API key
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;

            try {
                const [currentResponse, forecastResponse] = await Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)]);
                const currentData = await currentResponse.json();
                const forecastData = await forecastResponse.json();

                displayCurrentWeather(currentData);
                displayForecast(forecastData);
                displayHourlyForecast(forecastData); // Display hourly forecast
                getAirQuality(currentData.coord.lat, currentData.coord.lon); // Get air quality data
            } catch (error) {
                console.error('Error fetching weather data by geolocation:', error);
            }
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Toggle between Celsius and Fahrenheit
function toggleUnits() {
    unit = unit === 'metric' ? 'imperial' : 'metric'; // Toggle between Celsius and Fahrenheit
    const unitText = unit === 'metric' ? '°C' : '°F';
    document.getElementById('toggle-units').textContent = `Units: ${unitText}`;

    // Re-fetch weather data based on the new unit
    const location = document.getElementById('location-input').value;
    if (location) {
        getWeather();
    }
}

// Display current weather data
function displayCurrentWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    const temp = data.main.temp;
    const feelsLike = data.main.feels_like;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    const weatherDescription = data.weather[0].description;

    // Set weather condition and background color dynamically
    const weatherCondition = temp <= 15 ? 'Cold' : temp <= 25 ? 'Warm' : 'Hot';
    const background = temp <= 15 ? 'cold.jpg' : temp <= 25 ? 'warm.jpg' : 'hot.jpg'; // Example backgrounds

    // Update the weather info on the page
    weatherInfo.innerHTML = `
        <h2>${data.name}</h2>
        <p>Temperature: ${temp} °C</p>
        <p>Feels Like: ${feelsLike} °C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
        <p>Sunrise: ${sunrise}</p>
        <p>Sunset: ${sunset}</p>
        <p>Weather: ${weatherDescription}</p>
        <p>Condition: ${weatherCondition}</p>
    `;

    // Dynamically change the background based on weather condition
    document.body.style.backgroundImage = `url('images/${background}')`;
}

// Display 5-day forecast data
function displayForecast(data) {
    const forecastInfo = document.getElementById('forecast-info');
    forecastInfo.innerHTML = `
        <h3>5-Day Forecast</h3>
        <div class="chart-container">
            <canvas id="forecastChart"></canvas>
        </div>
    `;

    // Prepare the data for the chart
    const labels = data.list.filter((item, index) => index % 8 === 0).map(item => item.dt_txt.split(' ')[0]);
    const temps = data.list.filter((item, index) => index % 8 === 0).map(item => item.main.temp);

    // Create the chart for the 5-day temperature forecast
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
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Display hourly forecast data
function displayHourlyForecast(data) {
    const hourlyForecast = document.getElementById('hourly-forecast');
    hourlyForecast.innerHTML = '<h3>Hourly Forecast</h3>';

    const hourlyData = data.list.slice(0, 8); // Get the first 8 hours of data
    hourlyData.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString();
        const temp = item.main.temp;
        const weatherDescription = item.weather[0].description;

        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <p>${time}</p>
            <p>${temp} °C</p>
            <p>${weatherDescription}</p>
        `;
        hourlyForecast.appendChild(hourlyItem);
    });
}

// Fetch and display air quality data
async function getAirQuality(lat, lon) {
    const apiKey = '27590cdf19ad5bc53ef27ac7ec78ae64'; // OpenWeatherMap API key
    const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const response = await fetch(airQualityUrl);
        const data = await response.json();
        displayAirQuality(data);
    } catch (error) {
        console.error('Error fetching air quality data:', error);
    }
}

// Display air quality data
function displayAirQuality(data) {
    const airQualityInfo = document.getElementById('air-quality-info');
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    airQualityInfo.innerHTML = `
        <h3>Air Quality Index (AQI)</h3>
        <p>AQI: ${aqi}</p>
        <p>CO: ${components.co} μg/m³</p>
        <p>NO2: ${components.no2} μg/m³</p>
        <p>O3: ${components.o3} μg/m³</p>
        <p>SO2: ${components.so2} μg/m³</p>
        <p>PM2.5: ${components.pm2_5} μg/m³</p>
        <p>PM10: ${components.pm10} μg/m³</p>
    `;
}

// Favorite locations functionality
let favoriteLocations = JSON.parse(localStorage.getItem('favoriteLocations')) || [];

document.getElementById('add-favorite').addEventListener('click', () => {
    const location = document.getElementById('location-input').value;
    if (location && !favoriteLocations.includes(location)) {
        favoriteLocations.push(location);
        localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
        displayFavoriteLocations();
    }
});

function displayFavoriteLocations() {
    const favoriteLocationsDiv = document.getElementById('favorite-locations');
    favoriteLocationsDiv.innerHTML = '<h3>Favorite Locations</h3>';

    favoriteLocations.forEach(location => {
        const favoriteItem = document.createElement('div');
        favoriteItem.classList.add('favorite-item');
        favoriteItem.innerHTML = `
            <p>${location}</p>
            <button class="remove-favorite" data-location="${location}">Remove</button>
        `;
        favoriteLocationsDiv.appendChild(favoriteItem);
    });

    document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', (event) => {
            const locationToRemove = event.target.getAttribute('data-location');
            favoriteLocations = favoriteLocations.filter(location => location !== locationToRemove);
            localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
            displayFavoriteLocations();
        });
    });
}

displayFavoriteLocations();
