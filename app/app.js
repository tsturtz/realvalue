/**
 * Angular App Configuration
 * RealValue App using Angular Material
 *
 * @config Disable Aria Warnings
 * @config Configure Angular Material Themes
 * @config Configure URL View Routes
 */

angular.module('realValue', ['ngMaterial'])

    .config(function ($mdAriaProvider) {
        $mdAriaProvider.disableWarnings();
    })

    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('teal', {'default': '500'})
            .accentPalette('indigo', {'default': '500'})
            .warnPalette('red', {'default': 'A200'});
            //.dark();
        $mdThemingProvider.definePalette('white', {
            '50': '#fff',
            '100': '#fff',
            '200': '#fff',
            '300': '#fff',
            '400': '#fff',
            '500': '#fff',
            '600': '#fff',
            '700': '#fff',
            '800': '#fff',
            '900': '#fff',
            'A100': '#fff',
            'A200': '#fff',
            'A400': '#fff',
            'A700': '#fff',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                // on this palette should be dark or light
            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                '200', '300', '400', 'A100'],
            'contrastLightColors': undefined    // could also specify this if default was 'dark'
        });
    });

/* disabled routing for now - make sure to add back the ngRoute dependency

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
    });

*/