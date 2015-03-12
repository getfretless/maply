# Maply

Let's try and do some fun stuff with maps.

Create a new directory (I'm calling mine "maply")
```shell
$ mkdir ~/code/elevenfifty/js/maply
```

## Geocoding

And build a skeleton html document. I'm going to call this one `geocoder.html`
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Maply</title>
  </head>
  <body>
    <h1>Maply</h1>
  </body>
</html>
```

I want to get the coordinates for an address, so we can display a point on a map.

Google provides an API for geocoding, so let's look up how to do it.

How do we do that? [How about we Google for it?](http://lmgtfy.com/?q=google+geocoding+api)

This takes me to [the Google Geocoding API documentation](https://developers.google.com/maps/documentation/geocoding/)

We can ignore the part about needing a developer key for this, since we aren't doing this on the server for thousands of requests per day, there is no practical way we will hit this on the [client side](https://developers.google.com/maps/articles/geocodestrat#client).

This page shows that we can make a request to a special Google URL, and have it spit back some JSON we can use.

The example it gives shows [this](https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA) URL, which is the json endpoint, with a query string where you can send an address (or any Google-maps-style query) and get back a response.

You can see there's a rich JSON object returned, so let's build a function that can do that for any valid address.

We're going to want to use one of jQuery's ajax methods ([`$.get`](http://api.jquery.com/jquery.get/)) to get at this data, so let's add [jQuery](http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js). Remember to add `http:` to the protocol, since we are running off our local filesystem.

Put in a `<script>` tag and let's load up the example and process it:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Geocoder</title>
  </head>
  <body>
    <h1>Geocoder</h1>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script>
          $.get('https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA', function(data){
        console.log(data);
      });
    </script>
  </body>
</html>
```

If we watch our console and reload the page, we should see the data we got back from the ajax call. You can expand this to see we got back a `results` array with just one object, and inside this object, we have a bunch of properties.

Explore this object a little bit, and you'll see under `geometry`, there's a `lat` and `lng` property for the latitude and longitude, let's try to just log that:
```js
var location = data.results[0].geometry.location;
console.log('lat: ' + location.lat + ' lng: ' + location.lng);
});
```

Cool, now let's make it so we can enter our own address.
Add a form:
```html
<form id="geocoder">
  <label for="address">Address</label>
  <input id="address" type="text" name="address">
  <input type="submit" value="Get Coordinates">
</form>
```

And only trigger the request when the form gets submitted:
```js
$('#geocoder').submit(function(e){
  e.preventDefault();
  var address = $('#address').val(); $.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address, function(data){
  var location = data.results[0].geometry.location;
  console.log('lat: ' + location.lat + ' lng: ' + location.lng);
  });
});
```

Notice here we are using `preventDefault()` to intercept the browser's natural behavior of trying to go to a new page, and then calling our custom Javascript. We are getting the address from the input field and appending it to the Google base URL, and requesting the result.

## Aside - Promises
jQuery's ajax methods when called without a callback will return a promise object that will fire when/if the promise has been resolved.

It's really simple to convert this to use a promise instead of a callback:
```js
$.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address)
.success(function(data){
```

We can also chain other promises on this like `.done` for when the ajax finishes, regardless if it succeeds or not, and `.fail` for when it doesn't. You can even chain them on each other like this:
```js
$.get('http://example.com')
  .done(function(){ console.log('done') })
  .success(function(data){ console.log('success') })
  .fail(function(){ console.log('something went wrong') });

## Drawing a map

Let's look at [this Google example tutorial for building a map](https://developers.google.com/maps/documentation/javascript/tutorial).

This shows that we need to load a Google javascript file, so let's add a script tag to load that:
```html
<script type="text/javascript"
  src="https://maps.googleapis.com/maps/api/js"></script>
```

Then create an element to put the map inside:
```html
<div id="map" style="height:300px; width:400px; border:1px solid black;"></div>
```

We have to give it a height and width, otherwise it will be 0px by 0px, and no one would be able to see it. I'm just adding the border for dramatic effect.

Lets put a map inside of this thing. We need a starting point and a zoom level.
```js
var options = { center: { lat: 39.957139, lng: -86.17521599999999 }, zoom: 18 };
var map = new google.maps.Map($('#map')[0], options);
```

Notice I used `[0]` to get at the actual element. We could have just as easily used `document.getElementById('map')` in its place, but you might see this in the wild, since this is the way you get at the actual element when you need that instead of the special jQuery object that normally gets returned. Also, it's a little less typing ;)

If we reload the page here, we should see a familiar spot.

Let's make this a satellite view:
```js
var options = {
  center: { lat: 39.957139, lng: -86.17521599999999 },
  zoom: 18,
  mapTypeId: google.maps.MapTypeId.SATELLITE
};
```

Nice. How about a `HYBRID` view.
```js
mapTypeId: google.maps.MapTypeId.HYBRID
```

Now let's make it so entering an address actually takes us to that spot on the map:

We can really simply draw another map in this one's place by copying the options and map line to inside the form submit, and substituting the latitude and longitude:
```js
var options = { center: { lat: location.lat, lng: location.lng }, zoom: 18 };
var map = new google.maps.Map($('#map')[0], options);
```

or we can [change the properties of the existing map](https://developers.google.com/maps/documentation/javascript/reference#MapOptions):
```js
map.setOptions({ center: { lat: location.lat, lng: location.lng }});
```

Now, when we enter an address we are shown that on the map.

## Dropping a marker

This looks just a tad too plain to me, I want to drop a marker on the map in addition to just centering it on the target location.

[The Google Maps documentation for Marker](https://developers.google.com/maps/documentation/javascript/reference#Marker) shows me that I can call `google.maps.Marker` with some options to drop a pin.
Let's create a marker with the same latitude and longitude coordinates.

The marker options can take in the `map` object, but we can't just pass in the `lat` and `lng` values; we have to create a special object for that:
```js
var coords = new google.maps.LatLng(location.lat, location.lng);
```

Now we can pass this into a marker, and it should drop one on the map.
```js
new google.maps.Marker({ map: map, position: coords });
```

Here's the full thing at this point for reference:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Geocoder</title>
  </head>
  <body>
    <h1>Geocoder</h1>
    <form id="geocoder">
      <label for="address">Address</label>
      <input id="address" type="text" name="address">
      <input type="submit" value="Get Coordinates">
    </form>

    <div id="map" style="height:300px; width:400px; border:1px solid black;"></div>

    <script type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script>
      var options = {
        center: { lat: 39.957139, lng: -86.17521599999999 },
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.HYBRID
      };
      var map = new google.maps.Map($('#map')[0], options);

      $('#geocoder').submit(function(e){
        e.preventDefault();
        var address = $('#address').val(); $.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address)
        .success(function(data){
          // get location object from API
          var location = data.results[0].geometry.location;

          // center the map on the new location
          map.setOptions({ center: { lat: location.lat, lng: location.lng }});

          // drop a marker on those coordinates
          var coords = new google.maps.LatLng(location.lat, location.lng);
          new google.maps.Marker({ map: map, position: coords });

        });
      });
    </script>
  </body>
</html>
```

## A little cleaning up

This is starting to get a little hairy now, so let's pull the javascript into its own file. Make a new file (I'm calling mine maply.js), and link to that from the html page by adding a `src` attribute pointing to the new file:
```js
<script src="maply.js"></script>
```

