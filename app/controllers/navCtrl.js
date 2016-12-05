angular.module('realValue')

    .controller('navCtrl', function($mdSidenav, $mdDialog, checkboxService){
        var self = this;

        self.updateData = function (data) {
            checkboxService.updateSelections(data);
        };

        // checkboxes

        self.checkboxes = [
            {type: 'airport', checked: true, weight: 10},
            {type: 'bar/nightclub', checked: true, weight: 10},
            {type: 'cafe', checked: true, weight: 10},
            {type: 'crime', checked: true, weight: 10},
            {type: 'gas station', checked: true, weight: 10},
            {type: 'gym', checked: true, weight: 10},
            {type: 'hospital', checked: true, weight: 10},
            {type: 'housing/rental market', checked: true, weight: 10},
            {type: 'library', checked: true, weight: 10},
            {type: 'museum', checked: true, weight: 10},
            {type: 'park', checked: true, weight: 10},
            {type: 'police dept.', checked: true, weight: 10},
            {type: 'restaurant', checked: true, weight: 10},
            {type: 'school', checked: true, weight: 10},
            {type: 'traffic', checked: true, weight: 10},
            {type: 'university', checked: true, weight: 10},
            {type: 'walk score', checked: true, weight: 10},
            {type: 'zoo', checked: true, weight: 10}
        ];

        // right sidenav

        self.openRightMenu = function () {
            $mdSidenav('right').toggle();
        };

        // logo image path

        self.imagePath = './assets/img/RV-logo2.jpg';

        // welcome dialog

        self.showAdvanced = function() {
            $mdDialog.show({
                controller: dialogCtrl,
                controllerAs: 'dc',
                templateUrl: 'app/dialogs/welcome.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                escapeToClose: false,
                fullscreen: true
            });
        };

        self.showAdvanced();

        // dialog controller

        function dialogCtrl($mdDialog) {
            var dialogSelf = this;

            dialogSelf.cancel = function () {
                $mdDialog.cancel();
            };
        }

    });