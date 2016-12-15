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
            self.all=snapshot.val();
            console.log("SNAPSHOT.ALL", self.all);
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

        self.makePlacesGeojson = function (clicked) {
            var defer = $q.defer();

            fbRef.ref("/markerIndexZip/").once('value', function (snapshot) {
                if (snapshot.hasChild(clicked)) {
                    console.log("It does exist!");
                    console.log('%c DB MARKER DATA ', 'background: green; color: white; display: block;', snapshot.val());
                    self.placesGeojson = snapshot.val()[clicked];
                    defer.resolve(true);
                    return defer.promise;
                }
            });

            fbRef.ref("/features/").once('value', function (snapshot) {
                console.log('%c PLACE DATA ', 'background: green; color: white; display: block;', snapshot.val());
                self.placesGeojson2 = snapshot.val();
                defer.resolve(snapshot.val());
            });
            return defer.promise;
        };

        //this.makePlacesGeojson();
        this.weikuan_init = function() {
            console.log("What!");
            console.log("downloading combined data...");
            var deferred = $q.defer();
            fbRef.ref("combine").once('value', function (snapshot) {
                deferred.resolve(snapshot.val());
            });
            return deferred.promise;
        };

        this.zillow_init = function() {
            var deferred = $q.defer();
            fbRef.ref("zillow").once('value', function (snapshot) {
                deferred.resolve(snapshot.val());
            });
            return deferred.promise;
        };

        var weikuan_promise = this.weikuan_init();

        weikuan_promise.then( function (response) {
                self.firebase = response;
                console.log("downloading combined data complete");
                self.call_zillow_init_from_promise();
            });

        this.call_zillow_init_from_promise = function() {
            console.log("downloading zillow data...");
            this.zillow_init().then(
                function (response) {
                    self.zfirebase = response;
                    console.log("downloading zillow data complete");
                    self.mergeData();
                });
        };

        this.mergeData = function () {
            console.log("merging data...");
            var self_counter =0;
            var zip_city;
            var lookup_zip;
            var jobs_openings;
            var crimes;
            var housing;
            var weight = 1;
            self.total_attributes = 2;
            self.weight_total = 100 / self.total_attributes;
            var job_weight = self.weight_total/self.crime_and_job_data_analysis.all.jobMax;
            var crime_weight = -1 * self.weight_total/self.crime_and_job_data_analysis.all.crimeMax;
            var score;
            var crime_zscore;
            var job_zscore;
            var house_zscore;
            for (var i = 0; i < tammy_geojson.features.length; i++) {
                lookup_zip = tammy_geojson.features[i].properties.name;
                zip_city = this.find_city_based_on_zip_code(lookup_zip);

                if (zip_city.length > 1) {
                    for (var j = 0; j < zip_city.length; j++) {
                        console.error("duplicate city: " + zip_city[j] + ' zipcode: ' + lookup_zip);
                        if (zip_city[j] != '') {
                            jobs_openings = self.firebase[zip_city[j]]["Number of job openings"].all;
                            if (self.firebase[zip_city[j]].hasOwnProperty("zip_codes")
                                && self.firebase[zip_city[j]]["zip_codes"].hasOwnProperty(lookup_zip)
                                && self.firebase[zip_city[j]]["zip_codes"][lookup_zip].hasOwnProperty("crime")) {
                                crimes = self.firebase[zip_city[j]]["zip_codes"][lookup_zip]["crime"]["2014"]["Violent_sum"];
                                tammy_geojson.features[i].properties.crimes = crimes;
                            } else {
                                crimes = 0;
                            }
                            tammy_geojson.features[i].properties.jobs = jobs_openings;
                            score = parseInt(jobs_openings) * job_weight + (self.weight_total + (crimes) * crime_weight);
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
                        jobs_openings = self.firebase[zip_city[0]]["Number of job openings"].all;
                        tammy_geojson.features[i].properties.jobs = jobs_openings;
                        //console.log("self firebase2", self.zfirebase.oc[lookup_zip]);
                        housing = self.zfirebase.oc[lookup_zip];

                        job_zscore = self.calculateStatisticZScore(jobs_openings, "job");
                        crime_zscore = self.calculateStatisticZScore(crimes, "crime");
                        house_zscore = self.calculateStatisticZScore(housing, "zindex");
                        //console.log("job zscore " + job_zscore);
                        //console.log("crime zscore " + crime_zscore);
                        tammy_geojson.features[i].properties.housing = parseInt(housing);
                        tammy_geojson.features[i].properties.crime_zscore = crime_zscore.toFixed(3);
                        tammy_geojson.features[i].properties.job_zscore = job_zscore.toFixed(3);
                        tammy_geojson.features[i].properties.house_zscore = house_zscore.toFixed(3);
                        score = (crime_zscore.toFixed(2) * -1) + (job_zscore.toFixed(2) * 1)+ (house_zscore.toFixed(2) * 1);
                        if(isNaN(score)) {
                            console.log("zip code ", lookup_zip);
                            console.log("housing ", housing);
                            console.log("job zscore " + job_zscore);
                            console.log("crime zscore " + crime_zscore);
                            console.log("house zscore " + house_zscore);
                        }
                        tammy_geojson.features[i].properties.score = score.toFixed(2);
                    }
                }
            }

            var zip_city;
            var lookup_zip;
            var jobs_openings;
            for (var i = 0; i < losangeles_geojson.features.length; i++) {
                lookup_zip = losangeles_geojson.features[i].properties.name;
                zip_city = this.find_city_based_on_zip_code(lookup_zip);
                if (zip_city.length > 1) {
                    for (var j = 0; j < zip_city.length; j++) {
                        console.error("duplicate city: " + zip_city[j] + ' zipcode: ' + lookup_zip);
                        if (zip_city[j] != '') {
                            jobs_openings = self.firebase[zip_city[j]]["Number of job openings"].all;
                            if(self.firebase[zip_city[j]].hasOwnProperty("zip_codes")
                                && self.firebase[zip_city[j]]["zip_codes"].hasOwnProperty(lookup_zip)
                                && self.firebase[zip_city[j]]["zip_codes"][lookup_zip].hasOwnProperty("crime")) {
                                crimes = self.firebase[zip_city[j]]["zip_codes"][lookup_zip]["crime"]["2014"]["Violent_sum"];
                                console.log("crime totals ", crimes);
                                losangeles_geojson.features[i].properties.crimes = crimes;
                            } else {
                                crimes = 0;
                            }
                            losangeles_geojson.features[i].properties.jobs = jobs_openings;
                            score = parseInt(jobs_openings) * job_weight + (self.weight_total + (crimes) * crime_weight);
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
                        jobs_openings = self.firebase[zip_city[0]]["Number of job openings"].all;
                        housing = self.zfirebase.lc[lookup_zip];
                        //console.log("job openings ", jobs_openings);
                        losangeles_geojson.features[i].properties.jobs = jobs_openings;
                        score = parseInt(jobs_openings) * job_weight + (self.weight_total + (crimes) * crime_weight);

                        job_zscore = self.calculateStatisticZScore(jobs_openings, "job");
                        crime_zscore = self.calculateStatisticZScore(crimes, "crime");
                        house_zscore = self.calculateStatisticZScore(housing, "zindex");

                        losangeles_geojson.features[i].properties.housing = parseInt(housing);
                        losangeles_geojson.features[i].properties.crime_zscore = crime_zscore.toFixed(3);
                        losangeles_geojson.features[i].properties.job_zscore = job_zscore.toFixed(3);
                        losangeles_geojson.features[i].properties.house_zscore = house_zscore.toFixed(3);
                        score = (crime_zscore.toFixed(2) * -1) + (job_zscore.toFixed(2) * 1) + (house_zscore.toFixed(2) * 1);
                        losangeles_geojson.features[i].properties.score = score.toFixed(2);
                    }
                }

            }
        };
        //self.crime_and_job =crime_and_job_data_analysis;
        self.calculateStatisticZScore = function(data,prop) {
            if(prop === "job") {
                var property_avg = this.crime_and_job_data_analysis.all[prop + "Average"];
                var zscore = (data - property_avg)/this.crime_and_job_data_analysis.all.jobSD;
                return zscore;
            }
            if(prop === "crime") {
                var property_avg = this.crime_and_job_data_analysis.all[prop + "Average"];
                var zscore = (data - property_avg)/this.crime_and_job_data_analysis.all.crimeSD;
                return zscore;
            }
            if(prop === "zindex") {
                var property_avg = this.crime_and_job_data_analysis.all[prop + "Average"];
                var zscore = (data - property_avg)/this.crime_and_job_data_analysis.all.zindexSD;
                return zscore;
            }
        };

        self.indexMarkerInZip = function(click) {
            //console.log('geojson', self.placesGeojson2);
            console.log("indexing done on ", click);
            if(self.placesGeojson2 && self.placesGeojson2.hasOwnProperty("zipCode")) {
                for (var rest in self.placesGeojson2.zipCode) {
                    //console.log("zip object is ", self.placesGeojson2.zipCode[rest]);
                    fbRef.ref('markerIndexZip/'+rest).set(self.placesGeojson2.zipCode[rest]);
                }
            }
        };

    });
