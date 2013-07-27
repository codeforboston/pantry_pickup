// module dependencies
var express = require('express')
  , path = require('path')
  , config = require('config');

var app = express();

// all environments
app.set('port', process.env.PORT || config.app.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/../public/favicon.ico'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '../public')));
app.log = require(path.join(__dirname,'/utils/logger'))();

// development only
var dev = 'production' != app.get('env');// good enough
if (dev) {
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
}

require('./routes/index')(app);
require('./routes/search')(app);
require('./routes/info')(app);
require('./routes/debug')(app);

var mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE || config.app.database);
var db = mongoose.connection;
db.on('error', function(){
  app.log.error('Could not connect to Mongo :/')
});
if (dev) db.once('open', function(){app.log.info('Mongo connected!');});

app.listen(app.get('port'), function(){
  if (dev) app.log.info('Express server listening on port ' + app.get('port'));
});
