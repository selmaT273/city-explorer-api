'use strict';

const superagent = require('superagent');

function yelpHandler(request, response){
  console.log(request.query);
  const search_query = request.query.location;
  const yelpUrl = 'https://api.yelp.com/v3/businesses/search';
  superagent.get(yelpUrl)
    .set('Authorization', 'Bearer ' + process.env.YELP_KEY)
    .query({
      location: search_query,
    })
    .then(yelpResponse => {
      let yelpData = yelpResponse.body;
      let yelpResults = yelpData.businesses.map()
    })
}