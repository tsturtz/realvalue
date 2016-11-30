angular.module('realValue')

    .controller('proto2Ctrl', function($mdSidenav, $mdDialog){
        var self = this;

        // right sidenav

        self.openRightMenu = function () {
            $mdSidenav('right').toggle();
        };

        // logo image path

        self.imagePath = '../assets/img/RV-logo2.jpg';

        // places dialog

        self.showAdvanced = function() {
            $mdDialog.show({
                controller: detailsCtrl,
                controllerAs: 'pc',
                templateUrl: '../app/dialogs/details.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                escapeToClose: true,
                fullscreen: true
            });
        };

        // dialog controller

        function detailsCtrl($mdDialog) {
            var detailsSelf = this;

            detailsSelf.cancel = function () {
                $mdDialog.cancel();
            };
        }

    });