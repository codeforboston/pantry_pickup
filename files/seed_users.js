var mongoose = require('mongoose'),
    config = require('config'),
    User = require('../lib/models/user'); 

mongoose.connect(process.env.DATABASE || config.app.database);
var db = mongoose.connection;
db.on('error', function(){
  app.log.error('Could not connect to Mongo :/')
});
db.once('open', function(){
  console.log('Mongo connected!');

  var user = new User({ username: 'bob', email: 'bob@example.com', password: 'secret' });
  user.save(function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log('user: ' + user.username + " saved.");
    }
    mongoose.disconnect();
  });
});
