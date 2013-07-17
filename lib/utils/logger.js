module.exports = function() {
  var logger = require('winston');

  if(process.env.NODE_ENV === 'test') {
    logger.log = logger.info = logger.warn = function() {};
    //note: logger.error is not silenced
  }

  return logger;
}
