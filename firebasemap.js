/**
 * Created by danh on 11/15/16.
 */
/*
 var config = {
 apiKey: "AIzaSyDA0QfT-TwSiFshrNjrg3yQ67bPBo4HVsw",
 authDomain: "realvalue-ebd58.firebaseapp.com",
 databaseURL: "https://realvalue-ebd58.firebaseio.com",
 storageBucket: "realvalue-ebd58.appspot.com",
 messagingSenderId: "73443138678"
 };

 */
    // Initialize Firebase
var config2 = {
    apiKey: "AIzaSyD7lWychYO044cw2lPl6chSaBTt85kId5E",
    authDomain: "datamap-3c35f.firebaseapp.com",
    databaseURL: "https://datamap-3c35f.firebaseio.com",
    storageBucket: "datamap-3c35f.appspot.com",
    messagingSenderId: "582541890710"
};
//firebase.initializeApp(config2);
//var fbRef = firebase.database();

    // Initialize Firebase
var config = {
        apiKey: "AIzaSyDVhiBbSbTkODuOvxnfYTA0vlZgpxPsKmw",
        authDomain: "c11realvalue.firebaseapp.com",
        databaseURL: "https://c11realvalue.firebaseio.com",
        storageBucket: "c11realvalue.appspot.com",
        messagingSenderId: "1058396963187"
    };

firebase.initializeApp(config);
var fbRef = firebase.database();

/**
 * Data object to be written to Firebase.
 */
var data = {
    sender: null,
    timestamp: null,
    lat: null,
    lng: null
};
/**
 *
 * @param controlDiv
 * @param map
 */
function makeInfoBox(controlDiv, map, text) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    var controlText = document.createElement('div');

    // Set custom info for controlUI
    if(text) {
        switch(text) {
            case "RealValue":
                controlUI.style.border = '2px solid orange';
                controlUI.style.marginRight = '10px';

                controlText.textContent = text;
                break;
            case "Traffic":
                controlUI.style.border = '2px solid orange';
                controlUI.style.marginRight = '10px';

                controlText.textContent = text;
                break;
            default:
                controlUI.style.border = '2px solid red';
                controlText.textContent = 'Average traffic time from center point: '+text;
                break;
        }
    } else {
        controlText.textContent = 'The map shows all markers around the center of your last click.';
    }
    controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.borderRadius = '2px';
    controlUI.style.marginBottom = '22px';
    controlUI.style.marginTop = '10px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '100%';
    controlText.style.padding = '6px';
    controlUI.appendChild(controlText);
}

var markers = [];
var cmarkers = [];
var initLoad = true;
var realvalue = 0;
var map;
var centerPoint = {lat: 33.63622083463071, lng: -117.73948073387146};
var styleArray = [
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "saturation": "-64"
            },
            {
                "color": "#22d4c5"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "hue": "#ff0000"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#0e7e7e"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "hue": "#00d3ff"
            },
            {
                "gamma": "0.00"
            },
            {
                "weight": "0.45"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "hue": "#00ff90"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#87a543"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#d7d7d1"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.attraction",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#0e62ad"
            },
            {
                "visibility": "on"
            },
            {
                "lightness": "16"
            },
            {
                "saturation": "-36"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#f3e8e8"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
            {
                "hue": "#ff0000"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "hue": "#ff0000"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#FFFFFF"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "hue": "#ff7a00"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "hue": "#ff0000"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#949494"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#20384f"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "color": "#949494"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#949494"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#587f94"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#82be9c"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#82be9c"
            }
        ]
    }
];
/**
 *
 */
function initMap() {
    // make map a global variable for all outside functions of init
    map = new google.maps.Map(document.getElementById('map'), {
        center: centerPoint,
        zoom: 11,
        disableDoubleClickZoom: true,
        styles: styleArray
    });

    marker = new google.maps.Marker({
        position: centerPoint,
        label: 'A',
        map: map
    });
    cmarkers.push(marker);

    // Create the DIV to hold the control and call the makeInfoBox() constructor
    // passing in this DIV.
    var infoBoxDiv = document.createElement('div');
    makeInfoBox(infoBoxDiv, map);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);

    // Create the DIV to hold RealValue
    var infoBoxDivSelector = document.createElement('div');
    infoBoxDivSelector.setAttribute("class","iReavlValue");
    makeInfoBox(infoBoxDivSelector, map, "RealValue");
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(infoBoxDivSelector);
    // Create the DIV to hold Traffic
    var infoBoxDivSelector = document.createElement('div');
    infoBoxDivSelector.setAttribute("class","iTraffic");
    makeInfoBox(infoBoxDivSelector, map, "Traffic");
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(infoBoxDivSelector);

    // Listen for clicks and add the location of the click to firebase.
    map.addListener('click', function (e) {
        initLoad = false;
        data.lat = e.latLng.lat();
        data.lng = e.latLng.lng();
        //console.log("clicked", data);
        var calculateDistance = DistanceBetweenTwoPoints(centerPoint, data);
        //console.log("distance between center and clicked is " + calculateDistance);
        // Clear markers on map and clear reference to them
        centerSetMapOnAll(null);
        cmarkers = [];
        setMapOnAll(null);
        markers = [];
        // Pan to area that was clicked on on map
        map.panTo(data);
        // Add the click to firebase
        addToFirebase(data);
        // Initalize reading of firebase datase
        firebaseIt();
        // Run the Distance Matrix API to show traffic estimate data
        initGoogleDistanceMatrix();
        walkscore(data);
        weather(data);
    });
}
    var i = 0;
    var posArray = [];
    var zIndexAvg = 0;
    var zIndexArr = [];

