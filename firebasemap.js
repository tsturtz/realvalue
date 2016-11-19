/**
 * Created by danh on 11/15/16.
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
function makeInfoBox(controlDiv, map) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '2px';
    controlUI.style.marginBottom = '22px';
    controlUI.style.marginTop = '10px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '100%';
    controlText.style.padding = '6px';
    controlText.textContent = 'The map shows all markers around the center of your last click.';
    controlUI.appendChild(controlText);
}

var markers = [];
var cmarkers = [];
var initLoad = true;
var realvalue = 0;
var map;
var centerPoint = {lat: 33.667011, lng: -117.764183};
var styleArray = [
    {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}]
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}]
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}]
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}]
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}]
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}]
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

    // Listen for clicks and add the location of the click to firebase.
    map.addListener('click', function (e) {
        console.log("fired");
        initLoad = false;
        data.lat = e.latLng.lat();
        data.lng = e.latLng.lng();
        var calculateDistance = DistanceBetweenTwoPoints(centerPoint, data);
        //console.log("distance between center and clicked is " + calculateDistance);
        // Clear markers on map and clear reference to them
        centerSetMapOnAll(null);
        cmarkers = [];
        setMapOnAll(null);
        markers = [];
        // Pan to area that was clicked on on map
        map.panTo(data);
        addToFirebase(data);
        firebaseIt();
    });
}
    var i = 0;
    var posArray = [];

function firebaseIt() {
    fbRef.ref('clicks').once('value', function (snapshot) {
        console.log("HI", centerPoint);
        var obj = snapshot.val();
        realvalue = 0;
        posArray = [];
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
            centerSetMapOnAll(null);
            cmarkers = [];
            setCenterPointOnMap(data, map, realvalue);
        }
    });
}
console.log("position markers",posArray);
/**
 *
 */
function dropMarkers() {
    for (var i = 0; i < posArray.length; i++) {
        console.log(i);
        addMarkerWithTimeout(posArray[i], i * 200);
    }

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
            scaledSize: new google.maps.Size(150, 150)
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

//ajaxCall();