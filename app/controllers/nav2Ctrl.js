angular.module('realValue')

    .controller('nav2Ctrl', function($mdSidenav, $mdDialog){
        var self = this;

        // right sidenav

        self.openRightMenu = function () {
            $mdSidenav('right').toggle();
        };

        // logo image path

        self.imagePath = './assets/img/RV-logo2.jpg';

        // dialog controller

        function dialogCtrl($mdDialog) {
            var dialogSelf = this;

            dialogSelf.cancel = function () {
                $mdDialog.cancel();
            };
        }

    });