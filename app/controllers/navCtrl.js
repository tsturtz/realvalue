angular.module('realValue')

    .controller("navCtrl", [ '$scope', '$http', 'leafletData', 'leafletMapEvents', 'checkboxService','dataService','$mdDialog', '$mdSidenav', function($scope, $http, leafletData, leafletMapEvents, checkboxService,dataService, $mdDialog, $mdSidenav) {
        var self = this;
        var score;
        var attribute;
        var jobs;
        var crimes;
        var weight;
        var temp_attr;
        self.sidebarStatus;

        self.types = ['jobs', 'crimes', 'housing', 'park', 'university'];

        self.updateData = function (data) {
            //checkboxService.updateSelections(data);
            self.itemPosition = self.types.indexOf(data.type);
            //console.log("pos ", self.itemPosition);
            if (data.checked === false) {
                temp_attr = self.types[self.itemPosition];
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
            }
            self.totalChecked = self.types.length;
            this.applyUpdate(temp_attr, "+", 1);
            //console.log(self.totalChecked);
            county_los_angeles.features[0].properties.score = self.totalChecked;
            county_orange.features[0].properties.score = self.totalChecked;
        };

        self.applyUpdate = function(attr, operator, checked) {
            //console.log(attr);
            var counter = 0;
            var total = 100;
            var weight;
            var jobs_yes;
            var crimes_yes;
            //console.log("counter " + counter);
            //console.log("jobs find " + self.types.indexOf("jobs"));
            if(self.types.indexOf("jobs") > -1) {
                counter++;
                jobs_yes = 1;
            } else {
                jobs_yes = 0;
            }
            //console.log("crime find " + self.types.indexOf("crimes"));
            if(self.types.indexOf("crimes") > -1) {
                counter++;
                crimes_yes = 1;
            } else {
                crimes_yes = 0;
            }
            weight = 100 / counter;
            console.log('counter ' + counter);
            console.log('weight ' + weight);
            console.log('crime ' + crimes_yes + ' jobs ' + jobs_yes);
            var job_weight = (weight/dataService.crime_and_job_data_analysis.all.jobMax) * jobs_yes;
            var crime_weight = (-1 * weight/dataService.crime_and_job_data_analysis.all.crimeMax) * crimes_yes;
            console.log('job weight ' + job_weight);
            console.log('crime weight ' + crime_weight);
            //console.log("attributes " + counter);

            if(checked === 1) {
                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    if(self.hasProperty(tammy_geojson.features[i].properties,attr)) {
                        //console.log(tammy_geojson.features[i] + "has property");
                        attribute = tammy_geojson.features[i].properties[attr];
                        score = tammy_geojson.features[i].properties.score;
                        jobs = tammy_geojson.features[i].properties.jobs;
                        crimes = tammy_geojson.features[i].properties.crimes;
                        tammy_geojson.features[i].properties.score = Math.round((parseInt(jobs)*job_weight) + ((weight*crime_weight) + parseInt(crimes)*crime_weight));
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
                        crimes = losangeles_geojson.features[i].properties.crimes;
                        losangeles_geojson.features[i].properties.score = Math.round((parseInt(jobs)*job_weight) + ((weight*crime_weight) + parseInt(crimes)*crime_weight));
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
        };

        // checkboxes

        self.checkboxes = [
            //{type: 'school', checked: true, weight: 10},
            //{type: 'traffic', checked: true, weight: 10},
            //{type: 'gas', checked: true, weight: 10},
            {type: 'jobs', checked: true, weight: 10},
            {type: 'crimes', checked: true, weight: 10},
            {type: 'housing', checked: true, weight: 10},
            {type: 'parks', checked: true, weight: 10},
            {type: 'university', checked: true, weight: 10}
        ];

        // right sidenav

        self.openRightMenu = function (status) {
            self.sidebarStatus = status;
            console.log("status " + self.sidebarStatus);
            $mdSidenav('right').toggle();
        };

        $scope.openSidenav.open = function() {
            if(self.sidebarStatus) {
                $mdSidenav('right').open();
            }

        };

        // welcome dialog

        self.welcomeDialog = function() {
            $mdDialog.show({
                controller: dialogCtrl,
                controllerAs: 'dc',
                templateUrl: 'app/dialogs/welcome.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                escapeToClose: true,
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