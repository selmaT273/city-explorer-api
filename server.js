'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT || 3000;
const app = express();


app.use(cors());

app.get('/', (request, response) => {
  response.send('City Explorer Goes Here');
});

app.get('/location', locationHandler);

function locationHandler(request, response){
  const geoData = require('./data/geo.json');
  const city = request.query.city;
  const location = new Location(city, geoData);
  response.send(location);
}


// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = parseFloat(geoData[0].lat);
  this.longitude = parseFloat(geoData[0].lon);
}
