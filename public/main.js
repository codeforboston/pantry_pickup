window.PantryPickup = {};

$(document).ready(function() {

  PantryPickup.PantryCollection = Backbone.Collection.extend({
    url: '/search',
    search: function(coords) {
      var bounds = PantryPickup.map.getBounds();
      var radius = 5000;
      if (bounds) radius = findRadius(bounds);
      this.fetch({data: {location: coords, radius: radius}, reset: true});
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
    id: function() {return this.model.attributes._id;},
    template: _.template( $('#pantryListingTmpl').html() ),
    events: {'click': 'showDetails'},
    showDetails: function() {pantryDetails(this.model);},
    render: function() {
      this.$el.append(this.template({pantry: this.model}));
      return this;
    }
  });

  PantryPickup.PantryDetailView = Backbone.View.extend({
    el: '#infoPanel',
    template: _.template( $('#pantryDetailsTmpl').html() ),
    events: {
      'click #detailClose': 'close'
    },
    render: function() {
      this.$el.animate({right: '1em', opacity: 1}, 100)
        .html(this.template({pantry: this.model}));
      return this;
    },
    close: function() {
      this.$el.animate({right: '-23em', opacity: 0}, 50);
    }
  });

  PantryPickup.PantryListingsView = Backbone.View.extend({
    initialize: function() {
      this.collection
        .on('sync', function() { this.$el.empty(); this.render(); }, this);
    },
    render: function() {
      var $el = this.$el;
      this.collection.each(function(pantry) {
        $el.append(
          new PantryPickup.PantryListingView({model: pantry}).render().el
        );
        addPantryToMap(pantry);

        if (
          PantryPickup.selectedPantryId &&
          pantry.attributes._id == PantryPickup.selectedPantryId
        ) {
          pantryDetailsById(PantryPickup.selectedPantryId);
          delete PantryPickup.selectedPantryId;
        }
      });
      return this;
    }
  });

  PantryPickup.PantriesView = Backbone.View.extend({
    events: {
      'submit form.search': 'search'
    },
    initialize: function() {
      this.listingsView = new PantryPickup
        .PantryListingsView({collection: this.collection, el: '#pantryList'});
      this.collection.on('recenter', function(center) {
        PantryPickup.map.setCenter(center.latitude, center.longitude);
      });
      this.collection.on('reset', this.resetMap);
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
      var term = $form.find('[name=term]').val();
      this.collection.search({term: term});
    }
  });

  PantryPickup.view = new PantryPickup.PantriesView(
    {collection: new PantryPickup.PantryCollection(), el: '#content'}
  );

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

  findRadius = function(bounds) {
    var meters_per_degree = 40075000 / 360;
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var widest_lat = Math.min(Math.abs(ne.lat()), Math.abs(sw.lat()));
    var lat_diff = Math.abs(ne.lat() - sw.lat());
    var lng_diff = Math.abs(ne.lng() - sw.lng());
    return .83 * Math.max(// needs to be >= .5 * sqrt(2)
      meters_per_degree * lat_diff,
      meters_per_degree * lng_diff * Math.cos(Math.PI/180 * widest_lat)
    );
  }

  searchAgain = function(e) {
    var center = e.getCenter();
    PantryPickup.search(
      'Pantries in this area of the map',
      {'latitude':center.lat(), 'longitude':center.lng()}
    );
  }

  PantryPickup.map = new GMaps({
    div: '#mapView',
    mapTypeControl: false,
    panControl: false,
    streetViewControl: false,
    zoomControlOptions: {'style':'SMALL'},
    lat: PantryPickup.defaults.coords.latitude,
    lng: PantryPickup.defaults.coords.longitude,
    dragend: searchAgain,
    zoom_changed: searchAgain
  });

  PantryPickup.search = function(message, coords) {
    $('#searchIndicatorBar').text(message);
    PantryPickup.view.collection.search(coords);
  }


  //Geolocation
  GMaps.geolocate({
    success: function(position) {
      var coords = {latitude: position.coords.latitude, longitude: position.coords.longitude};
      PantryPickup.search('Viewing based on your current location.', coords);
    },
    error: function(error) {
      PantryPickup.search(error.message, PantryPickup.defaults.coords);
    },
    not_supported: function() {
      PantryPickup.search('Your browser does not support geolocation.', PantryPickup.defaults.coords);
    }
  });

  function pantryDetailsById(selectedPantryId) {
    var pantries = PantryPickup.view.collection.models;
    for (var i = 0; i < pantries.length; i++)
      if (pantries[i].attributes._id == selectedPantryId) {
        return pantryDetails(pantries[i]);
      }
  }

  function pantryDetails(pantry) {
    // load details pane
    PantryPickup.selectedPantryId = pantry.attributes._id;
    // center pantry on map
    var lat = pantry.get("loc").coordinates[1];
    var lng = pantry.get("loc").coordinates[0];
    var currentCenter = PantryPickup.map.getCenter();
    if (
      Math.abs(currentCenter.lat() - lat) > .000001 ||
      Math.abs(currentCenter.lng() - lng) > .000001
    ) {
      PantryPickup.map.setCenter(lat, lng);
      return searchAgain(PantryPickup.map);
    }

    PantryPickup.detailView = new PantryPickup
      .PantryDetailView({model: pantry});
    PantryPickup.detailView.render();

    // change icon
    pantry.marker.setIcon(PantryPickup.defaults.icons.selected);
    if (PantryPickup.selectedPantry) PantryPickup.selectedPantry
      .marker.setIcon(PantryPickup.defaults.icons.unselected);
    PantryPickup.selectedPantry = pantry;
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
      click: function() {pantryDetails(pantry);}
    });
  }
});
