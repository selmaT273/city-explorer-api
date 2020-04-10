'use strict';

const superagent = require('superagent');
const client = require('../util/db');


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

async function locationHandler(request, response) {
    const city = request.query.city;
    const locationFromCache = await getLocationFromCache(city);
    if (locationFromCache.rowCount) {
        response.send(locationFromCache.rows[0]);
        return;
    }
    const url = 'https://us1.locationiq.com/v1/search.php';
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
            // errorHandler(err, request, response);
        });
}

function Location(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = parseFloat(geoData[0].lat);
    this.longitude = parseFloat(geoData[0].lon);
}

module.exports = locationHandler;
