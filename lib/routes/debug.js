module.exports = function(app) {
  app.get('/debug', function(req, res){
    res.render('index');
  });
}
