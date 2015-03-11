
var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

// default options when first displaying the map
var scotts_house = {
  center: { lat: 39.957139, lng: -86.17521599999999 },
  zoom: 15,
  mapTypeId: google.maps.MapTypeId.HYBRID
};

// create the map
var map = new google.maps.Map($('#map')[0], scotts_house);

// drop a marker
new google.maps.Marker({
  position: scotts_house.center,
  map: map,
  title: 'Eleven Fifty Coding Academy'
});

var bounds = new google.maps.LatLngBounds();

// watch for form submit
$('form#geocoder').submit(function(ev){
  ev.preventDefault();
  var address = this.address.value;

  // ask Google for the address coordinates
  $.get(url + address).success(function(data){
    var location = data.results[0].geometry.location;

    // make coordinates object
    var coords = new google.maps.LatLng(location.lat, location.lng);

    var map_options = {
      center: coords,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.HYBRID
    };

    // move map to new coordinates
    map.setOptions(map_options);

    // fit all markers on the map
    bounds.extend(coords);
    map.fitBounds(bounds);

    // drop marker
    new google.maps.Marker({
      position: map_options.center,
      map: map,
      title: address
    });

  });
});
