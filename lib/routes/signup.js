var User = require('../models/user');

module.exports = function(app) {

  app.get('/signup', function(req, res) {
    res.render('signup');
  });
  
  app.post('/signup', function(req, res){
    var user = new User({ username: req.body.username, email: req.body.email,
        password: req.body.password });
    user.save(function(err) {
      if(err) {
        console.log(err);
        //TODO (Jose) make this error more user friendly
        res.render('signup', { user: req.user, message: err });
      } else {
        console.log('user: ' + user.username + " saved.");
        res.render('profile', { username: user.username }); 
      }
    });
  });

}
