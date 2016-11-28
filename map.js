/**
 * Created by danh on 11/24/16.
 */
angular.module("googleMap",['uiGmapgoogle-maps'])

.controller("mapController", function($scope) {
    $scope.center = {
        latitude: 33.63622083463071,
        longitude: -117.73948073387146
    };

    $scope.zoom = 11;
});