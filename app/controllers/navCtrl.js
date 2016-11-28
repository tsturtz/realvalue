angular.module('realValue')

    .controller('navCtrl', function($mdSidenav, $mdDialog){
        var self = this;

        // right sidenav

        self.openRightMenu = function () {
            $mdSidenav('right').toggle();
        };

        // dialog

        setTimeout(self.showAlert = function () {
            console.log('got something');
            alert = $mdDialog.alert()
                .title('[logo] Welcome to RealValue')
                .content('RealValue is an intuitive application built to display area values based on a number of statistics. Currently this service is only available in Los Angeles and Orange County, CA. You decide which statistics are important to you to update the map in real time. If you\'re looking to relocate or change jobs, RealValue can assist you to find an area that, to you, has real value.')
                .ok('Continue');
            $mdDialog
                .show(alert)
                .finally(function() {
                    alert = undefined;
                });
        },50);

        // logo image path

        self.imagePath = 'assets/img/RV-logo2.jpg';

    });