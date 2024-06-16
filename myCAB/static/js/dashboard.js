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
    document.getElementById('rideForm').addEventListener('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission
        
        const pickup = document.getElementById('pickup').value;
        const drop = document.getElementById('drop').value;
        
        if (pickup && drop) {
            fetch('/find_ride', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'pickup': pickup,
                    'drop': drop
                })
            })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;  // Redirect to the returned URL
                } else {
                    return response.text().then(text => { throw new Error(text); });
                }
            })
            .catch(error => alert('Error: ' + error.message));
        } else {
            alert('Please enter both pickup and drop locations.');
        }
    });

    initMap();
});
