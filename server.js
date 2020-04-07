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

function locationHandler(request, response){
  // const geoData = require('./data/geo.json');
  const city = request.query.city;
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
      response.send(location);
    })
    .catch(err => {
      console.log(err);
      // errorHandler(err, request, response);
    });
}

app.get('/weather', weatherHandler);

function weatherHandler(request, response){
  const weatherData = require('./data/darksky.json');
  //TODO: pull lat/lon out of request.query
  const weatherResults = [];
  weatherData.daily.data.forEach(dailyWeather => {
    weatherResults.push(new Weather(dailyWeather));
  });
  response.send(weatherResults);
}

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = parseFloat(geoData[0].lat);
  this.longitude = parseFloat(geoData[0].lon);
}

function Weather(weatherData) {
  this.forecast = weatherData.summary;
  this.time = new Date(weatherData.time * 1000);
}
