var Pantry = require('../models/pantry');
var extend = require('extend');

module.exports = function(app) {

  /*
   * GET pantries
   */

  app.get('/api/pantry', function(req, res) {
    if ('development' == app.get('env')){
      console.log('searching...', req.query);
    }

    Pantry.find({}, function(err, pantries) {
      if (err != null || pantries == null) {
        console.log("unable to find results", err, pantries);
        res.send('unable to find any pantries', 404);
      } else {
        res.send({pantries: pantries}, 200);
      }
    });
  });


  /*
   * GET a single pantry
   */

  app.get('/api/pantry/:id', function(req, res) {
    Pantry.findById( req.params.id, function(err, pantry) {
      if (err != null || pantry == null) {
        console.log("unable to find results", err, pantry);
        res.send('unable to find that pantry', 404);
      } else {
        res.send({pantry: pantry}, 200);
      }
    });
  });

  /*
   * POST a single pantry
   */

  app.post('/api/pantry', function(req, res) {
    console.log(req.body);
    new Pantry( req.body).save(function(err, pantry) {
      if (err != null || pantry == null) {
        console.log("unable to create pantry", err, pantry);
        res.send('unable to create a pantry', 500);
      } else {
        res.send({pantry: pantry}, 200);
      }
    });
  });


  /*
   * PUT a single pantry
   */

  app.put('/api/pantry/:id', function(req, res) {
    Pantry.findById( req.params.id, function(err, pantry) {
      if (err != null || pantry == null) {
        console.log("unable to find results", err, pantry);
        res.send('unable to find that pantry', 404);
      } else {

        pantry = extend(pantry, req.body);
        console.log(pantry);
        pantry.save(function(err, pantry){
          if (err != null){
            console.log("error updating pantry", err, pantry);
            res.send("unable to update that pantry", 500);
          }else{
            res.send({pantry: pantry}, 200);
          }
        })
      }
    });
  });


  /*
   * DELETE a single pantry
   */

  app.delete('/api/pantry/:id', function(req, res) {
    Pantry.findById( req.params.id, function(err, pantry) {
      if (err != null || pantry == null) {
        console.log("unable to find results", err, pantry);
        res.send('unable to find that pantry', 404);
      } else {

        pantry.remove(function(err, pantry){
          if (err != null){
            console.log("error deleting that pantry", err, pantry);
            res.send("unable to delete that pantry", 500);
          }else{
            res.send({message: "pantry has been deleted"}, 204);
          }
        })
      }
    });
  });

}
