var User = require('../lib/models/user'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    flash = require('connect-flash');

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { 
      console.log('there was a error: ', err);
      return done(err); 
    }
    if (!user) { 
      return done(null, false, { message: 'Unknown user ' + username }); 
    }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
