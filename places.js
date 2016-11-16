/**
 * Globals
 */

var map;
var service;
var infowindow;

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

function initialize() {
    var lfz = new google.maps.LatLng(33.633998,-117.733383);

    map = new google.maps.Map(document.getElementById('map'), {
        center: lfz,
        zoom: 15
    });

    var request = {
        location: lfz,
        radius: '1000',
        types: ['restaurant']
    };

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
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

            var placeDB = {
                name: results[i].name,
                address: results[i].vicinity
            };

            (function(places) {
                fb.ref('places/' + (i+1)).set(placeDB);
            })(results[i]);

            /**
             * add places to markers on map
             */

            var place = results[i];
            createMarker(place);
            console.log(results[i]);
        }
    }
}

/**
 * Create markers and set marker content based on the lat/lon 'center' location in map init
 * @param place
 */

function createMarker(place) {
    //var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name + "<br />" + place.vicinity +"<br />" + "rating: " + place.rating);
        infowindow.open(map, this);
    });
}

// note: custom markers - https://developers.google.com/maps/documentation/javascript/custom-markers