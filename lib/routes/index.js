var Pantry = require('../models/pantry');

module.exports = function(app) {
  // GET home page.
  app.get('/', function(req, res) {res.render('index');});
}
