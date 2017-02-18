angular.module('realValue')

    .controller("navCtrl", [ '$scope', '$http', 'leafletData', 'leafletMapEvents', 'checkboxService','dataService','$mdDialog', '$mdSidenav', function($scope, $http, leafletData, leafletMapEvents, checkboxService,dataService, $mdDialog, $mdSidenav) {
        var self = this;
        var score;
        var attribute;
        var jobs;
        var crimes;
        var house;
        var weight;
        var temp_attr;
        var calc_score;
        var job_zscore;
        var crime_zscore;
        var house_zscore;
        var zindex;
        self.sidebarStatus;

        self.types = ['jobs', 'crimes', 'housing', 'park', 'university'];

        self.updateData = function (data) {
            self.itemPosition = self.types.indexOf(data.type);
            if (data.checked === false) {
                temp_attr = self.types[self.itemPosition];
                self.types.splice(self.itemPosition,1);
            } else if (data.checked === true) {
                self.types.push(data.type);
            }
            self.totalChecked = self.types.length;
            this.applyUpdate(temp_attr, "+", 1);
            county_los_angeles.features[0].properties.score = self.totalChecked;
            county_orange.features[0].properties.score = self.totalChecked;
        };

        self.applyUpdate = function(attr, operator, checked) {
            var counter = 0;
            var total = 100;
            var weight;
            var jobs_yes;
            var crimes_yes;
            var housing_yes;
            if(self.types.indexOf("jobs") > -1) {
                counter++;
                jobs_yes = 1;
            } else {
                jobs_yes = 0;
            }
            if(self.types.indexOf("crimes") > -1) {
                counter++;
                crimes_yes = 1;
            } else {
                crimes_yes = 0;
            }
            if(self.types.indexOf("housing") > -1) {
                counter++;
                housing_yes = 1;
            } else {
                housing_yes = 0;
            }

            if(checked === 1) {
                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    if(self.hasProperty(tammy_geojson.features[i].properties,attr)) {
                        attribute = tammy_geojson.features[i].properties[attr];
                        score = tammy_geojson.features[i].properties.score;
                        jobs = tammy_geojson.features[i].properties.jobs;
                        crimes = tammy_geojson.features[i].properties.crimes;
                        house = tammy_geojson.features[i].properties.housing;
                        crime_zscore = tammy_geojson.features[i].properties.crime_zscore * crimes_yes;
                        job_zscore = tammy_geojson.features[i].properties.job_zscore * jobs_yes;
                        house_zscore = tammy_geojson.features[i].properties.house_zscore * housing_yes;
                        calc_score = ((crime_zscore * 1) * crimes_yes) + ((job_zscore * 1) * jobs_yes) + ((house_zscore * 1) * housing_yes);
                        zindex=parseInt(dataService.all["zillow"]["oc"][tammy_geojson.features[i].properties.name]);
                        tammy_geojson.features[i].properties.score = calc_score.toFixed(2);
                    }
                }
            }

            if(checked === 1) {

                for(var i = 0; i<losangeles_geojson.features.length;i++) {
                    if(self.hasProperty(losangeles_geojson.features[i].properties,attr)) {
                        attribute = losangeles_geojson.features[i].properties[attr];
                        score = losangeles_geojson.features[i].properties.score;
                        jobs = losangeles_geojson.features[i].properties.jobs;
                        crimes = losangeles_geojson.features[i].properties.crimes;
                        house = losangeles_geojson.features[i].properties.housing;
                        crime_zscore = losangeles_geojson.features[i].properties.crime_zscore;
                        job_zscore = losangeles_geojson.features[i].properties.job_zscore;
                        house_zscore = losangeles_geojson.features[i].properties.house_zscore;
                        calc_score = ((crime_zscore * 1) * crimes_yes) + ((job_zscore * 1) * jobs_yes) + ((house_zscore * 1) * housing_yes);
                        zindex=parseInt(dataService.all["zillow"]["lc"][losangeles_geojson.features[i].properties.name]);
                        losangeles_geojson.features[i].properties.score = calc_score.toFixed(2);
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
        };

        // checkboxes

        self.checkboxes = [
            {type: 'jobs', checked: true, weight: 10, tooltip: 'Number of Recent Job Openings', disabled: 'false'},
            {type: 'crimes', checked: true, weight: 10, tooltip: 'Violent Crime Frequency', disabled: 'false'},
            {type: 'housing', checked: true, weight: 10, tooltip: 'Average Home Value', disabled: 'false'},
            {type: 'parks', checked: true, weight: 10, tooltip: 'Coming Soon!', disabled: 'true'},
            {type: 'schools', checked: true, weight: 10, tooltip: 'Coming Soon!', disabled: 'true'}
        ];

        // right sidenav

        self.sidebarStatus = null;

        self.openRightMenu = function (status) {
            self.sidebarStatus = status;
            $mdSidenav('right').toggle();
        };

        $scope.openSidenav.open = function() {
            if(self.sidebarStatus === null) {
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

        self.welcomeDialog();

        // dialog controller

        function dialogCtrl($mdDialog) {
            var dialogSelf = this;

            dialogSelf.cancel = function () {
                $mdDialog.cancel();
            };
        }

    }]);