function firebaseIt() {
    fbRef.ref('clicks').once('value', function (snapshot) {
        //console.log("HI", centerPoint);
        var obj = snapshot.val();
        realvalue = 0;
        posArray = [];
        zIndexAvg = 0;
        zIndexArr = [];

        var timer = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var databaseObj = {
                    lat: Number(obj[key].lat),
                    lng: Number(obj[key].lng)
                }
                // if map is loaded for first time, calculate distance from original center point
                if (initLoad === true) {
                    var calculateDistance = DistanceBetweenTwoPoints(centerPoint, databaseObj);
                } else { // if user clicked, then calculate user clicked point
                    //console.log("data ", data);
                    var calculateDistance = DistanceBetweenTwoPoints(data, databaseObj);
                }

                if (calculateDistance < 0.06 && key != 'user') {
                    realvalue++;
                    zIndexArr.push(Number(obj[key].zindex));
                    //console.log("distance is " + calculateDistance);
                    /*
                    var marker = new google.maps.Marker({
                        position: {
                            lat: Number(obj[key].lat),
                            lng: Number(obj[key].lng)
                        },
                        label: obj[key].name,
                        animation: google.maps.Animation.DROP,
                        map: map
                    });*/
                    markers.push(marker);
                    posArray.push(databaseObj);
                    addMarkerWithTimeout(databaseObj, timer *50);
                    timer++;
                    //console.log("timer ",databaseObj);
                }
            }
        }
        if (initLoad === false) {
            // Clear markers on map and clear reference to them
            //console.log("Sum", zIndexSum);
            //console.log("total", realvalue);
            // Calculate the average zillow index
            zIndexAvg = calculateAverageZillowIndex(zIndexArr,2);
            centerSetMapOnAll(null);
            cmarkers = [];
            setCenterPointOnMap(data, map, zIndexAvg);
        }
    });
}

function calculateAverageZillowIndex(zillow, digit) {
    //var trafficLayer = new google.maps.TrafficLayer();
    //trafficLayer.setMap(map);
    return Math.round( zillow.reduce(function (a,b) {return a+b;})/zillow.length, digit );
}

/**
 *
 * @param position
 * @param timeout
 */
function addMarkerWithTimeout(position, timeout) {
    window.setTimeout(function() {
        markers.push(new google.maps.Marker({
            position: position,
            map: map,
            animation: google.maps.Animation.DROP
        }));
    }, timeout);
    //console.log("inside ", position);
}

/**
 *
 * @param latlng
 * @param map
 * @param text
 */
// Place a center marker on the center point of the map
function setCenterPointOnMap(latlng,map,text) {

    var marker = new google.maps.Marker({
        position: latlng,
        icon: {
            url:'assets/images/Map-Marker.png',
            scaledSize: new google.maps.Size(200, 150)
        },
        label: {
            text: 'RealValue: ' + text,
            color: 'darkblue'
        },
        title: 'RealValue: ' + text,
        labelClass: "labels", // the CSS class for the label
        optimized: false,
        map: map
    });

    // I create an OverlayView, and set it to add the "markerLayer" class to the markerLayer DIV
    var myoverlay = new google.maps.OverlayView();
    myoverlay.draw = function () {
        this.getPanes().markerLayer.id='markerLayer';
    };
    myoverlay.setMap(map);
    cmarkers.push(marker);
}
/**
 *
 * @param map
 */
// clears the markers on the map through the array
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}
/**
 *
 * @param map
 */
// clear center markers on amp
function centerSetMapOnAll(map) {
    for (var i = 0; i < cmarkers.length; i++) {
        cmarkers[i].setMap(map);
    }
}

/**
 * Adds a click to firebase.
 * @param {Object} data The data to be added to firebase.
 *     It contains the lat, lng, and timestamp.
 */
