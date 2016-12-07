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
 * Init google map so we can make place ID calls
 */

function initMap(key) {
    //service = new google.maps.places.PlacesService();

    var service = new google.maps.places.PlacesService(document.getElementById('map'));

    console.log(key);
    if (key === undefined) {
        key = 'ChIJl_N4tlno3IARWDJLc0k1zX0';
    }
    console.log(key);

    service.getDetails({
        placeId: key
    }, function(place){
        console.log(place);
    });

}

//test
setTimeout(function() {
    initMap('ChIJ-QhzqPnn3IARnTugjgz1gZU');
},4000);




/*function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {

            var placeLoc = {
                lat: results[i].geometry.location.lat(),
                lng: results[i].geometry.location.lng()
            };

            console.log(placeType, results[i].place_id, placeLoc);

            (function(places) {
                fb.ref(placeType + '/' + results[i].place_id).set(placeLoc);
            })(results[i]);

            var place = results[i];
            createMarker(place, placeLoc);
            console.log(results[i]);
        }
    }
}*/

/*function createMarker(place, location) {
    //var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent('PLACE TYPE: ' + placeType + '<br>' + 'PLACE ID: ' + place.place_id + '<br>' + 'LAT: ' + location.lat + '<br>' + 'LNG: ' + location.lng);
        infowindow.open(map, this);
    });
}*/





////////// NON-FUNCTIONING DETAILS SEARCH BASED ON DB ENTRIES //////////


/*fb.ref(placeType).on('value', function(snapshot) {
    for (var x in snapshot.val()) {
        //console.log('each key in DB ', x);
        (function() {
            var key = x;
            console.log('The key is:', key);
            service.getDetails({
                placeId: key
            }, function(place){
                console.log(place);
            });

        })();
    }
});*/

/*function initMap2(key) {
    service.getDetails({
        placeId: key
    }, function (place) {
        console.log(
            place
        );
    });
}*/







// NOTE: random place id: "ChIJl_N4tlno3IARWDJLc0k1zX0"

// NOTE: custom markers - https://developers.google.com/maps/documentation/javascript/custom-markers

// NOTE: add time stamp - {obj}.startedAt = firebase.database.ServerValue.TIMESTAMP;

/*
'NAME: ' + place.name + '\n',
'ADDRESS: ' + place.formatted_address + '\n',
'PHONE: ' + place.formatted_phone_number + '\n',
'RATING: ' + place.rating + '\n',
'ZIP CODE: ' + place.address_components[6].short_name + '\n',
'LAT: ' + place.geometry.location.lat() + '\n',
'LNG: ' + place.geometry.location.lng()
 */