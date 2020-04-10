'use strict';
const superagent = require('superagent');

function weatherHandler(request, response){
  console.log(request.query);
  const weatherCity = request.query.search_query;
  const weatherUrl = 'https://api.weatherbit.io/v2.0/forecast/daily';
  superagent.get(weatherUrl)
    .query({
      city: weatherCity,
      key: process.env.WEATHER_KEY,
    })
    .then(weatherResponse => {
      let weatherData = weatherResponse.body;
      let weatherResults = weatherData.data.map(currentWeather => {
        return new Weather(currentWeather);
      });
      response.send(weatherResults);
    })
    .catch(err => {
      console.log(err);
    //   errorHandler(err, request, response);
    });
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = new Date (weatherData.valid_date).toDateString();
}

module.exports = weatherHandler;
