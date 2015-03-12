(function(){

  function initializeMap() {
    var scotts_house, map;
    // default options when first displaying the map
    scotts_house = {
      center: { lat: 39.957139, lng: -86.17521599999999 },
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.HYBRID
    };

    // create the map
    map = new google.maps.Map($('#map')[0], scotts_house);

    // drop a marker
    new google.maps.Marker({
      position: scotts_house.center,
      map: map,
      title: 'Eleven Fifty Coding Academy'
    });

    return map;
  }

  function getCoordinates(location) {
    return new google.maps.LatLng(location.lat, location.lng);
  }

  function addLocation(map, location) {
    var coordinates = getCoordinates(location);
    var map_options = {
      center: coordinates,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.HYBRID
    };
    map.setOptions(map_options);
    fitBounds(map, coordinates);
    dropMarker(coordinates);
  }

  function fitBounds(map, coords) {
    bounds.extend(coords);
    map.fitBounds(bounds);
  }

  function dropMarker(coordinates, title) {
    new google.maps.Marker({
      position: coordinates,
      map: map,
      title: $('form#geocoder')[0].address
    });
  }

  function updateLocation(ev) {
    ev.preventDefault();
    var address = this.address.value;

    // ask Google for the address coordinates
    $.get(url + address).success(function(data){
      var location = data.results[0].geometry.location;
      addLocation(map, location);
    });
  }

  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

  var map = initializeMap();

  var bounds = new google.maps.LatLngBounds();

  // watch for form submit
  $('form#geocoder').submit(updateLocation);

})();
