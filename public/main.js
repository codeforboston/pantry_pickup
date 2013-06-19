window.PantryPickup = {};

$(document).ready(function() {

  PantryPickup.PantryCollection = Backbone.Collection.extend({
    url: '/search',
    search: function(location, radius) {
      this.fetch({data: {location: location, radius: radius}, reset: true});
    },
    parse: function(response) {
      // if collection contains center of locations, trigger a re-center event
      if (response.loc) {
        this.trigger('recenter', response.loc);
      }
      if (response.pantries) {
        return response.pantries;
      } else {
        return response;
      }
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
      this.collection.on('sync', this.render, this);
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
    events: {
      'submit form.search': 'search'
    },
    initialize: function() {
      this.listingsView = new PantryPickup.PantryListingsView({collection: this.collection, el: '#pantryList'});
      this.collection.on('reset', this.resetMap, this);
      this.collection.on('recenter', function(center) {
        PantryPickup.map.setCenter(center.latitude, center.longitude);
      });
    },
    render: function() {
      this.listingsView.render();
    },
    resetMap: function() {
      delete PantryPickup.selectedPantry;
      if (PantryPickup.detailView) {
        PantryPickup.detailView.$el.empty();
        PantryPickup.detailView.close();
      }
      PantryPickup.map.removeMarkers();
    },
    search: function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var term = $form.find('[name=term]').val(), radius = $form.find('[name=radius]').val();
      this.collection.search({term: term}, parseInt(radius));
    }
  });

  PantryPickup.view = new PantryPickup.PantriesView({collection: new PantryPickup.PantryCollection(), el: '#content'});

	PantryPickup.defaults = {
    coords: {
      latitude: 42.3583,
      longitude: -71.0603
    },
    icons: {
      unselected: '../img/bread_unselected.png',
      selected: '../img/bread_selected.png'
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
  }


  //Geolocation
  GMaps.geolocate({
    success: function(position) {
      var coords = {latitude: position.coords.latitude, longitude: position.coords.longitude};
      PantryPickup.search('Viewing based on your current location.', coords, 5);
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
    PantryPickup.detailView = new PantryPickup.PantryDetailView({model: pantry});
    PantryPickup.detailView.render();
    if (PantryPickup.selectedPantry != pantry) {

      // center pantry on map
      var lat = pantry.get("loc").coordinates[1];
      var lng = pantry.get("loc").coordinates[0];
      PantryPickup.map.setCenter(lat, lng);

      // change icon
      pantry.marker.setIcon(PantryPickup.defaults.icons.selected);
      if (PantryPickup.selectedPantry) {
        PantryPickup.selectedPantry.marker.setIcon(PantryPickup.defaults.icons.unselected);
      }
      PantryPickup.selectedPantry = pantry;
    }
  }

  //Adding a Pantry
  function addPantryToMap (pantry) {
    var state = "MA" //assuming all data is in Mass.
    var fullAddress = pantry.get("address") + ", " + pantry.get("city") + " " + state + " " + pantry.get("zipcode");
    var lat = pantry.get("loc").coordinates[1];
    var lng = pantry.get("loc").coordinates[0];

    pantry.marker = PantryPickup.map.addMarker({
          icon: PantryPickup.defaults.icons.unselected,
          title: pantry.get("site_name"),
          lat: lat,
          lng: lng,
          //add a click action which opens the infobox
          click: function() {
            clickOnPantry(pantry);
          }
        });
  }


});

