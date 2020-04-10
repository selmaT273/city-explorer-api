'use strict';

// Load Environment Variables from the .env file
const dotenv = require('dotenv');
dotenv.config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
// const superagent = require('superagent');
// const pg = require('pg');

// DB Connection Setup
// if (!process.env.DATABASE_URL) {
//   throw 'Missing DATABASE_URL';
// }

// const client = new pg.Client(process.env.DATABASE_URL);
// client.on('error', err => { throw err; });


// Application Setup
const PORT = process.env.PORT || 3002;
const app = express();


app.use(cors());

app.get('/', (request, response) => {
  response.send('City Explorer Goes Here');
});

const locationHandler = require('./modules/location');
app.get('/location', locationHandler);

const weatherHandler = require('./modules/weather');
app.get('/weather', weatherHandler);


const trailsHandler = require('./modules/trails');
app.get('/trails', trailsHandler);

const yelpHandler = require('./modules/yelp');
app.get('/yelp', yelpHandler);


// Middleware to handle not found and errors
app.use(notFoundHandler);
app.use(errorHandler);

// Make sure the server is listening for requests
const client = require('./util/db');
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









