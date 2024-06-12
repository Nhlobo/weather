document.getElementById('search-button').addEventListener('click', getWeather);

async function getWeather() {
    const location = document.getElementById('location-input').value;
    const apiKey = '27590cdf19ad5bc53ef27ac7ec78ae64'; // Your OpenWeatherMap API key
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location},ZA&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location},ZA&appid=${apiKey}&units=metric`;

    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function displayCurrentWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = `
        <h2>${data.name}</h2>
        <p>Temperature: ${data.main.temp} °C</p>
        <p>Weather: ${data.weather[0].description}</p>
    `;
}

function displayForecast(data) {
    const forecastInfo = document.getElementById('forecast-info');
    forecastInfo.innerHTML = `
        <h3>5-Day Forecast</h3>
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
                label: 'Temperature (°C)',
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
