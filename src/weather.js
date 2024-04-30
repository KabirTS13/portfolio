// Weather.js
import React, { useState, useEffect } from 'react';

function Weather(){
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const response = await fetch('https://ipinfo.io/json?token=4f99841f5a11e3');
        const data = await response.json();
        const userCity = data.city;
        setCity(userCity);
      } catch (error) {
        console.error('Error fetching city:', error);
      }
    };

    fetchCity();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!city) {
            return;
        }
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=190ea9d85b1f047fa021258849f45371&units=metric`);
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeather();
  }, [city]);

  if (!weather) {
    return <div>Loading...</div>;
  }

  const iconCode = weather.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

  return (
    <div className="flex flex-col items-center justify-center h-80 w-1.5/5 bg-gray-800 p-6 m-10 rounded-full shadow-md hover:shadow-lg transition duration-300 ml-auto mr-10">
        <h2 className="text-2xl font-bold text-white mb-4">{city}</h2>
        <img src={iconUrl} alt="Weather icon" className="w-20 h-20" />
        <p className="text-lg mt-2 text-white">Temperature: {weather.main.temp}°C</p>
        <p className="text-lg text-white">Weather: {weather.weather[0].description}</p>
        <p className="text-lg text-white">Humidity: {weather.main.humidity}%</p>
    </div>
  );
};

export default Weather;
