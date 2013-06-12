window.PantryPickup = {};

$(document).ready(function() {

  PantryPickup.PantryCollection = Backbone.Collection.extend({
    url: '/search',
    search: function(location, radius) {
      this.fetch({data: {location: location, radius: radius}, reset: true});
    }
  });
  PantryPickup.PantryListingView = Backbone.View.extend({
    className: 'pantryListItem',
    template: _.template( $('#pantryListingTmpl').html() ),
    events: {
      'click': 'showDetails'
    },
    render: function() {
      this.$el.append(this.template({pantry: this.model}));
      return this;
    },
    showDetails: function() {
      clickOnPantry(this.model);
    }
  });

  PantryPickup.PantryDetailView = Backbone.View.extend({
    el: '#infoPanel',
    template: _.template( $('#pantryDetailsTmpl').html() ),
    events: {
      'click .close': 'close'
    },
    render: function() {
      this.$el.animate({
        right: '20',
        opacity:1,
        },
        100,
        function() {
          // Animation complete.
      }).html(this.template({pantry: this.model}));
      return this;
    },
    close: function() {
      //this.$el.hide();
      this.$el.animate({
        right: '-300',
        opacity:0,
        },
        50,
        function() {
          // Animation complete.
        });
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

	PantryPickup.defaults = {
    coords: {
      latitude: 42.3583,
      longitude: -71.0603
    }
  };


  PantryPickup.map = new GMaps({
	  div: '#mapView',
	  lat: PantryPickup.defaults.coords.latitude,
	  lng: PantryPickup.defaults.coords.longitude
	});

  PantryPickup.search = function(message, coords, radius) {
    $('.searchIndicatorBar').text(message);
    PantryPickup.view.collection.search(coords, radius);
    PantryPickup.map.setCenter(coords.latitude, coords.longitude);
  }


  //Geolocation
  GMaps.geolocate({
    success: function(position) {
      PantryPickup.search('Viewing based on your current location.', position.coords, 5);
    },
    error: function(error) {
      PantryPickup.search(error.message, PantryPickup.defaults.coords, 5);
    },
    not_supported: function() {
      PantryPickup.search('Your browser does not support geolocation.', PantryPickup.defaults.coords, 5);
    }
  });

  function clickOnPantry(pantry) {
    // load details pane
    var detailView = new PantryPickup.PantryDetailView({model: pantry});
    detailView.render();

    // center pantry on map
    lat = pantry.get("loc").coordinates[1];
    lng = pantry.get("loc").coordinates[0];
    PantryPickup.map.setCenter(lat, lng);

    // change icon
  }


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
          icon: "../img/bread_unselected.png",
          title: pantry.get("site_name"),
          lat: lat,
          lng: lng,
          //add a click action which opens the infobox
          click: function() { clickOnPantry(pantry); }
        });
  }


});

