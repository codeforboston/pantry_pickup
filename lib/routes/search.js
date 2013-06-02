var Pantry = require('../models/pantry')

module.exports = function(app) {
  
  /*
   * GET search page
   * later should be able to search by location, time
   */

  app.get('/search', function(req, res) {
    console.log('searching...', req.query);
    Pantry.find(function(err, pantries) {
      if (err != null || pantries == null) {
        res.send('unable to find any pantries', 404);
      } else {
        res.render('search', {
          pantries: pantries
        });
      }
    });
  });

}

