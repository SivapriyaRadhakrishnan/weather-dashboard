import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (inputCity) => {
    const searchCity = inputCity || city;
    if (!searchCity) return;
    try {
      setLoading(true);
      setError("");
      localStorage.setItem("city", searchCity);

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${searchCity}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name } = geoData.results[0];


      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=3&timezone=auto`
      );

      const data = await weatherRes.json();

      setWeather({
        city: name,
        temp: data.current.temperature_2m,
        wind: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
        condition: data.current.weather_code,
      });
      setForecast(data.daily);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherCondition = (code) => {
    if (code === 0) return "Sunny ☀️";
    if (code <= 3) return "Cloudy ☁️";
    if (code <= 63) return "Rainy 🌧️";
    return "Unknown";
  };
useEffect(() => {
  const savedCity = localStorage.getItem("city");
  if (savedCity) {
    setCity(savedCity);
  }
}, []);

useEffect(() => {
  if (city) {
    fetchWeather(city);
  }
}, [city]);
  return (
    <div className="container">
      <h1>Weather Dashboard 🌤️</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button onClick={() => fetchWeather(city)}>Search</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {weather && (
        <div className="card">
          <h2>{weather.city}</h2>
          <h1>{weather.temp}°C</h1>

          <p>{getWeatherCondition(weather.condition)}</p>  {/* 👈 ADD THIS */}

          <p>Wind: {weather.wind} km/h</p>
          <p>Humidity: {weather.humidity}%</p>
        </div>
      )}

      {forecast && (
        <div className="forecast">
          <h3>3-Day Forecast</h3>
          <div className="forecast-cards">
            {forecast.temperature_2m_max.map((max, i) => (
              <div className="forecast-card" key={i}>
                <p>Day {i + 1}</p>
                <p>Max: {max}°C</p>
                <p>Min: {forecast.temperature_2m_min[i]}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;