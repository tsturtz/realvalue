angular.module('realValue')

    .controller('protoCtrl', function($mdSidenav){
        var self = this;

        // right sidenav

        self.openRightMenu = function () {
            $mdSidenav('right').toggle();
        };

        // logo image path

        self.imagePath = '../assets/img/RV-logo2.jpg';

    });