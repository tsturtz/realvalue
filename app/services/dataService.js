angular.module('realValue')
    .service('dataService', function ($q) {
        var self = this;

        self.progress = true;

        self.init_promise = function() {

            self.defer = $q.defer();

            return self.defer.promise;
        };



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

        this.population_init = function() {
            var deferred = $q.defer();
            fbRef.ref("population").once('value', function (snapshot) {
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
                    self.call_population_init_from_promise();
                });
        };

        this.call_population_init_from_promise = function() {
            console.log("downloading population data...");
            this.population_init().then(
                function (response) {
                    self.pfirebase = response;
                    console.log("downloading population data complete");
                    self.mergeData();
                });
        };

        this.mergeData = function () {
            console.log("merging data...");
            var self_counter =0;
            var zip_city;
            var lookup_zip;
            var jobs_openings;
            var jobrate;
            var crimerate;
            var crimes;
            var housing;
            var population;
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
                //console.log("all zipcodes", lookup_zip);
                zip_city = this.find_city_based_on_zip_code(lookup_zip);
                //console.log("find city ",zip_city);
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
                        tammy_geojson.features[i].properties.name += " " + zip_city;
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
                        population = self.pfirebase[zip_city[0]];

                        if(population === undefined) {
                            console.error("population is undefined for ", zip_city[0]);
                            if(crimes === 0){
                                population = 1;
                            }
                        }

                        crimerate = ((crimes/population)*100000);
                        if(isNaN(crimerate)) {
                            console.log("Crime is NaN for " + zip_city,lookup_zip);
                            console.log("crime",crimes);
                            console.log("population",population);
                        }
                        jobrate = ( (jobs_openings/population)*100000);
                        job_zscore = self.calculateStatisticZScore(jobrate, "jobrate", population, "oc");
                        crime_zscore = self.calculateStatisticZScore(crimerate, "crimerate", population, "oc");
                        house_zscore = self.calculateStatisticZScore(housing, "zindex", population, "oc");

                        //console.log("job zscore " + job_zscore);
                        //console.log("crime zscore " + crime_zscore);
                        tammy_geojson.features[i].properties.housing = parseInt(housing);
                        tammy_geojson.features[i].properties.population = parseInt(population);
                        tammy_geojson.features[i].properties.crime_zscore = crime_zscore.toFixed(3);
                        tammy_geojson.features[i].properties.job_zscore = job_zscore.toFixed(3);
                        tammy_geojson.features[i].properties.house_zscore = house_zscore.toFixed(3);
                        score = (crime_zscore.toFixed(2) * 1) + (job_zscore.toFixed(2) * 1)+ (house_zscore.toFixed(2) * 1);
                        if(isNaN(score)) {
                            console.error("(needs index!) zip code " + lookup_zip, lookup_zip);
                            console.log("housing " + lookup_zip, housing);
                            console.log("population " + lookup_zip, population);
                            console.log("job zscore " + lookup_zip, job_zscore);
                            console.log("crime zscore " + lookup_zip, crime_zscore);
                            console.log("house zscore " + lookup_zip, house_zscore);
                            score = (crime_zscore.toFixed(2) * 1) + (job_zscore.toFixed(2) * 1);
                        } else if (lookup_zip === '92806' ) { // lookup individual zip codes
                            console.error("zip code " + lookup_zip, lookup_zip);

                            console.error("housing " + lookup_zip, housing);
                            console.error("crime " + lookup_zip, crimes);
                            console.error("jobs " + lookup_zip, jobs_openings);
                            console.error("population " + lookup_zip, population);

                            console.error("job zscore " + lookup_zip, job_zscore);
                            console.error("crime zscore " + lookup_zip, crime_zscore);
                            console.error("house zscore " + lookup_zip, house_zscore);
                            score = (crime_zscore.toFixed(2) * 1) + (job_zscore.toFixed(2) * 1)+ (house_zscore.toFixed(2) * 1);
                            console.error("zscore " + lookup_zip, score);

                        }
                        //console.error("crime rate", population/crimes);
                        if (isNaN((population/crimes))) {
                            console.error("zip code error", lookup_zip,zip_city[0]);
                        }
                        tammy_geojson.features[i].properties.score = score.toFixed(2);
                    } else {
                        // Zip code is not in our zip_lookup.js file
                        tammy_geojson.features[i].properties.name += " (No Index)";
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
                       losangeles_geojson.features[i].properties.name += " " + zip_city;
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
                        population = self.pfirebase[zip_city[0]];
                        if(population === undefined) {
                            console.error("population is undefined for ", zip_city[0]);
                            if(crimes === 0){
                            }
                        }
                        //console.log("job openings ", jobs_openings);
                        losangeles_geojson.features[i].properties.jobs = jobs_openings;
                        score = parseInt(jobs_openings) * job_weight + (self.weight_total + (crimes) * crime_weight);

                        crimerate = ((crimes/population)*100000);
                        if(isNaN(crimerate)) {
                            console.log("Crime is NaN for " + zip_city,lookup_zip);
                            console.log("crime",crimes);
                            console.log("population",population);
                        }
                        jobrate = ( (jobs_openings/population)*100000);

                        job_zscore = self.calculateStatisticZScore(jobrate, "jobrate", population, "la");
                        crime_zscore = self.calculateStatisticZScore(crimerate, "crimerate", population, "la");
                        house_zscore = self.calculateStatisticZScore(housing, "zindex", population, "la");

                        //console.error("crime zscore " + lookup_zip, crime_zscore);
                        //console.error("job zscore " + lookup_zip, job_zscore);

                        //console.error("housing " + lookup_zip, housing);
                        //console.error("crime " + lookup_zip, crimes);
                        //console.error("jobs " + lookup_zip, jobs_openings);
                        //console.error("population " + lookup_zip, population);

                        losangeles_geojson.features[i].properties.housing = parseInt(housing);
                        losangeles_geojson.features[i].properties.population = parseInt(population);
                        losangeles_geojson.features[i].properties.crime_zscore = crime_zscore.toFixed(3);
                        losangeles_geojson.features[i].properties.job_zscore = job_zscore.toFixed(3);
                        losangeles_geojson.features[i].properties.house_zscore = house_zscore.toFixed(3);
                        score = (crime_zscore.toFixed(2) * 1) + (job_zscore.toFixed(2) * 1) + (house_zscore.toFixed(2) * 1);
                        if (lookup_zip === '90045' ) { // lookup individual zip codes
                            console.error("zip code " + lookup_zip, lookup_zip);

                            console.error("housing " + lookup_zip, housing);
                            console.error("crime " + lookup_zip, crimes);
                            console.error("jobs " + lookup_zip, jobs_openings);
                            console.error("population " + lookup_zip, population);

                            console.error("job zscore " + lookup_zip, job_zscore);
                            console.error("crime zscore " + lookup_zip, crime_zscore);
                            console.error("house zscore " + lookup_zip, house_zscore);
                            console.error("crimerate " + lookup_zip, crimerate);

                            score = (crime_zscore.toFixed(2) * 1) + (job_zscore.toFixed(2) * 1)+ (house_zscore.toFixed(2) * 1);
                            console.error("zscore " + lookup_zip, score);
                        }
                        if (job_zscore > 10) {
                            console.error("outlier for crime: " + lookup_zip, crime_zscore);
                            console.error("outlier for house: " + lookup_zip, house_zscore);
                            console.error("outlier for job: " + lookup_zip, job_zscore);
                        }
                        losangeles_geojson.features[i].properties.score = score.toFixed(2);
                    }
                }

            }
            self.progress_promise();
        };

        self.progress_promise = function() {
            self.defer.resolve();
        }

        //self.crime_and_job =crime_and_job_data_analysis;
        self.calculateStatisticZScore = function(data, prop, pop, county) {
            if(county === 'oc'){
                //console.error("county OC",county);
            }
            if(prop === "jobrate") {
                var property_avg = this.crime_and_job_data_analysis.all[prop + "Average"];
                var zscore = (data - property_avg)/this.crime_and_job_data_analysis.all.jobrateSD;
                return zscore;
            }
            if(prop === "crimerate") {
                var property_avg = this.crime_and_job_data_analysis.all[prop + "Average"];
                var zscore = (data - property_avg)/this.crime_and_job_data_analysis.all.crimerateSD;
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
