angular.module('realValue')

    .controller('navCtrl', function($mdSidenav, $mdDialog, checkboxService){
        var self = this;
        var score;
        var crimes;
        var jobs;

        self.types = ['jobs', 'airport', 'bar', 'cafe', 'crime', 'gas', 'gym', 'hospital', 'housing', 'library', 'museum', 'park', 'police', 'restaurant', 'school', 'traffic', 'university', 'walkScore', 'zoo'];

        self.updateData = function (data) {
            //checkboxService.updateSelections(data);
            self.itemPosition = self.types.indexOf(data.type);
            if (data.checked === false) {
                console.log(self.types);
                console.log(self.types.indexOf(data.type));
                self.types.splice(self.itemPosition,1);
                console.log(self.types);
                this.applyUpdate("-");
            } else if (data.checked === true) {
                console.log(self.types);
                self.types.push(data.type);
                console.log(self.types);
                this.deApplyUpdate("+");
            }
            self.totalChecked = self.types.length;
            console.log(self.totalChecked);
            county_los_angeles.features[0].properties.score = self.totalChecked;
            county_orange.features[0].properties.score = self.totalChecked;
        };

        self.applyUpdate = function(operator) {

            if(self.evalCheck("crime")) {
                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    if(self.hasProperty(tammy_geojson.features[i].properties,"crimes")) {
                        //console.log(tammy_geojson.features[i] + "has property");
                        console.log("crimes check");
                        crimes = tammy_geojson.features[i].properties.crimes;
                        score = tammy_geojson.features[i].properties.score;
                        tammy_geojson.features[i].properties.score = self.doMath(parseInt(score),parseInt(jobs)*5000,operator);
                    }
                }
            }

            if(self.evalCheck("crime")) {
                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    if(self.hasProperty(losangeles_geojson.features[i].properties,"crimes")) {
                        //console.log(losangeles_geojson.features[i] + "has property");
                        console.log("crimes check");
                        crimes = losangeles_geojson.features[i].properties.crimes;
                        score = losangeles_geojson.features[i].properties.score;
                        losangeles_geojson.features[i].properties.score = self.doMath(parseInt(score),parseInt(crimes)*5000,operator);
                    }
                }
            }

            if(self.evalCheck("jobs")) {
                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    if(self.hasProperty(tammy_geojson.features[i].properties,"jobs")) {
                        //console.log(tammy_geojson.features[i] + "has property");
                        console.log("jobs check");
                        score = tammy_geojson.features[i].properties.score;
                        jobs = tammy_geojson.features[i].properties.jobs;
                        tammy_geojson.features[i].properties.score = self.doMath(parseInt(score),parseInt(jobs),operator);
                    }
                }
            }

            if(self.evalCheck("jobs")) {
                for(var i = 0; i<losangeles_geojson.features.length;i++) {
                    if(self.hasProperty(losangeles_geojson.features[i].properties,"jobs")) {
                        //console.log(losangeles_geojson.features[i] + "has property");
                        console.log("jobs check");
                        score = losangeles_geojson.features[i].properties.score;
                        jobs = losangeles_geojson.features[i].properties.jobs;
                        losangeles_geojson.features[i].properties.score = self.doMath(parseInt(score),parseInt(jobs),operator);
                    }
                }
            }
        };

        self.evalCheck = function(attr) {
            return (self.types.indexOf(attr) === -1);
        }

        self.doMath = function(param1, param2, operator) {
            switch(operator) {
                case "+":
                    return param1 + param2;
                case "-":
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