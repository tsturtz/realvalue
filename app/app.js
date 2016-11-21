angular.module('realValue',['ngRoute'])

.config(function($routeProvider) {
    $routeProvider
        .when('/',{
            templateUrl: 'views/map.html',
            controller: 'mapController'
        })
        .when('/map',{
            templateUrl: 'views/map.html',
            controller: 'mapController'
        })
        .when('/about',{
            templateUrl: 'views/about.html',
            controller: 'aboutController'
        })
        .otherwise({ redirectTo: 'views/map.html' });
})

.controller('mapController', function(){})
.controller('aboutController', function(){})

;
