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
                style: style,
                onEachFeature: function (feature, layer) {
                    layer.bindPopup("Z-Index: " +feature.properties.popupContent);
                }
            }
        });

        function style(feature) {
            return {
                fillColor: getColor(feature.properties.density),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        function getColor(d) {
            return d > 1000 ? '#800026' :
                d > 500  ? '#BD0026' :
                d > 200  ? '#E31A1C' :
                d > 100  ? '#FC4E2A' :
                d > 50   ? '#FD8D3C' :
                d > 20   ? '#FEB24C' :
                d > 10   ? '#FED976' :
                           '#FFEDA0';
        }

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