
module.exports = function(app) {
  app.get('/info', function(req, res){
    res.render('info');
  });
}
