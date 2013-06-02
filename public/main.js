$(document).ready(function() {
	var map = new GMaps({
	  div: '#mapView',
	  lat: 42.3583,
	  lng: -71.0603
	});


  //Geolocation
  GMaps.geolocate({
    success: function(position) {
           map.setCenter(position.coords.latitude, position.coords.longitude);
             },
    error: function(error) {
           alert('Geolocation failed: '+error.message);
           },
    not_supported: function() {
               alert("Your browser does not support geolocation");
               },
  });



  //Backbone
  console.log('hi'); 

  var Pantry  = Backbone.Model.extend({
    defaults: {
      id: "0",
      source: "GBFB",
      website: "www.something.com",
      email: "someone@something.com",
      site_name: "Some Pantry",
      address: "123 Street",
      city: "Boston",
      phone: "123-4567",
      zipcode: "12345",
      hours: [{}] //unclear data rep as of yet
      },
      initialize: function() {
        console.log('pantry init');
      }
    });

  var Pantries = Backbone.Collection.extend({
    defaults: {
      model: Pantry
    },
    model: Pantry,
    url: '/search',
    initialize: function() {
      console.log('all pantries init');
    }
  });

  var MyView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this,"render");
        console.log('view init');

        collection.bind('reset', this.render, this);
        collection.fetch(
          { success: function() {
            // fetch successfully completed
            console.log("post-fetch");
            console.log(collection.toJSON());
            collection.each(
              function(item, i) {console.log("lol"); addPantryToMap(item); } );
            }
          } 
          ).then( this.render() );
        console.log(collection.toJSON())
        console.log("finished init");
        this.render();
     },

    render: function() {
      var self = this;
      console.log('Render called.');
      console.log(collection.toJSON());
      collection.each(
        function(item, i) { console.log("lol"); addPantryToMap(item); }
      );
    }
  });

  collection = new Pantries();
  var myView = new MyView(); //?

  //Adding a Pantry
  function addPantryToMap(pantry){
    fullAddress = pantry.get("address") + " " + pantry.get("city") + " " + pantry.get("zipcode");
    console.log("adding " + fullAddress);

    GMaps.geocode({
      address: fullAddress,
      callback: function(results, status) {
        if (status == 'OK') {
            var latlng = results[0].geometry.location;
                map.setCenter(latlng.lat(), latlng.lng());
                  map.addMarker({
                        title: 'title',
                        lat: latlng.lat(),
                        lng: latlng.lng(),
                        infoWindow: {
                          content: "<p> needs data </p>"
                        }
                      });
                    }
          }
    });
  }

  //Examples
  //TODO remove
  map.addMarker({
    lat: 42.3583,
    lng: -71.0603,
    title: 'TestPantry',
    click: function(e) {
      alert('You clicked in this marker');
      // change infobox display
        },
    infoWindow: {
            content: '<p>Info about pantry</p>'
          }
  });


  GMaps.geocode({
    address: "351 Boylston St. Boston MA 02120",
    callback: function(results, status) {
      if (status == 'OK') {
          var latlng = results[0].geometry.location;
              map.setCenter(latlng.lat(), latlng.lng());
                map.addMarker({
                      title: 'Rice Sticks + Tea/Asian Food Pantry',
                      lat: latlng.lat(),
                      lng: latlng.lng(),
                      infoWindow: {
                        content: "<p> <p>Rice Sticks + Tea/Asian Food Pantry</p> <p>351 Boylston St. Boston MA 02120</p> <p>F: 5pm-7pm</p> </p>"
                      }
                    });
                  }
        }
  });

});

