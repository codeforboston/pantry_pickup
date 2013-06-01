var Pantry = require('../models/pantry')

module.exports = function(app) {
  
  /*
   * GET home page.
   */

  app.get('/', function(req, res) {
    Pantry.find(function(err, pantries) {
      if (err != null || pantries == null) {
        res.send('unable to find any pantries', 404);
      } else {
        res.render('index', {
          pantries: pantries
        });
      }
    });
  });
  
}

