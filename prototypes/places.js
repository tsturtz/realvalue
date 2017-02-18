/********************************************************************
 *
 *
 * RUNNING THIS GOOGLE PLACES RADAR SEARCHES EVERY 1 MINUTE (60000MS)
 *
 *
 ********************************************************************/



var map;
var service;
var infowindow;
var placeType = 'university'; // Change this var depending on the type of place currently being searched.

// TAYLOR DB
/*var config = {
    apiKey: "AIzaSyD7lWychYO044cw2lPl6chSaBTt85kId5E",
    authDomain: "datamap-3c35f.firebaseapp.com",
    databaseURL: "https://datamap-3c35f.firebaseio.com",
    storageBucket: "datamap-3c35f.appspot.com",
    messagingSenderId: "582541890710"
};
firebase.initializeApp(config);*/

// WEIKUAN DB
var config = {
    apiKey: "AIzaSyDA0QfT-TwSiFshrNjrg3yQ67bPBo4HVsw",
    authDomain: "realvalue-ebd58.firebaseapp.com",
    databaseURL: "https://realvalue-ebd58.firebaseio.com",
    storageBucket: "realvalue-ebd58.appspot.com",
    messagingSenderId: "73443138678"
};
firebase.initializeApp(config);

var fbTaylorData = firebase.database();

function initMap() {

    var randomCoordinates = [
        [33.69360712, -117.8646765], //0
        [33.65845119, -117.83055649], //1
        [33.73149015, -117.80291069], //2
        [33.68602744, -117.82148793], //3
        [33.61667703, -117.81383995], //4
        [33.74195359, -117.79039542], //5
        [33.74248384, -117.80720502], //6
        [33.67280461, -117.78111769], //7
        [33.67549506, -117.81963118], //8
        [33.67986298, -117.87819591], //9
        [33.6265905, -117.81118723], //10
        [33.73977809, -117.82802054], //11
        [33.68413254, -117.77894694], //12
        [33.72817102, -117.73608815], //13
        [33.68882716, -117.87778805], //14
        [33.62982505, -117.76796177], //15
        [33.70605582, -117.76352739], //16
        [33.65759277, -117.74964536], //17
        [33.66705384, -117.74520216], //18
        [33.66210126, -117.83252] //19
        ];

    //var lfz = new google.maps.LatLng(33.633998, -117.733383);

    var coordIndex = 0;

    var apiInterval;
    apiInterval = setInterval(function(){ callApi() }, 60000);

    function callApi() {

        var randomCoord = new google.maps.LatLng(randomCoordinates[coordIndex][0],randomCoordinates[coordIndex][1]);

        coordIndex++;

        map = new google.maps.Map(document.getElementById('map'), {
            center: randomCoord,
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

        var request = {
            location: randomCoord,
            radius: '3500',
            type: [placeType]
        };

        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
        service.radarSearch(request, callback);
    }


    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];

                console.log('number of results: ', results.length);

                var placeObj =
                {
                    "type": "Feature",
                    "properties": {
                        "type": placeType,
                        "placeId": place.place_id
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            results[i].geometry.location.lat(), results[i].geometry.location.lng()
                        ]
                    }
                };

                console.log('obj to be pushed to DB: ', placeObj);

                var placeLoc = {
                    lat: results[i].geometry.location.lat(),
                    lng: results[i].geometry.location.lng()
                };

                (function (places) {
                    fbTaylorData.ref('/features/' + placeType + '/' + placeObj.properties.placeId).set(placeObj);
                })(results[i]);

                createMarker(place, placeLoc);
                //console.log(place);
            }
        }
        console.log('current index: [ ' + coordIndex + ' ] ends at: [ ' + (randomCoordinates.length -1) + ' ]');
        if (coordIndex === randomCoordinates.length-1) {
            clearInterval(apiInterval);
        }
    }


}

fbTaylorData.ref('/features/').once('value', function (snapshot) {
    console.warn(snapshot.val());
});

function createMarker(place, location) {
    //var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent('PLACE TYPE: ' + placeType + '<br>' + 'PLACE ID: ' + place.place_id + '<br>' + 'LAT: ' + location.lat + '<br>' + 'LNG: ' + location.lng);
        infowindow.open(map, this);
    });
}


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