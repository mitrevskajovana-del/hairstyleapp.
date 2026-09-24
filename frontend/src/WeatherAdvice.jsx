import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WeatherAdvice() {
  const [weather, setWeather] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=41.0319&longitude=21.3347&current=temperature_2m,wind_speed_10m,rain,precipitation,weather_code"
    )
      .then((res) => res.json())
      .then((data) => setWeather(data.current))
      .catch((err) => console.log(err));
  }, []);

  const getWeatherDescription = () => {
    if (!weather) return "";

    const code = weather.weather_code;

    if (code === 0) return "Clear sky";
    if ([1, 2, 3].includes(code)) return "Partly cloudy";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rainy";
    if ([71, 73, 75, 85, 86].includes(code)) return "Snowy";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";

    return "Unknown weather";
  };

  const getAdvice = () => {
    if (!weather) return "";

    if (weather.rain > 0 || weather.precipitation > 0) {
      return "Rainy weather: choose an updo hairstyle and avoid loose waves.";
    }

    if (weather.temperature_2m > 28) {
      return "Hot weather: choose a light hairstyle or soft waves.";
    }

    if (weather.wind_speed_10m > 20) {
      return "Windy weather: an updo hairstyle is recommended.";
    }

    return "Weather is suitable for any hairstyle.";
  };

  return (
    <div className="content">
      <h2
        onClick={() => navigate("/")}
        style={{
          cursor: "pointer",
          color: "#d4a373",
          marginBottom: "20px",
        }}
      >
        HAIR LUX
      </h2>

      <h1 style={{ color: "#d4a373" }}>🌤️ Weather Hair Advice</h1>
      <p className="subtext">
        External weather data used for hairstyle recommendations.
      </p>

      <div className="card">
        {weather ? (
          <>
            <h2>Bitola Weather</h2>
            <p>🌡️ Temperature: {weather.temperature_2m}°C</p>
            <p>💨 Wind speed: {weather.wind_speed_10m} km/h</p>
            <p>🌧️ Rain: {weather.rain} mm</p>
            <p>☔ Precipitation: {weather.precipitation} mm</p>
            <p>☁️ Weather: {getWeatherDescription()}</p>
            <p className="price">{getAdvice()}</p>
          </>
        ) : (
          <p>Loading weather...</p>
        )}
      </div>
    </div>
  );
}