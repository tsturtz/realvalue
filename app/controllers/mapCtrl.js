angular.module('realValue')

    .controller("mapController", [ '$scope', '$http', 'leafletData', function($scope, $http, leafletData) {
        angular.extend($scope, {
            center: {
                lat: 33.63622083463071,
                lng: -117.73948073387146,
                zoom: 10
            },
            tiles: tiles,
            markers: {
                center: {
                    lat: 33.63622083463071,
                    lng: -117.73948073387146,
                    message: "I am here!",
                    focus: true,
                    draggable: false
                }
            },
            geojson : {
                data: [zip_92866,zip_92618],
                style: {
                    fillColor: "green",
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                }
            }
        });

        console.log(tiles);
        $scope.updateGeojson = function() {
            console.log("HI");
        }
    }]);