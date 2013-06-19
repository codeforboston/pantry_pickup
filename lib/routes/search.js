var Pantry = require('../models/pantry');
var geocoder = require('geocoder');

module.exports = function(app) {

  /*
   * GET search page
   * later should be able to search by location, time
   */

  app.get('/search', function(req, res) {
    console.log('searching...', req.query);

    var search = function(lat, lng, radius) {
      var query = Pantry.find({loc: {$near: {$geometry: {type: "Point", coordinates: [lng,lat]}}, $maxDistance: 10000000}});
      query.exec(function(err, pantries) {
        if (err != null || pantries == null) {
          console.log("unable to find results", err, pantries);
          res.send('unable to find any pantries', 404);
        } else {
          res.send({pantries: pantries, loc: {latitude: lat, longitude: lng}, radius: radius});
        }
      });
    }
    var loc = req.query.location;
    if (loc == null) {
      res.send('location required', 500);
    } else if (loc.latitude != null && loc.longitude != null) {
      search(loc.latitude, loc.longitude);
    } else {
      geocoder.geocode(loc.term, function(err, data) {
        if (err != null || data == null || data.results == null || data.results[0] == null) {
          res.send('unable to geocode address', 500);
        } else {
          var location = data.results[0].geometry.location;
          search(location.lat, location.lng);
        }
      });
    }
  });

}

