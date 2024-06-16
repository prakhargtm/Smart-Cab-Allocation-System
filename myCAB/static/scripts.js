// scripts.js
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    let response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    let result = await response.json();
    document.getElementById('message').textContent = result.message;

    if (response.ok) {
        // Redirect to another page or do something else on successful login
        window.location.href = '/dashboard'; // Example redirect
    }
});
// Initialize variables for map and geocoder
var map;
var geocoder;
var directionsService;
var directionsRenderer;

// Function to initialize the map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644}, // Default center (Sydney, Australia)
    zoom: 12
  });

  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
}

// Function to handle form submission
document.getElementById('findRideForm').addEventListener('submit', function(event) {
  event.preventDefault();

  var startLocation = document.getElementById('startLocation').value;
  var endLocation = document.getElementById('endLocation').value;

  if (startLocation.toLowerCase() === 'current location') {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        geocodeAddress(endLocation, function(endLatLng) {
          displayRoute(currentLocation, endLatLng);
        });
      }, function() {
        alert('Geolocation service failed.');
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  } else {
    // Geocode start and end locations and display route
    geocodeAddress(startLocation, function(startLatLng) {
      geocodeAddress(endLocation, function(endLatLng) {
        displayRoute(startLatLng, endLatLng);
      });
    });
  }
});

// Function to geocode an address using Google Maps Geocoding API
function geocodeAddress(location, callback) {
  geocoder.geocode({'address': location}, function(results, status) {
    if (status === 'OK') {
      callback(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

// Function to display route on the map using Directions API
function displayRoute(startLatLng, endLatLng) {
  var request = {
    origin: startLatLng,
    destination: endLatLng,
    travelMode: 'DRIVING'
  };

  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(result);
    } else {
      alert('Directions request failed due to ' + status);
    }
  });
}

// Load the map once the window loads
window.onload = initMap;

