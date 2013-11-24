(function(){
  'use strict';

  window.PantryPickup = {
    defaults: {
      coords: {
        latitude: 42.3583,
        longitude: -71.0603
      },
      icons: {
        unselected: '../img/bread_unselected.png',
        selected: '../img/bread_selected.png'
      }
    }
  };

  // index pantries by location
  function Location() {
    this.pantries = [];
    this.addPantry = function(pantry) {
      this.pantries.push(pantry);
    }
  }
  // Backbone Models
  PantryPickup.Pantry = Backbone.Model.extend({
    idAttribute: '_id',
    initialize: function() {
      this.location().addPantry(this);
    },
    latitude:   function() { return this.get('loc').coordinates[1]; },
    longitude:  function() { return this.get('loc').coordinates[0]; },
    location:   function() {
      var latLng = JSON.stringify({lat: this.latitude(), lon: this.longitude()});
      var loc = this.collection.locations[latLng];
      if (!loc) {
        loc = this.collection.locations[latLng] = new Location();
      }
      return loc;
    }
  });
  PantryPickup.PantryCollection = Backbone.Collection.extend({
    model: PantryPickup.Pantry,
    url: '/search',
    initialize: function() {
      this.locations = {};
    },
    search: function(coords) {
      var bounds = PantryPickup.map.getBounds();
      var radius = 5000;
      if (bounds) radius = findRadius(bounds);
      this.fetch({data: {location: coords, radius: radius}, reset: true});
    },
    parse: function(response) {
      this.locations = {};
      // if collection contains center of locations, trigger a re-center event
      if (response.loc) this.trigger('recenter', response.loc);
      if (response.pantries) return response.pantries;
      else return response;
    }
  });


  // Backbone Views
  PantryPickup.PantryListingView = Backbone.View.extend({
    className: 'pantryListItem',
    template: _.template( $('#pantryListingTmpl').html() ),
    events: {
      'click': 'selectPantry'
    },
    initialize: function() {
      this.listenTo(this.model.collection, 'pantry:selected', function(model) {
        if (model === this.model) {
          this.$el.addClass('selected').scrollIntoView();
        } else {
          this.$el.removeClass('selected');
        }
      });
    },
    selectPantry: function() {
      selectPantry(this.model);
    },
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
      this.$el.show().animate({right: '1em', opacity: 1}, 100)
        .html(this.template({pantry: this.model}));
      return this;
    },
    close: function() {
      this.$el.animate({right: '-23em', opacity: 0}, 50).hide();
    }
  });

  PantryPickup.InfoWindowView = Backbone.View.extend({
    template: _.template( $('#multiplePantriesTmpl').html() ),
    events: {
      'click .pantry': 'showPantry'
    },
    render: function() {
      this.$el.html(this.template({pantries: this.collection}));
      return this;
    },
    showPantry: function(e) {
      e.preventDefault();
      var pantry = this.collection.get($(e.target).data('cid'));
      selectPantry(pantry);
    }
  });

  PantryPickup.PantryListingsView = Backbone.View.extend({
    events: {
      'click .zoom-boston': 'zoomInOnBoston'
    },
    initialize: function() {
      this.listenTo(this.collection, 'sync', function() {
        this.$el.empty();
        this.render();
      });
    },
    render: function() {
      var $el = this.$el;
      if (this.collection.isEmpty()) {
        $el.append($('#noPantriesTmpl').text());
      } else {
        this.collection.each(function(pantry) {
          $el.append(
            new PantryPickup.PantryListingView({model: pantry}).render().el
          );
          addPantryToMap(pantry);
        });
      }
      this.$el.scrollTop(0);
      return this;
    },
    zoomInOnBoston: function(e) {
      e.preventDefault();
      PantryPickup.map.setCenter(PantryPickup.defaults.coords.latitude, PantryPickup.defaults.coords.longitude);
      searchByMap(PantryPickup.map);
    }
  });

  PantryPickup.PantriesView = Backbone.View.extend({
    events: {
      'submit #searchBar form': 'search',
      'click #showList': 'showList',
      'click #showMap': 'showMap'
    },
    initialize: function() {
      this.listingsView = new PantryPickup
        .PantryListingsView({collection: this.collection, el: '#pantryList'});
      this.collection.on('recenter', function(center) {
        PantryPickup.map.setCenter(center.latitude, center.longitude);
      });
      this.collection.on('reset', this.resetMap);
      $(window).resize(function() {
        if ($('#mobileViewToggle').css("display") == "none" ){
          $('#pantryList').show();
          $('#mapContainer').show()
        };
      });
    },
    render: function() {
      this.listingsView.render();
      return this;
    },
    resetMap: function() {
      delete PantryPickup.selectedPantry;
      if (PantryPickup.detailView) {
        PantryPickup.detailView.$el.empty();
        PantryPickup.detailView.close();
      }
      PantryPickup.map.removeMarkers();
    },
    showList: function(e) {
      e.preventDefault();
      $('#pantryList').show();
      $('#mapContainer, #infoPanel').hide();
    },
    showMap: function(e) {
      e.preventDefault();
        $('#pantryList, #infoPanel').hide();
        $('#mapContainer').show();
    },
    search: function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var term = $form.find('[name=term]').val();
      this.collection.search({term: term});
    }
  });

  PantryPickup.view = new PantryPickup.PantriesView(
    {collection: new PantryPickup.PantryCollection(), el: 'body'}
  );

  // Helper functions
  var findRadius = function(mapBounds) {
    var meters_per_degree = 40075000 / 360;
    var ne = mapBounds.getNorthEast();
    var sw = mapBounds.getSouthWest();
    var widest_lat = Math.min(Math.abs(ne.lat()), Math.abs(sw.lat()));
    var lat_diff = Math.abs(ne.lat() - sw.lat());
    var lng_diff = Math.abs(ne.lng() - sw.lng());
    return .83 * Math.max(// needs to be >= .5 * sqrt(2)
      meters_per_degree * lat_diff,
      meters_per_degree * lng_diff * Math.cos(Math.PI/180 * widest_lat)
    );
  }

  var searchByMap = function(GMap) {
    var center = GMap.getCenter();
    PantryPickup.view.collection.search(
      {'latitude':center.lat(), 'longitude':center.lng()}
    );
  }

  var selectPantry = function(pantry) {
    // center pantry on map
    PantryPickup.map.setCenter(pantry.latitude(), pantry.longitude());

    // FIXME detail view shouldn't be created in an arbitrary scope, it should be managed in the same view that created it
    PantryPickup.detailView = new PantryPickup.PantryDetailView({model: pantry});
    PantryPickup.detailView.render();

    if (pantry.marker.infoWindow) {
      pantry.marker.infoWindow.close();
    }

    // change icon
    pantry.marker.setIcon(PantryPickup.defaults.icons.selected);
    if (PantryPickup.selectedPantry && PantryPickup.selectedPantry.location() !== pantry.location())
      PantryPickup.selectedPantry.marker.setIcon(PantryPickup.defaults.icons.unselected);
    PantryPickup.selectedPantry = pantry;
    // fire 'selected' event
    pantry.trigger('pantry:selected', pantry);
  }

  var addPantryToMap = function(pantry) {
    if (pantry.location().marker) {
      // there's already a marker at this location
      pantry.marker = pantry.location().marker;
      return;
    } else {
      var options = {
        icon: PantryPickup.defaults.icons.unselected,
        lat: pantry.latitude(),
        lng: pantry.longitude()
      };
      var pantries = pantry.location().pantries;
      if (pantries.length > 1) {
        var infoWindowView = new PantryPickup.InfoWindowView({collection: new Backbone.Collection(pantries)})
        options.title = 'Multiple pantries at this location';
        options.infoWindow = {
          content: infoWindowView.render().el
        };
      } else {
        options.title = pantry.get("site_name");
        options.click = function() {
          selectPantry(pantry);
        };
      }
      pantry.marker = pantry.location().marker = PantryPickup.map.addMarker(options);
    }
  }


  // OnLoad
  PantryPickup.map = new GMaps({
    div: '#mapView',
    mapTypeControl: false,
    panControl: false,
    streetViewControl: false,
    zoomControlOptions: {'style':'SMALL'},
    lat: PantryPickup.defaults.coords.latitude,
    lng: PantryPickup.defaults.coords.longitude
  });

  PantryPickup.map.addControl({
    position: 'top_left',
    content: 'Redo search in this area',
    style: {
      background: 'white',
      padding: '3pt',
      margin: '5pt',
      borderRadius: '2pt',
      border: '1px solid #666',
    },
    events: {
      click: function() {
        searchByMap(PantryPickup.map);
      }
    }
  });

  GMaps.geolocate({
    success: function(position) {
      PantryPickup.coords = {'latitude': position.coords.latitude, 'longitude': position.coords.longitude};
    },
    error: function(error) {
      PantryPickup.coords = PantryPickup.defaults.coords;
    },
    not_supported: function() {
      PantryPickup.coords = PantryPickup.defaults.coords;
    },
    always: function() {
      PantryPickup.view.collection.search(PantryPickup.coords);
      delete PantryPickup.coords;
    }
  });
})();
