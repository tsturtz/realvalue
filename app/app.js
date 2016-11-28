angular.module('realValue',['ngRoute','uiGmapgoogle-maps'])

    .config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyA2kAIGCDvNlIMiixW5rwjBiDsari5dKrc',
            v: '3.20', //defaults to latest 3.X anyhow
            libraries: 'weather,geometry,visualization'
        });
    })

    .controller('mainCtrl', function($scope) {
        $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
    });