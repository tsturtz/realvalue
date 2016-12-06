angular.module('realValue')

    .controller('navCtrl', function($mdSidenav, $mdDialog, checkboxService){
        var self = this;

        self.types = ['airport', 'bar', 'cafe', 'crime', 'gas', 'gym', 'hospital', 'housing', 'library', 'museum', 'park', 'police', 'restaurant', 'school', 'traffic', 'university', 'walkScore', 'zoo'];

        self.updateData = function (data) {
            //checkboxService.updateSelections(data);
            self.itemPosition = self.types.indexOf(data.type);
            if (data.checked === false) {
                console.log(self.types);
                console.log(self.types.indexOf(data.type));
                self.types.splice(self.itemPosition,1);
                console.log(self.types);
            } else if (data.checked === true) {
                console.log(self.types);
                self.types.push(data.type);
                console.log(self.types);
            }
            self.totalChecked = self.types.length;
            console.log(self.totalChecked);
            county_los_angeles.features[0].properties.score = self.totalChecked;
            county_orange.features[0].properties.score = self.totalChecked;
            zip_92618.features[0].properties.score = self.totalChecked;
        };

        // checkboxes

        self.checkboxes = [
            {type: 'airport', checked: true, weight: 10},
            {type: 'bar', checked: true, weight: 10},
            {type: 'cafe', checked: true, weight: 10},
            {type: 'crime', checked: true, weight: 10},
            {type: 'gas', checked: true, weight: 10},
            {type: 'gym', checked: true, weight: 10},
            {type: 'hospital', checked: true, weight: 10},
            {type: 'housing', checked: true, weight: 10},
            {type: 'library', checked: true, weight: 10},
            {type: 'museum', checked: true, weight: 10},
            {type: 'park', checked: true, weight: 10},
            {type: 'police', checked: true, weight: 10},
            {type: 'restaurant', checked: true, weight: 10},
            {type: 'school', checked: true, weight: 10},
            {type: 'traffic', checked: true, weight: 10},
            {type: 'university', checked: true, weight: 10},
            {type: 'walkScore', checked: true, weight: 10},
            {type: 'zoo', checked: true, weight: 10}
        ];

        // right sidenav

        self.openRightMenu = function () {
            $mdSidenav('right').toggle();
        };

        // logo image path

        self.imagePath = './assets/img/RV-logo2.jpg';

        // welcome dialog

        self.welcomeDialog = function() {
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

        self.welcomeDialog();

        // dialog controller

        function dialogCtrl($mdDialog) {
            var dialogSelf = this;

            dialogSelf.cancel = function () {
                $mdDialog.cancel();
            };
        }



    });