function addToFirebase(data) {
    data.startedAt = firebase.database.ServerValue.TIMESTAMP;
    //console.log("clicked!", data);
    fbRef.ref('clicks/user').set(data);
}
/**
 *
 */
function ajaxCall() {
    console.log("calling AJAX");
    $.ajax({
        url: 'zillow_get.php',
        //url: "http://www.zillow.com/webservice/GetRegionChildren.htm?zws-id=X1-ZWz19hii866bd7_14qhc&regionId=1286&childtype=zipcode",
        success: function(response) {
            console.log("response", response.response.list.region);
            var data = response.response.list.region;
            for(var i =0;i<data.length;i++) {
                if(data[i].zindex)
                {
                    var obj = {
                        id: data[i].id,
                        lat: data[i].latitude,
                        lng: data[i].longitude,
                        name: data[i].name,
                        zindex: data[i].zindex
                    };
                    fbRef.ref('clicks/'+data[i].name).set(obj);
                }

            }
        }
    });
}
/**
 *
 * @param obj
 * @param obj2
 * @returns {number}
 * @constructor
 */
function DistanceBetweenTwoPoints(obj, obj2) {

    var a = obj.lat - obj2.lat;
    var b = obj.lng - obj2.lng;

    var c = Math.sqrt( a*a + b*b);

    return c;
}

    var multDiv = 0;
    var markersArray = [];
    var globalbound;

/**
 *
 */
function initGoogleDistanceMatrix() {

    var bounds = new google.maps.LatLngBounds;
    bounds.extend(centerPoint);
    var origin1 = data;
    var destinationA = centerPoint;

    var destinationIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=O|FFFF00|000000';

    var geocoder = new google.maps.Geocoder;

    // calculate the date for Departure time for Google Distance Matrix
    var days = .2; // Days you want to subtract
    var date = new Date();
    date.setDate(date.getDate() + (4 + 7 - date.getDay()) % 7);
    date.setHours(15);
    //var last = new Date(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var last = new Date(date.getTime());
    console.log("date: " + last);

    var service = new google.maps.DistanceMatrixService;
    var directionsService = new google.maps.DirectionsService();
    //service.getDistanceMatrix({
    directionsService.route({
        origin: origin1,
        destination: destinationA,
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: true,
        drivingOptions: {
            departureTime: last,
            trafficModel: google.maps.TrafficModel.PESSIMISTIC
        }
    }, function(response, status) {
        if (status !== 'OK') {
            alert('Error was: ' + status);
        } else {
            //console.log("response", response);
            var originList = [];
            var destinationList = [];
            originList.push(response.routes[0].legs[0].start_address);
            destinationList.push(response.routes[0].legs[0].end_address);
            var outputDiv = document.getElementById('output');
            outputDiv.innerHTML = '';
            //console.log("markersArray", markersArray);
            deleteMarkers(markersArray);

            // remove the previous Distance Matrix Div by class
            $("div.bottomDiv").remove();
            // Create the DIV to hold the control and call the makeInfoBox() constructor
            // passing in this DIV.
            var infoBoxDiv = document.createElement('div');
            infoBoxDiv.setAttribute("class","bottomDiv");
            makeInfoBox(infoBoxDiv, map, response.routes[0].legs[0].duration_in_traffic.text);
            map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(infoBoxDiv);

            var showGeocodedAddressOnMap = function(asDestination) {
                var icon = asDestination ? destinationIcon : originIcon;
                return function(results, status) {
                    if (status === 'OK') {
                        //map.panTo(data);
                        //console.log('response',response);
                        //console.log("bound",bounds);
                        // assign this globally for document ready pan function
                        globalbound = bounds;
                        //map.fitBounds(bounds.extend(results[0].geometry.location));
                        markersArray.push(new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location,
                            icon: icon
                        }));
                    } else {
                        alert('Geocode was not successful due to: ' + status);
                    }
                };
            };

            for (var i = 0; i < originList.length; i++) {
                //console.log("WTF", originList);
                var results = originList;
                geocoder.geocode({'address': originList[i]},
                    showGeocodedAddressOnMap(false));
                for (var j = 0; j < results.length; j++) {
                    geocoder.geocode({'address': destinationList[j]},
                        showGeocodedAddressOnMap(true));
                }
            }
        }
    });
}
/**
 *
 * @param markersArray
 */
function deleteMarkers(markersArrayP) {
    for (var i = 0; i < markersArrayP.length; i++) {
        markersArrayP[i].setMap(null);
    }
    //console.log('markersArray', markersArray)
    /* clear markers after deleting */
    markersArray = [];
}

$(document).ready(function(){
    //console.log("ready");

    $("#map").on('click','.bottomDiv',function(){
        //console.log("clicked");
        map.fitBounds(globalbound.extend(data));
    })
});