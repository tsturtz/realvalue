angular.module('realValue')
    .service('dataService', function ($q) {
        var self = this;

        var config = {
            apiKey: "AIzaSyDA0QfT-TwSiFshrNjrg3yQ67bPBo4HVsw",
            authDomain: "realvalue-ebd58.firebaseapp.com",
            databaseURL: "https://realvalue-ebd58.firebaseio.com",
            storageBucket: "realvalue-ebd58.appspot.com",
            messagingSenderId: "73443138678"
        };
        firebase.initializeApp(config);
        var fbRef = firebase.database();

        fbRef.ref("/").once('value', function (snapshot) {
            console.log('%c ALL DATA ', 'font-size: 14px; background: purple; color: white; display: block;', snapshot.val());
        });

        fbRef.ref("crime-and-job-data-analysis").on('value',function(snapshot){
            self.crime_and_job_data_analysis=snapshot.val();
        });

        var defined_city = true;

        this.find_city_based_on_zip_code=function(zip) {
            var result = [];
            for (var city in la_zips) {
                for (var i = 0; i < la_zips[city]["zip_codes"].length; i++) {
                    if (la_zips[city]["zip_codes"][i] === zip) {
                        result.push(city + ", CA");
                    }
                }
            }
            return result;
        };

        self.placesGeojson = {
            "type": "FeatureCollection",
            "features": []
        };

        self.makePlacesGeojson = function () {
            fbRef.ref("/features/").once('value', function (snapshot) {
                console.log('%c PLACE DATA ', 'background: green; color: white; display: block;', snapshot.val());
                var restaurants;
                for (eachKey in snapshot.val().restaurant) {
                    restaurants = snapshot.val().restaurant[eachKey];
                    //console.log('each key in place: ', restaurants);
                    self.placesGeojson.features.push(restaurants);
                }
                console.log('places geojson: ', self.placesGeojson);
            });
        };

        //this.makePlacesGeojson();

        this.weikuan_init = function() {

            var deferred = $q.defer();

            fbRef.ref("combine").once('value', function (snapshot) {
                deferred.resolve(snapshot.val());
            });

            return deferred.promise;
        };

        this.weikuan_init().then(
            function (response) {
                self.firebase = response;
                //console.log("Firebase:",self.firebase);
                self.mergeData();
                //console.log("la size", roughSizeOfObject(losangeles_geojson));
            });

        this.mergeData = function () {
            console.log("merging data");

            var zip_city;
            var lookup_zip;
            var jobs_openings;
            var crimes;
            var weight = 1;
            self.total_attributes = 2;
            self.weight_total = 100 / self.total_attributes;
            var job_weight = self.weight_total/self.crime_and_job_data_analysis.all.jobMax;
            var crime_weight = -1 * self.weight_total/self.crime_and_job_data_analysis.all.crimeMax;
            var score;
            for (var i = 0; i < tammy_geojson.features.length; i++) {
                //console.log(miles_geojson.features[i].properties.name);
                lookup_zip = tammy_geojson.features[i].properties.name;
                zip_city = this.find_city_based_on_zip_code(lookup_zip);
                //console.log(miles_geojson.features[i]);
                //console.log("tammy match zip: " + lookup_zip + " with " + zip_city);

                if (zip_city.length > 1) {
                    for (var j = 0; j < zip_city.length; j++) {
                        console.error("duplicate city: " + zip_city[j] + ' zipcode: ' + lookup_zip);
                        if (zip_city[j] != '') {
                            jobs_openings = self.firebase[zip_city[j]]["Number of job openings"];
                            //console.log("data", self.firebase[zip_city[j]]);
                            if (self.firebase[zip_city[j]].hasOwnProperty("zip_codes")
                                && self.firebase[zip_city[j]]["zip_codes"].hasOwnProperty(lookup_zip)
                                && self.firebase[zip_city[j]]["zip_codes"][lookup_zip].hasOwnProperty("crime")) {
                                crimes = self.firebase[zip_city[j]]["zip_codes"][lookup_zip]["crime"]["2014"]["Violent_sum"];
                                console.log("crime totals ", crimes);
                                tammy_geojson.features[i].properties.crimes = crimes;
                                console.log("tammy geojson ", tammy_geojson.features[i].properties.crimes);
                            } else {
                                crimes = 0;
                                //console.log("no crimes");
                            }
                            //console.log("job openings ", jobs_openings);
                            tammy_geojson.features[i].properties.jobs = jobs_openings;
                            //console.log("jobs " + parseInt(jobs_openings) * job_weight);
                            //console.log("crimes " + parseInt(crimes) * crime_weight);
                            score = parseInt(jobs_openings) * job_weight + (self.weight_total + (crimes) * crime_weight);
                            tammy_geojson.features[i].properties.score = Math.round(score)
                        }
                    }

                } else {
                    //console.log("zip city", zip_city);
                    if(zip_city[0] != undefined) {
                        if(self.firebase[zip_city[0]].hasOwnProperty("zip_codes")
                            && self.firebase[zip_city[0]]["zip_codes"].hasOwnProperty(lookup_zip)
                            && self.firebase[zip_city[0]]["zip_codes"][lookup_zip].hasOwnProperty("crime") ) {
                            crimes = self.firebase[zip_city[0]]["zip_codes"][lookup_zip]["crime"]["2014"]["Violent_sum"];
                            //console.log("crime totals ", crimes);
                            tammy_geojson.features[i].properties.crimes = crimes;
                        } else {
                            crimes = 0;
                        }
                        jobs_openings = self.firebase[zip_city[0]]["Number of job openings"];
                        //console.log("job openings ", jobs_openings);
                        tammy_geojson.features[i].properties.jobs = jobs_openings;
                        //console.log("jobs " + parseInt(jobs_openings) * job_weight);
                        //console.log("crimes " + parseInt(crimes) * crime_weight);
                        score = parseInt(jobs_openings) * job_weight + (self.weight_total + (crimes) * crime_weight);
                        tammy_geojson.features[i].properties.score = Math.round(score)
                    }
                }
            }

            var zip_city;
            var lookup_zip;
            var jobs_openings;
            for (var i = 0; i < losangeles_geojson.features.length; i++) {
                //console.log(miles_geojson.features[i].properties.name);
                lookup_zip = losangeles_geojson.features[i].properties.name;
                zip_city = this.find_city_based_on_zip_code(lookup_zip);
                //console.log(zip_city.length);
                //console.log("la match zip: " + lookup_zip + " with " + zip_city);
                if (zip_city.length > 1) {
                    for (var j = 0; j < zip_city.length; j++) {
                        console.error("duplicate city: " + zip_city[j] + ' zipcode: ' + lookup_zip);
                        if (zip_city[j] != '') {
                            jobs_openings = self.firebase[zip_city[j]]["Number of job openings"];
                            //console.log("data", self.firebase[zip_city[j]]);
                            if(self.firebase[zip_city[j]].hasOwnProperty("zip_codes")
                                && self.firebase[zip_city[j]]["zip_codes"].hasOwnProperty(lookup_zip)
                                && self.firebase[zip_city[j]]["zip_codes"][lookup_zip].hasOwnProperty("crime")) {
                                crimes = self.firebase[zip_city[j]]["zip_codes"][lookup_zip]["crime"]["2014"]["Violent_sum"];
                                console.log("crime totals ", crimes);
                                losangeles_geojson.features[i].properties.crimes = crimes;
                            } else {
                                crimes = 0;
                                //console.log("no crimes");
                            }
                            //console.log("job openings ", jobs_openings);

                            losangeles_geojson.features[i].properties.jobs = jobs_openings;
                            score = parseInt(jobs_openings) * job_weight + (self.weight_total + (crimes) * crime_weight);
                            losangeles_geojson.features[i].properties.score = Math.round(score)
                        }
                    }

                } else {
                    //console.log(miles_geojson.features[i]);
                    //console.log("la match zip: " + lookup_zip + " with " + zip_city);
                    //console.log(zip_city[0]);
                    if(!self.firebase.hasOwnProperty(zip_city[0])) {
                        console.error("Firebase has no data for " + zip_city[0]);
                        defined_city = false;
                    } else {
                        defined_city = true;
                    }
                    if(zip_city[0] != undefined && defined_city){
                        if(self.firebase[zip_city[0]].hasOwnProperty("zip_codes")
                            && self.firebase[zip_city[0]]["zip_codes"].hasOwnProperty(lookup_zip)
                            && self.firebase[zip_city[0]]["zip_codes"][lookup_zip].hasOwnProperty("crime") ) {
                            crimes = self.firebase[zip_city[0]]["zip_codes"][lookup_zip]["crime"]["2014"]["Violent_sum"];
                            //console.log("crime totals ", crimes);
                            losangeles_geojson.features[i].properties.crimes = crimes;
                        } else {
                            crimes = 0;
                        }
                        jobs_openings = self.firebase[zip_city[0]]["Number of job openings"];
                        //console.log("job openings ", jobs_openings);
                        losangeles_geojson.features[i].properties.jobs = jobs_openings;
                        score = parseInt(jobs_openings) * job_weight + (self.weight_total + (crimes) * crime_weight);
                        if(score > 100) {
                            console.log("crimes ", self.weight_total + (crimes * crime_weight));
                            console.log("self weight " + self.weight_total);
                            console.log("crimes " + crimes);
                            console.log("crimes weight " + crime_weight);
                            console.log("times " + crimes * crime_weight);
                            console.log("jobs " + parseInt(jobs_openings) * job_weight);
                        }
                        losangeles_geojson.features[i].properties.score = Math.round(score)
                    }
                }

            }
        };
        //self.crime_and_job =crime_and_job_data_analysis;

        Array.prototype.stanDeviate = function(){
            var i,j,total = 0, mean = 0, diffSqredArr = [];
            for(i=0;i<this.length;i+=1){
                total+=this[i];
            }
            mean = total/this.length;
            for(j=0;j<this.length;j+=1){
                diffSqredArr.push(Math.pow((this[j]-mean),2));
            }
            return (Math.sqrt(diffSqredArr.reduce(function(firstEl, nextEl){
                    return firstEl + nextEl;
                })/this.length));
        };
    });
