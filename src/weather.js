import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from "./firebase"; // Ensure you have Firebase initialized in your app

function Weather() {
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [weather, setWeather] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const coordinatesRef = collection(db, 'coordinates'); // Reference to the "coordinates" collection

  useEffect(() => {
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Set coordinates in the state
            setCoordinates({ lat, lon });

            // Store coordinates in Firebase
            addCoordinatesToFirestore(lat, lon);
          },
          (error) => {
            console.error('Error fetching location:', error);
            setErrorMessage('Unable to retrieve your location');
          }
        );
      } else {
        setErrorMessage('Geolocation is not supported by this browser');
      }
    };

    fetchLocation();
  }, []);

  // Function to store coordinates in Firestore
  const addCoordinatesToFirestore = async (lat, lon) => {
    try {
      await addDoc(coordinatesRef, {
        latitude: lat,
        longitude: lon,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error saving coordinates to Firestore:', error);
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!coordinates.lat || !coordinates.lon) {
          return;
        }
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=190ea9d85b1f047fa021258849f45371&units=metric`);
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeather();
  }, [coordinates]);

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }

  if (!weather) {
    return <div>Loading...</div>;
  }

  const iconCode = weather.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

  return (
    <div className="flex flex-col items-center justify-center h-80 w-2/5 bg-gray-800 p-6 m-10 rounded-lg shadow-md hover:shadow-lg transition duration-300 ml-auto mr-10">
      <h2 className="text-2xl font-bold text-white mb-4">{weather.name}</h2>
      <img src={iconUrl} alt="Weather icon" className="w-20 h-20" />
      <p className="text-lg mt-2 text-white">Temperature: {weather.main.temp}°C</p>
      <p className="text-lg text-white">Weather: {weather.weather[0].description}</p>
      <p className="text-lg text-white">Humidity: {weather.main.humidity}%</p>
    </div>
  );
}

export default Weather;
