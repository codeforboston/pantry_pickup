window.PantryPickup = {};

$(document).ready(function() {
  PantryPickup.PantryCollection = Backbone.Collection.extend({
    url: '/search',
    search: function(location, radius) {
      this.fetch({data: {location: location, radius: radius}, reset: true});
    }
  });
  PantryPickup.PantryListingView = Backbone.View.extend({
    template: _.template( $('#pantryListing').html() ),
    render: function() {
      this.$el.append(this.template({pantry: this.model}));
      return this;
    }
  });

  PantryPickup.PantriesView = Backbone.View.extend({
    initialize: function() {
      this.collection.on('reset', this.render, this);
    },
    render: function() {
      var $el = this.$el;
      this.collection.each(function(pantry) {
        $el.append(new PantryPickup.PantryListingView({model: pantry}).render().el);
        addPantryToMap(pantry);
      });
      return this;
    }
  });
  PantryPickup.view = new PantryPickup.PantriesView({collection: new PantryPickup.PantryCollection(), el: '#pantryList'});

	PantryPickup.map = new GMaps({
	  div: '#mapView',
	  lat: 42.3583,
	  lng: -71.0603
	});


  //Geolocation
  GMaps.geolocate({
    success: function(position) {
      $('.searchIndicatorBar').text('Viewing based on your current location.');
      PantryPickup.view.collection.search(position.coords, 5);
      PantryPickup.map.setCenter(position.coords.latitude, position.coords.longitude);
    },
    error: function(error) {
      alert('Geolocation failed: '+error.message);
    },
    not_supported: function() {
      alert("Your browser does not support geolocation");
    }
  });


  //Adding a Pantry
  function addPantryToMap(pantry){
    var state = "MA" //assuming all data is in Mass.
    var fullAddress = pantry.get("address") + ", " + pantry.get("city") + " " + state + " " + pantry.get("zipcode");
    console.log("adding " + fullAddress);
    console.log(pantry);
    lat = pantry.get("loc").coordinates[1];
    lng = pantry.get("loc").coordinates[0];

    console.log(lat + " " + lng);

    PantryPickup.map.addMarker({
          title: 'title',
          lat: lat,
          lng: lng,
          //add a click action which opens the infobox
          infoWindow: {
            content: "<p>"+pantry.get("site_name")+"</p><p>"+fullAddress+"</p>"
          }
        });

    /*
    GMaps.geocode({
      address: fullAddress,
      callback: function(results, status) {
        if (status == 'OK') {
            console.log("success geocoding " + fullAddress);
            var latlng = results[0].geometry.location;
            console.log(latlng.lat() + " " + latlng.lng());
                //PantryPickup.map.setCenter(latlng.lat(), latlng.lng());
                  PantryPickup.map.addMarker({
                        title: 'title',
                        lat: latlng.lat(),
                        lng: latlng.lng(),
                        infoWindow: {
                          content: "<p>"+pantry.get("site_name")+" "+fullAddress+"</p>"
                        }
                      });
           }
        else {
          console.log("failed to geocode: " + fullAddress);
        }
          }
    });
    */
  }


});

