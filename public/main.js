window.PantryPickup = {};

$(document).ready(function() {
  PantryPickup.PantryCollection = Backbone.Collection.extend({
    url: '/search',
    search: function(location, radius) {
      this.fetch({data: {location: location, radius: radius}, reset: true});
    }
  });
  PantryPickup.PantryListingView = Backbone.View.extend({
    template: _.template( $('#pantryListingTmpl').html() ),
    events: {
      'click .name': 'showDetails'
    },
    render: function() {
      this.$el.append(this.template({pantry: this.model}));
      return this;
    },
    showDetails: function() {
      var detailView = new PantryPickup.PantryDetailView({model: this.model});
      detailView.render();
    }
  });

  PantryPickup.PantryDetailView = Backbone.View.extend({
    el: '#infoPanel',
    template: _.template( $('#pantryDetailsTmpl').html() ),
    events: {
      'click .close': 'close'
    },
    render: function() {
      this.$el.show().html(this.template({pantry: this.model}));
      return this;
    },
    close: function() {
      this.$el.hide();
    }
  });

  PantryPickup.PantryListingsView = Backbone.View.extend({
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

  PantryPickup.PantriesView = Backbone.View.extend({
    initialize: function() {
      this.listingsView = new PantryPickup.PantryListingsView({collection: this.collection, el: '#pantryList'});
    },
    render: function() {
      this.listingsView.render();
    }
  });

  PantryPickup.view = new PantryPickup.PantriesView({collection: new PantryPickup.PantryCollection(), el: '#content'});

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
    fullAddress = pantry.get("address") + " " + pantry.get("city") + " " + pantry.get("zipcode");
    console.log("adding " + fullAddress);

    GMaps.geocode({
      address: fullAddress,
      callback: function(results, status) {
        if (status == 'OK') {
            var latlng = results[0].geometry.location;
                //PantryPickup.map.setCenter(latlng.lat(), latlng.lng());
                  PantryPickup.map.addMarker({
                        title: 'title',
                        lat: latlng.lat(),
                        lng: latlng.lng(),
                        infoWindow: {
                          content: "<p>"+pantry.get("site_name")+"</p>"
                        }
                      });
                    }
          }
    });
  }


});

