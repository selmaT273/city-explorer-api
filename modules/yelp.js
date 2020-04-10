'use strict';

const superagent = require('superagent');

function yelpHandler(request, response){
  console.log(request.query);
  const restaurants = request.query.restaurants;
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const yelpUrl = 'https://api.yelp.com/v3/businesses/search';
  superagent.get(yelpUrl)
    .set('Authorization', 'Bearer ' + process.env.YELP_KEY)
    .query({
      category: restaurants,
      latitude: lat,
      longitude: lon,
    })
    .then(yelpResponse => {
      let yelpData = yelpResponse.body;
      let yelpResults = yelpData.businesses.map(currentYelp => {
        return new Yelp(currentYelp);
      });
      response.send(yelpResults);
    })
    .catch(err => {
      console.log(err);
    });
}

function Yelp(yelpData) {
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price = yelpData.price;
  this.rating = yelpData.rating;
  this.url = yelpData.url;
}

module.exports = yelpHandler;
