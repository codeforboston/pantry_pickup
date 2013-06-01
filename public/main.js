$(document).ready(function() {
	var map = new GMaps({
	  div: '#mapView',
	  lat: 42.3583,
	  lng: -71.0603
	});


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

