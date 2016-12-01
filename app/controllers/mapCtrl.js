angular.module('realValue')

    .controller("mapController", [ '$scope', '$http', 'leafletData', 'leafletMapEvents', function($scope, $http, leafletData,leafletMapEvents) {
        angular.extend($scope, {
            center: {
                lat: 33.63622083463071,
                lng: -117.73948073387146,
                zoom: 10
            },
            tiles: tiles,
            geojson : {
                data: [zip_92866,zip_92618],
                style: {
                    fillColor: "green",
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup("Z-Index: " +feature.properties.popupContent);
                }
            }
        });

        $scope.searchIP = function(ip) {
            var url = "http://freegeoip.net/json/" + ip;
            $http.get(url).success(function(res) {
                $scope.center = {
                    lat: res.latitude,
                    lng: res.longitude,
                    zoom: 10
                };
                $scope.ip = res.ip;
            });
        };

        $scope.searchIP("");

        //console.log(tiles);
        $scope.updateGeojson = function() {
            console.log("HI");
        }
    }]);