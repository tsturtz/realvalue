angular.module('realValue')

    .controller("navCtrl", [ '$scope', '$http', 'leafletData', 'leafletMapEvents', 'checkboxService','dataService','$mdDialog', '$mdSidenav', function($scope, $http, leafletData, leafletMapEvents, checkboxService,dataService, $mdDialog, $mdSidenav) {
        var self = this;
        var score;
        var attribute;
        var jobs;
        var weight;
        var temp_attr;

        self.types = ['jobs', 'airport', 'bar', 'cafe', 'crimes', 'gas', 'gym', 'hospital', 'housing', 'library', 'museum', 'park', 'police', 'restaurant', 'school', 'traffic', 'university', 'walkScore', 'zoo'];

        self.updateData = function (data) {
            //checkboxService.updateSelections(data);
            self.itemPosition = self.types.indexOf(data.type);
            console.log("pos ", self.itemPosition);
            if (data.checked === false) {
                temp_attr = self.types[self.itemPosition];
                this.applyUpdate(temp_attr, "-", 1);
                //console.log(self.types);
                //console.log(self.types.indexOf(data.type));
                self.types.splice(self.itemPosition,1);
                //console.log(self.types);
                //console.log(self.itemPosition);
            } else if (data.checked === true) {
                //temp_attr = self.types[self.types.indexOf(data.type)];
                //console.log(self.types);
                self.types.push(data.type);
                //console.log(self.types);
                this.applyUpdate(temp_attr, "+", 1);
            }
            self.totalChecked = self.types.length;
            //console.log(self.totalChecked);
            county_los_angeles.features[0].properties.score = self.totalChecked;
            county_orange.features[0].properties.score = self.totalChecked;
        };

        self.applyUpdate = function(attr, operator, checked) {
            if(attr === "crimes") {
                console.log("crime");
                weight = -1;
            } else {
                console.log("not crime");
                weight = 1;
            }
            console.log(attr);
            if(checked === 1) {
                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    if(self.hasProperty(tammy_geojson.features[i].properties,attr)) {
                        //console.log(tammy_geojson.features[i] + "has property");
                        attribute = tammy_geojson.features[i].properties[attr];
                        score = tammy_geojson.features[i].properties.score;
                        jobs = tammy_geojson.features[i].properties.jobs;
                        tammy_geojson.features[i].properties.score = self.doMath(parseInt(score),parseInt(attribute*weight),operator);
                    }
                }
            }

            if(checked === 1) {
                for(var i = 0; i<losangeles_geojson.features.length;i++) {
                    if(self.hasProperty(losangeles_geojson.features[i].properties,attr)) {
                        //console.log(losangeles_geojson.features[i] + "has property");
                        //console.log(losangeles_geojson.features[i].properties.crimes);
                        attribute = losangeles_geojson.features[i].properties[attr];
                        score = losangeles_geojson.features[i].properties.score;
                        jobs = losangeles_geojson.features[i].properties.jobs;
                        losangeles_geojson.features[i].properties.score = self.doMath(parseInt(score),parseInt(attribute*weight),operator);
                    }
                }
            }
        };

        self.doMath = function(param1, param2, operator) {
            switch(operator) {
                case "+":
                    //console.log(param1 + param2);
                    return param1 + param2;
                case "-":
                    //console.log(param1 + param2);
                    return param1 - param2;
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
            {type: 'crimes', checked: true, weight: 10},
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


        self.submit = function() {

            console.log(mc);
        };

        self.welcomeDialog();

        // dialog controller

        function dialogCtrl($mdDialog) {
            var dialogSelf = this;

            dialogSelf.cancel = function () {
                $mdDialog.cancel();
            };
        }



    }]);