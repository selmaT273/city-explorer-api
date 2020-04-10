'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// DB Connection Setup
if (!process.env.DATABASE_URL) {
  throw 'Missing DATABASE_URL';
}

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });


// Application Setup
const PORT = process.env.PORT || 3002;
const app = express();


app.use(cors());

app.get('/', (request, response) => {
  response.send('City Explorer Goes Here');
});

app.get('/location', locationHandler);


function getLocationFromCache(city) {
  const SQL = 'SELECT * FROM locations WHERE search_query = $1;';
  let values = [city];
  return client.query(SQL, values)
    .then(results => {
      return results;
    })
    .catch(err => {
      console.log(err);
    });
}

function setLocationInCache(city, location) {
  let setSQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *;`;
  let values = [location.search_query, location.formatted_query, location.latitude, location.longitude];
  return client.query(setSQL, values)
    .then(results => {
      console.log(results)
      return results;
    })
    .catch(err => {
      console.log(err);
    });
};

async function locationHandler(request, response){
  const city = request.query.city;
  const locationFromCache = await getLocationFromCache(city);
  if (locationFromCache.rowCount) {
    response.send(locationFromCache.rows[0]);
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

const weatherHandler = require('./modules/weather');
app.get('/weather', weatherHandler);


const trailsHandler = require('./modules/trails');
app.get('/trails', trailsHandler);


// Middleware to handle not found and errors
app.use(notFoundHandler);
app.use(errorHandler);

// Make sure the server is listening for requests
client.connect()
  .then(() => {
    console.log('PG Connected!');

    app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
  })
  .catch(err => {
    throw `PG error!: ${err.message}`;
  });



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







