var passport = require('passport'),
    pass = require('../../config/passport_conf');

module.exports = function(app) {
  app.get('/login', function(req, res) {
    console.log(req.user);
    console.log(req.session);
    res.render('login', { user: req.user, message: req.flash('error')});
  });
  
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.post('/login', passport.authenticate('local', 
        { 
          successRedirect: '/',
          failureRedirect: '/login',
          failureFlash: true 
        }));

  app.get('/profile', ensureAuthenticated, function(req, res){
    res.render('profile', { username: req.user.username});
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
      res.redirect('/login')
  }
}
