'use strict';

function movieHandler(request, response) {
  let movies = [];
  response.send(movies);
}

module.exports = movieHandler;
