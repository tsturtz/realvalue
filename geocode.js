function geocode(data) {
    var deferred = Q.defer();
    var geocoder = new google.maps.Geocoder;
    var latlng = {lat: data.lat, lng: data.lng};
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
            if (results[1]) {
                deferred.resolve(results[1]);
            }
        }
    });
    return deferred.promise;
}
