var mongoose = require('mongoose');

var pantrySchema = new mongoose.Schema({
  source: String,
  site_name: String,
  address: String,
  city: String,
  zipcode: String,
  loc: {type: String, coordinates:[]},
  hours: Array,
  website: String,
  phone: String,
  email: String,
  details: String,
  timestamp: String,
  food_donations_accepted:Boolean,
  cannot_accept: Array,
  food_needs:Array,
  volunteer_should_contact:Boolean,
  policies:Array
});

module.exports = mongoose.model('Pantry', pantrySchema);
