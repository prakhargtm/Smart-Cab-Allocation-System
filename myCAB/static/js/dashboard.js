document.addEventListener('DOMContentLoaded', function() {
    let map;
    let autocompletePickup;
    let autocompleteDrop;

    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8
        });

        autocompletePickup = new google.maps.places.Autocomplete(document.getElementById('pickup'));
        autocompleteDrop = new google.maps.places.Autocomplete(document.getElementById('drop'));

        autocompletePickup.addListener('place_changed', function() {
            const place = autocompletePickup.getPlace();
            if (!place.geometry) {
                alert("No details available for input: '" + place.name + "'");
                return;
            }
            map.setCenter(place.geometry.location);
            new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name
            });
        });

        autocompleteDrop.addListener('place_changed', function() {
            const place = autocompleteDrop.getPlace();
            if (!place.geometry) {
                alert("No details available for input: '" + place.name + "'");
                return;
            }
            new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name
            });
        });
    }

    document.getElementById('currentLocationBtn').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                document.getElementById('pickup').value = `${pos.lat}, ${pos.lng}`;
                map.setCenter(pos);
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: 'Current Location'
                });
            }, function() {
                alert('Error: The Geolocation service failed.');
            });
        } else {
            alert('Error: Your browser doesn\'t support geolocation.');
        }
    });

    async function findRide(pickup, drop) {
        try {
            const response = await fetch('/find_ride', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'pickup': pickup,
                    'drop': drop
                })
            });

            // Log the entire response object
            console.log('Full Response:', response);

            // Ensure the response is ok (status code 2xx)
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();
            console.log('Response Data:', data);

            if (data.redirect_url) {
                const redirectUrl = new URL(data.redirect_url, window.location.origin);
            redirectUrl.searchParams.append('distance', data.distance);
            window.location.href = redirectUrl.toString();   // Redirect to the returned URL
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    document.getElementById('rideForm').addEventListener('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission
        
        const pickup = document.getElementById('pickup').value;
        const drop = document.getElementById('drop').value;
        
        if (pickup && drop) {
            console.log("HI");
            findRide(pickup, drop)
        } else {
            alert('Please enter both pickup and drop locations.');
        }
    });

    initMap();
});
