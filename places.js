/**
 * Globals
 */

var map;
var service;
var infowindow;
var placeType = 'restaurant'; // Change this var depending on the type of place currently being searched.

/**
 * Firebase config
 * @type {{apiKey: string, authDomain: string, databaseURL: string, storageBucket: string, messagingSenderId: string}}
 */

var config = {
    apiKey: "AIzaSyD7lWychYO044cw2lPl6chSaBTt85kId5E",
    authDomain: "datamap-3c35f.firebaseapp.com",
    databaseURL: "https://datamap-3c35f.firebaseio.com",
    storageBucket: "datamap-3c35f.appspot.com",
    messagingSenderId: "582541890710"
};
firebase.initializeApp(config);
var fb = firebase.database();

/**
 * Init google map
 */

function initMap() {
    var lfz = new google.maps.LatLng(33.633998,-117.733383);

    map = new google.maps.Map(document.getElementById('map'), {
        center: lfz,
        zoom: 15,
        styles: [{"featureType":"landscape","stylers":[{"hue":"#FFBB00"},{"saturation":43.400000000000006},{"lightness":37.599999999999994},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},{"saturation":-61.8},{"lightness":45.599999999999994},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":51.19999999999999},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.200000000000003},{"lightness":2.4000000000000057},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF6A"},{"saturation":-1.0989010989011234},{"lightness":11.200000000000017},{"gamma":1}]}]
    });

    var request = {
        location: lfz,
        radius: '3000',
        type: [placeType]
    };

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.radarSearch(request, callback);
}

/**
 * Google map callback function
 * @param results
 * @param status
 */

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {

            /**
             * add places to database
             * @type {{name: *, address: *}}
             */

            var placeLoc = {
                lat: results[i].geometry.location.lat(),
                lng: results[i].geometry.location.lng()
            };

            console.log(placeType, results[i].place_id, placeLoc);

            (function(places) {
                fb.ref(placeType + '/' + results[i].place_id).set(placeLoc);
            })(results[i]);

            /**
             * Add markers
             */

            var place = results[i];
            createMarker(place, placeLoc);
            console.log(results[i]);
            //initMap2(place);
        }
    }
}

/**
 * Create markers and set marker content based on the lat/lon 'center' location in map init
 * @param place
 * @param location
 */

function createMarker(place, location) {
    //var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent('PLACE TYPE: ' + placeType + '<br>' + 'PLACE ID: ' + place.place_id + '<br>' + 'LAT: ' + location.lat + '<br>' + 'LNG: ' + location.lng);
        infowindow.open(map, this);
    });
}
fb.ref(placeType).on('value', function(snapshot) {
    for (x in snapshot.val()) {
        //console.log('each key in DB ', x);
        initMap2(x);
        function initMap2(x) {
                service.getDetails({
                    placeId: x
                }, function(place) {
                    console.log(
                        'NAME: ' + place.name + '\n',
                        'ADDRESS: ' + place.formatted_address + '\n',
                        'PHONE: ' + place.formatted_phone_number + '\n',
                        'ICON: ' + place.icon + '\n',
                        'RATING: ' + place.rating + '\n',
                        'URL: ' + place.url + '\n',
                        'ZIP CODE: ' + place.address_components[6].short_name + '\n',
                        'LAT: ' + place.geometry.location.lat() + '\n',
                        'LNG: ' + place.geometry.location.lng()
                    );
                });
            }
        }
});

/*function initMap2() {
    service.getDetails({
        placeId: x
    }, function(place) {
        console.log(
            'NAME: ' + place.name + '\n',
            'ADDRESS: ' + place.formatted_address + '\n',
            'PHONE: ' + place.formatted_phone_number + '\n',
            'ICON: ' + place.icon + '\n',
            'RATING: ' + place.rating + '\n',
            'URL: ' + place.url + '\n',
            'ZIP CODE: ' + place.address_components[6].short_name + '\n',
            'LAT: ' + place.geometry.location.lat() + '\n',
            'LNG: ' + place.geometry.location.lng()
        );
    });
}*/

//random place id: "ChIJl_N4tlno3IARWDJLc0k1zX0"






// note: custom markers - https://developers.google.com/maps/documentation/javascript/custom-markers

// note: add time stamp - {obj}.startedAt = firebase.database.ServerValue.TIMESTAMP;