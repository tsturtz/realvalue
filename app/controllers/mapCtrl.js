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
                data: [zip_92866,zip_92618,zip_92604,zip_92620],
                style: style,
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.popupContent);
                }
            }
        });

        function style(feature) {
            return {
                fillColor: getColor(feature.properties.population),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        function getColor(d) {
            return d > 70000 ? '#800026' :
                d > 60000  ? '#BD0026' :
                d > 50000  ? '#E31A1C' :
                d > 40000  ? '#FC4E2A' :
                d > 30000   ? '#FD8D3C' :
                d > 20000   ? '#FEB24C' :
                d > 10000   ? '#FED976' :
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

        //console.log(tiles);
        $scope.updateGeojson = function() {
            console.log("HI");
        }
    }]);