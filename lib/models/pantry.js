var mongoose = require('mongoose');

var pantrySchema = new mongoose.Schema({
  source: String,
  site_name: String,
  address: String,
  city: String,
  zipcode: String,
  hours: Array,
  website: String,
  phone: String,
  email: String,
  details: String
});

module.exports = mongoose.model('Pantry', pantrySchema);