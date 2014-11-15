var Pantry = require('../models/pantry');
var extend = require('extend');

module.exports = function(app) {

  /*
   * GET pantries
   */

  app.get('/pantry', function(req, res) {
    if ('development' == app.get('env')){
      console.log('searching...', req.query);
    }

    Pantry.find({}, function(err, pantries) {
      if (err != null || pantries == null) {
        console.log("unable to find results", err, pantries);
        res.send('unable to find any pantries', 404);
      } else {
        res.send({pantries: pantries});
      }
    });
  });


  /*
   * GET a single pantry
   */

  app.get('/pantry/:id', function(req, res) {
    Pantry.findById( req.params.id, function(err, pantry) {
      if (err != null || pantry == null) {
        console.log("unable to find results", err, pantry);
        res.send('unable to find that pantry', 404);
      } else {
        res.send({pantry: pantry});
      }
    });
  });

  /*
   * PUT a single pantry
   */

  app.put('/pantry/:id', function(req, res) {
    Pantry.findById( req.params.id, function(err, pantry) {
      if (err != null || pantry == null) {
        console.log("unable to find results", err, pantry);
        res.send('unable to find that pantry', 404);
      } else {

        console.log(pantry);
        console.log(req.body);
        pantry = extend(pantry, req.body);
        console.log(pantry);
        pantry.save(function(err, pantry){
          if (err != null){
            console.log("error updating pantry", err, pantry);
            res.send("unable to update that pantry", 500);
          }else{
            res.send({pantry: pantry});
          }
        })
      }
    });
  });


}
