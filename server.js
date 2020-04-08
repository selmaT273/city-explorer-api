'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Application Setup
const PORT = process.env.PORT || 3002;
const app = express();


app.use(cors());

app.get('/', (request, response) => {
  response.send('City Explorer Goes Here');
});

app.get('/location', locationHandler);

const locationCache = {
  // "cedar rapids, ia": {display_name blah blah}
};

function getLocationFromCache(city) {
  const cacheEntry = locationCache[city];
  if (cacheEntry) {
    // Remove the cache if its older than 5 seconds
    // if(cacheEntry.cacheTime < Date.now() - 5000) {
    //   delete locationCache[city];
    //   return null;
    // }
    return cacheEntry.location;
  }

  return null;
}

function setLocationInCache(city, location) {
  locationCache[city] = {
    cacheTime: new Date(),
    location,
  };
  console.log('location cache update', locationCache);
}

function locationHandler(request, response){
  // const geoData = require('./data/geo.json');
  const city = request.query.city;
  const locationFromCache = getLocationFromCache(city);
  if (locationFromCache) {
    response.send(locationFromCache);
    return;
  }
  const url ='https://us1.locationiq.com/v1/search.php';
  superagent.get(url)
    .query({
      key: process.env.GEO_KEY,
      q: city,
      format: 'json'
    })
    .then(locationResponse => {
      let geoData = locationResponse.body;

      const location = new Location(city, geoData);
      setLocationInCache(city, location);
      response.send(location);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

app.get('/weather', weatherHandler);

function weatherHandler(request, response){
//  const weatherData = require('./data/darksky.json');
  //TODO: pull lat/lon out of request.query
  // const weatherResults = [];
  console.log(request.query);
  const weatherCity = request.query.search_query;
  const weatherUrl = 'https://api.weatherbit.io/v2.0/current';
  superagent.get(weatherUrl)
    .query({
      city: weatherCity,
      key: process.env.WEATHER_KEY,
      // format: 'json'
    })
    .then(weatherResponse => {
      let weatherData = weatherResponse.body;
      let weatherResults = weatherData.data.map(currentWeather => {
        return new Weather(currentWeather);
      });
      // weatherData.data.forEach(dailyWeather => {
      //   weatherResults.push(new Weather(dailyWeather));
      // });
      response.send(weatherResults);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

// Middleware to handle not found and errors
app.use(notFoundHandler);

app.use(errorHandler);

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));

function errorHandler(error, request, response, next){
  console.log(error);
  response.status(500).json({
    error: true,
    message: error.message,
  });
}

function notFoundHandler(request, response) {
  response.status(404).json({
    notFound: true,
  });
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = parseFloat(geoData[0].lat);
  this.longitude = parseFloat(geoData[0].lon);
}

function Weather(weatherData) {
  // this.search_query = weatherData.city_name;
  this.forecast = weatherData.weather.description;
  this.time = new Date (weatherData.ob_time).toDateString();
}
