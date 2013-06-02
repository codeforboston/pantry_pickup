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

  PantryPickup.map.addMarker({
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
        PantryPickup.map.setCenter(latlng.lat(), latlng.lng());
        PantryPickup.map.addMarker({
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

