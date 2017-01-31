/**
 * Angular App Configuration
 * RealValue App using Angular Material
 *
 * @config Disable Aria Warnings
 * @config Configure Angular Material Themes
 * @config Configure URL View Routes
 */

angular.module('realValue', ['ngMaterial','leaflet-directive']) //TODO ngMessages

    .config(function( $mdGestureProvider ) {
        $mdGestureProvider.skipClickHijack();
    })

    .config(function ($mdAriaProvider) {
        $mdAriaProvider.disableWarnings();
    })

    .config(function($logProvider){
        $logProvider.debugEnabled(false);
    })

    .config(function ($mdThemingProvider) {
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
        $mdThemingProvider.theme('default')
            .primaryPalette('teal', {'default': '500'})
            .accentPalette('grey', {'default': '800'})
            .warnPalette('orange', {'default': '500'});
            //.dark();
        $mdThemingProvider.theme('search')
            .primaryPalette('white')
            .accentPalette('teal', {'default': '500'})
            .dark();
    });
