import React, { useState, useEffect } from 'react';

function Weather(){
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        // Fetch IPinfo API for geolocation data
        const response = await fetch('https://ipinfo.io/json?token=4f99841f5a11e3');
        const data = await response.json();
        
        // Extract city from the response
        const userCity = data.city;
       
        // Set the city in the component state
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
        // Fetch weather data from OpenWeatherMap API
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=190ea9d85b1f047fa021258849f45371&units=metric`);
        const data = await response.json();
        
        // Set the weather data in the component state
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

  return (
    <div>
      <h2>{city}</h2>
      <p>Temperature: {weather.main.temp}°C</p>
      <p>Weather: {weather.weather[0].description}</p>
      <p>Humidity: {weather.main.humidity}%</p>
      
      {/* Add more weather details as needed */}
    </div>
  );
};



export default Weather;
