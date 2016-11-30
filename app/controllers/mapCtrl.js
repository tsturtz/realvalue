angular.module('realValue')

    .controller('mapController', function($scope){
        console.log("init map");
        $scope.center = {
            latitude: 33.63622083463071,
            longitude: -117.73948073387146
        };

        $scope.zoom = 10;

    });