## Multiple markers

Let's say we wanted to just add new markers for every address we look up.
Because adding new markers doesn't remove ones that are already on the map, they are already there (zoom out), but we want the map to auto-zoom to fit everything on the map.

Let's use `LatLngBounds` to zoom out of the map until it contains all of the markers.

We can define the boundaries object right under where we define the map:
```js
var bounds = new google.maps.LatLngBounds();
```

Then, as we add addresses, we also extend the bounds of the map to include the new coordinates as they are entered:
```js
bounds.extend(coords);
map.fitBounds(bounds);
```

This pretty much does what we want, however the markers at the boundaries are barely visible unless you zoom out a bit, so let's automatically zoom out a little bit so there's some padding.
```js
map.setOptions({ zoom: (map.zoom - 1) });
```

Here's what all of `maply.js` looks like now:
```js
var options = {
  center: { lat: 39.957139, lng: -86.17521599999999 },
  zoom: 18,
  mapTypeId: google.maps.MapTypeId.HYBRID
};
var map = new google.maps.Map($('#map')[0], options);
var bounds = new google.maps.LatLngBounds();

$('#geocoder').submit(function(e){
  e.preventDefault();
  var address = $('#address').val(); $.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address)
  .success(function(data){
    // get location object from API
    var location = data.results[0].geometry.location;

    // center the map on the new location
    map.setOptions({ center: { lat: location.lat, lng: location.lng }});

    // drop a marker on those coordinates
    var coords = new google.maps.LatLng(location.lat, location.lng);
    new google.maps.Marker({ map: map, position: coords });

    // fit all markers on the map
    bounds.extend(coords);
    map.fitBounds(bounds);

    // zoom out one level
    map.setOptions({ zoom: (map.zoom - 1) });

  });
});
```

And the HTML:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Geocoder</title>
  </head>
  <body>
    <h1>Geocoder</h1>
    <form id="geocoder">
      <label for="address">Address</label>
      <input id="address" type="text" name="address">
      <input type="submit" value="Get Coordinates">
    </form>

    <div id="map" style="height:300px; width:400px; border:1px solid black;"></div>

    <script type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script src="maply.js"></script>
  </body>
</html>
```

We are adding `var`s to the global namespace all over here, so let's wrap this whole thing in an "IIFE" (Immediately Invoked Function Expression):
```js
(function(){
  // move everthing else in here, and tab over 2 spaces
})();
```

This looks pretty good, but we can probably break all this code down into a few smaller chunks. Let's refactor these parts out into thier own functions.

Before the event handler, we are doing a bunch of stuff to create the map, and give it a default target. Let's pull all this into a function called `initializeMap`. With a name like that, I think I'd also like it to return the map object to do things with later.
```js
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

var map = initializeMap();
```

The event handler is pretty much the rest of it, so let's move that to its own function `updateLocation`:
```js
function updateLocation(ev) {
  ev.preventDefault();
  var address = this.address.value;
  $.get(url + address).success(function(data){
    var location = data.results[0].geometry.location;
    addLocation(map, location);
  });
}
```

Then extract the adding of the new location, and break that up into a few parts.

```js
function addLocation(map, location) {
  var coordinates = getCoordinates(location);
  map.setOptions({
    center: coordinates,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.HYBRID
  });
  fitBounds(map, coordinates);
  dropMarker(coordinates);
}
```

By working out what we want to do in this function, we can write the function we want, then make it. Doing this, we work out what dependencies the functions will need passed in as arguments.

Let's implement these, too
```js
function getCoordinates(location) {
  return new google.maps.LatLng(location.lat, location.lng);
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
```

We could break this up some more, but this feels pretty good to me.

The final version of this project is [HERE](maply.js).
