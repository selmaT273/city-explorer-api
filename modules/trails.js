'use strict';

const superagent = require('superagent');

function trailsHandler(request, response){
  console.log(request.query);
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const trailsUrl = 'https://www.hikingproject.com/data/get-trails';
  superagent.get(trailsUrl)
    .query({
      key: process.env.TRAILS_KEY,
      lat: lat,
      lon: lon,
    })
    .then(trailsResponse => {
      let trailsData = trailsResponse.body;
      let trailsResults = trailsData.trails.map(currentTrails => {
        return new Trails(currentTrails);
      });
      response.send(trailsResults);
    })
    .catch(err => {
      console.log(err);
    //   errorHandler(err, request, response);
    });
}

function Trails(trailsData) {
  this.name = trailsData.name;
  this.location = trailsData.location;
  this.length = trailsData.length;
  this.stars = trailsData.stars;
  this.star_votes = trailsData.starVotes;
  this.summary = trailsData.summary;
  this.trail_url = trailsData.url;
  this.conditions = trailsData.conditionDetails;
  this.condition_date = new Date (trailsData.conditionDate).toDateString();
}

module.exports = trailsHandler;

