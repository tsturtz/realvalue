angular.module('realValue')

    .controller('navCtrl', function($mdSidenav, $mdDialog, checkboxService){
        var self = this;

        self.types = ['jobs', 'airport', 'bar', 'cafe', 'crime', 'gas', 'gym', 'hospital', 'housing', 'library', 'museum', 'park', 'police', 'restaurant', 'school', 'traffic', 'university', 'walkScore', 'zoo'];

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

            //losangeles_geojson.features[0].properties.score = self.totalChecked;
            //tammy_geojson.features[0].properties.score = self.totalChecked;
            if(self.types.indexOf("crime") === -1) {
                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    if(self.hasProperty(tammy_geojson.features[i].properties,"crimes")) {
                        //console.log(tammy_geojson.features[i] + "has property");
                        console.log("crimes check");
                        tammy_geojson.features[i].properties.score = tammy_geojson.features[i].properties.score - tammy_geojson.features[i].properties.crimes;
                    }
                }
            }

            if(self.types.indexOf("jobs") === -1) {
                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    if(self.hasProperty(tammy_geojson.features[i].properties,"jobs")) {
                        //console.log(tammy_geojson.features[i] + "has property");
                        console.log("jobs check");
                        tammy_geojson.features[i].properties.score = tammy_geojson.features[i].properties.score - tammy_geojson.features[i].properties.jobs;
                    }
                }
            }
        };

        self.hasProperty = function(obj, str) {
            if(obj.hasOwnProperty(str)) {
               return true;
            } else {
                return false;
            }
        }

        // checkboxes

        self.checkboxes = [
            {type: 'jobs', checked: true, weight: 10},
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