

var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

var start_options = {
  center: { lat: 39.957139, lng: -86.17521599999999},
  zoom: 15,
  mapTypeId: google.maps.MapTypeId.HYBRID
};

var map = new google.maps.Map($('#map')[0], start_options);

$('form#geocoder').submit(function(ev){
  ev.preventDefault();
  var address = this.address.value;
  $.get(url + address).done(function(data){
    var location = data.results[0].geometry.location;
    var mapOptions = {
      center: { lat: location.lat, lng: location.lng },
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.HYBRID
    };
    var map = new google.maps.Map($('#map')[0],
        mapOptions);
  });
});
