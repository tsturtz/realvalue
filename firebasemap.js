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
    controlText.textContent = 'The map shows all clicks made in the last 10 minutes.';
    controlUI.appendChild(controlText);
}

var markers = [];
var cmarkers = [];
var initLoad = true;

function initMap() {
    var centerPoint = {lat:33.667011, lng: -117.764183};

    var map = new google.maps.Map(document.getElementById('map'), {
        center: centerPoint,
        zoom: 11,
        styles: [{
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]  // Turn off points of interest.
        }, {
            featureType: 'transit.station',
            stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
        }],
        disableDoubleClickZoom: true
    });

    var marker = new google.maps.Marker({
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
    map.addListener('click', function(e) {
        initLoad = false;
        data.lat = e.latLng.lat();
        data.lng = e.latLng.lng();
        var calculateDistance = DistanceBetweenTwoPoints(centerPoint,data);
        console.log("distance between center and clicked is " + calculateDistance);
        // Clear markers on map and clear reference to them
        centerSetMapOnAll(null);
        cmarkers = [];
        setMapOnAll(null);
        markers = [];
        // Pan to area that was clicked on on map
        setCenterPointOnMap(data,map);
        map.panTo(data);
        addToFirebase(data);
    });

    // Create a heatmap.
    var heatmap = new google.maps.visualization.HeatmapLayer({
        data: [],
        map: map,
        radius: 16
    });

    initFirebase.bind(undefined, heatmap);
    initFirebase();
    var i = 0;
    fbRef.ref('clicks').on('value', function(snapshot){
        var obj = snapshot.val();
        for(var key in obj){
            if(obj.hasOwnProperty(key)) {
                //console.log(obj[key].lat, obj[key].lng);
                //var point = new google.maps.LatLng(obj[key].lat, obj[key].lng);
                //heatmap.getData().push(point);
                var databaseObj = {
                    lat: obj[key].lat,
                    lng: obj[key].lng
                }
                // if map is loaded for first time, calculate distance from original center point
                if (initLoad === true) {
                    var calculateDistance = DistanceBetweenTwoPoints(centerPoint,databaseObj);
                } else { // if user clicked, then calculate user clicked point
                    //console.log("data ", data);
                    var calculateDistance = DistanceBetweenTwoPoints(data,databaseObj);
                }

                if(calculateDistance < 0.1) {
                    //console.log("distance is " + calculateDistance);
                    var marker = new google.maps.Marker({
                        position: { lat: Number(obj[key].lat),
                            lng: Number(obj[key].lng) },
                        label: obj[key].name,
                        map: map
                    });
                    markers.push(marker);
                }

                //console.log(marker);
                var p = $("<p>",{
                    text: i++ + ' ' + obj[key].lat + ' ' + obj[key].lng + ' ' + obj[key].zindex + ' ' + obj[key].name
                });
                $("#display").append(p);
            }
        }
    });

}

// Place a center marker on the center point of the map
function setCenterPointOnMap(latlng,map) {

    var marker = new google.maps.Marker({
        position: latlng,
        label: 'A',
        map: map
    });
    cmarkers.push(marker);
}

// clears the markers on the map through the array
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}
// clear center markers on amp
function centerSetMapOnAll(map) {
    for (var i = 0; i < cmarkers.length; i++) {
        cmarkers[i].setMap(map);
    }
}
/**
 * Set up a Firebase with deletion on clicks older than expirySeconds
 * @param {!google.maps.visualization.HeatmapLayer} heatmap The heatmap to
 * which points are added from Firebase.
 */
function initFirebase(heatmap) {
    console.log("init");
    // 10 minutes before current time.
    var startTime = new Date().getTime() - (60 * 10 * 1000);

    // Reference to the clicks in Firebase.
    //var clicks = fbRef.ref('clicks');
    var clicks = fbRef.ref('places'); //

    // Listener for when a click is added.
    clicks.orderByChild('timestamp').startAt(startTime).on('child_added',
        function(snapshot) {

            // Get that click from firebase.
            var newPosition = snapshot.val();
            var point = new google.maps.LatLng(newPosition.lat, newPosition.lng);
            var elapsed = new Date().getTime() - newPosition.timestamp;

            // Add the point to  the heatmap.
            heatmap.getData().push(point);

            // Requests entries older than expiry time (10 minutes).
            var expirySeconds = Math.max(60 * 10 * 1000 - elapsed, 0);
            // Set client timeout to remove the point after a certain time.
            window.setTimeout(function() {
                // Delete the old point from the database.
                snapshot.ref().remove();
            }, expirySeconds);
        }
    );

    // Remove old data from the heatmap when a point is removed from firebase.
    clicks.on('child_removed', function(snapshot, prevChildKey) {
        var heatmapData = heatmap.getData();
        var i = 0;
        while (snapshot.val().lat != heatmapData.getAt(i).lat()
        || snapshot.val().lng != heatmapData.getAt(i).lng()) {
            i++;
        }
        heatmapData.removeAt(i);
    });
}

/**
 * Adds a click to firebase.
 * @param {Object} data The data to be added to firebase.
 *     It contains the lat, lng, and timestamp.
 */
function addToFirebase(data) {
    data.startedAt = firebase.database.ServerValue.TIMESTAMP;
    console.log("clicked!", data);
    fbRef.ref('clicks/user').set(data);
}

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

function DistanceBetweenTwoPoints(obj, obj2) {

    var a = obj.lat - obj2.lat;
    var b = obj.lng - obj2.lng;

    var c = Math.sqrt( a*a + b*b);

    return c;
}

//ajaxCall();