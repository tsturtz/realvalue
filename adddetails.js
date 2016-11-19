var map;
var service;
var infowindow;
var placeType = 'restaurant'; // Change this var depending on the type of place currently being searched.

var config = {
    apiKey: "AIzaSyD7lWychYO044cw2lPl6chSaBTt85kId5E",
    authDomain: "datamap-3c35f.firebaseapp.com",
    databaseURL: "https://datamap-3c35f.firebaseio.com",
    storageBucket: "datamap-3c35f.appspot.com",
    messagingSenderId: "582541890710"
};
firebase.initializeApp(config);
var fb = firebase.database();


function initMap() {

    var lfz = new google.maps.LatLng(33.633998, -117.733383);

    map = new google.maps.Map(document.getElementById('map'), {
        center: lfz,
        zoom: 15,
        styles: [{
            "featureType": "landscape",
            "stylers": [{"hue": "#FFBB00"}, {"saturation": 43.400000000000006}, {"lightness": 37.599999999999994}, {"gamma": 1}]
        }, {
            "featureType": "road.highway",
            "stylers": [{"hue": "#FFC200"}, {"saturation": -61.8}, {"lightness": 45.599999999999994}, {"gamma": 1}]
        }, {
            "featureType": "road.arterial",
            "stylers": [{"hue": "#FF0300"}, {"saturation": -100}, {"lightness": 51.19999999999999}, {"gamma": 1}]
        }, {
            "featureType": "road.local",
            "stylers": [{"hue": "#FF0300"}, {"saturation": -100}, {"lightness": 52}, {"gamma": 1}]
        }, {
            "featureType": "water",
            "stylers": [{"hue": "#0078FF"}, {"saturation": -13.200000000000003}, {"lightness": 2.4000000000000057}, {"gamma": 1}]
        }, {
            "featureType": "poi",
            "stylers": [{"hue": "#00FF6A"}, {"saturation": -1.0989010989011234}, {"lightness": 11.200000000000017}, {"gamma": 1}]
        }]
    });

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);

    fb.ref(placeType).once('value', function (snapshot) {
        for (x in snapshot.val()) {
            //console.log('each key in DB ', x);
            service.getDetails({
                placeId: x
            }, function (place) {
                console.log(
                    //'NAME: ' + place.name + '\n',
                    //'ADDRESS: ' + place.formatted_address + '\n',
                    //'PHONE: ' + place.formatted_phone_number + '\n',
                    //'ICON: ' + place.icon + '\n',
                    //'RATING: ' + place.rating + '\n',
                    //'URL: ' + place.url + '\n',
                    //'ZIP CODE: ' + place.address_components[6].short_name + '\n',
                    //'LAT: ' + place.geometry.location.lat() + '\n',
                    //'LNG: ' + place.geometry.location.lng()
                    place, x // wtf!
                );
            });
        }
    });
}
