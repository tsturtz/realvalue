
angular.module('realValue')

    .controller("mapController", [ '$scope', '$http', 'leafletData', 'leafletMapEvents', 'checkboxService','dataService','$mdDialog', '$q', function($scope, $http, leafletData, leafletMapEvents, checkboxService,dataService, $mdDialog, $q) {
        var mc = this;
        //console.log("-------------------------"+dataService.firebase);
        self.name = "Map Obj";

        dataService.weikuan_init();

        console.log("init map");

        /**
         * Google Places Firebase config
         */

/*        placesFirebaseService.getFirebasePlacesData()
            .then(
                function (snapshot) {
                    console.log('after successful data call: ', snapshot);
                },
                function (snapshot) {
                    console.warn('fail: ', snapshot);
                });*/



        // fixed issue when map is shown after the map container has been resized by css
        // http://stackoverflow.com/questions/24412325/resizing-a-leaflet-map-on-container-resize
        $scope.$on('leafletDirectiveMarker.click', function(e, args) {

            console.log("model",args);

            // places dialog
            $mdDialog.show({
                controller: detailsCtrl,
                controllerAs: 'dc',
                templateUrl: './app/dialogs/details.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                escapeToClose: true,
                fullscreen: true,
                targetEvent: null, // weird angular material bug - this should be 'e' but for some reason it throws an error. setting targetEvent to null is a fix. refer to https://github.com/angular/material/issues/5363
                onComplete: afterShowAnimation
            });

            // focus after dialog
            function afterShowAnimation(scope, element, options) {
                console.log('after focus');
            }

            // dialog controller
            function detailsCtrl($mdDialog) {
                var deets = this;

                this.cancel = function () {
                    $mdDialog.hide();
                };
                this.getPlaceDetails = function () {
                    // google places API call
                    this.callPlace = function(key) {

                        this.service = new google.maps.places.PlacesService($('#data-here').get(0));

                        console.log('passed in key: ', key);

                        if (key) {
                            this.service.getDetails({
                                placeId: 'ChIJl_N4tlno3IARWDJLc0k1zX0' // real place id example: 'ChIJl_N4tlno3IARWDJLc0k1zX0'
                            }, function(place){
                                console.log('%c actual place ID call: ', 'background: green; color: white; display: block;', place);
                                deets.placeObj = {
                                    type : place.types[0],
                                    icon : place.icon,
                                    name : place.name,
                                    address : place.formatted_address,
                                    phone : place.formatted_phone_number,
                                    openNow : place.opening_hours.open_now, // boolean
                                    hours : place.opening_hours.weekday_text, // all days array
                                    photos : place.photos, // all photos array
                                    reviews : place.reviews // all reviews array
                                };
                            });
                        } else {
                            console.warn('you didn\'t pass in a place id');
                        }
                    };
                    this.callPlace(args.model['Place ID']); // passed in place ID from event args
                };
                this.getPlaceDetails();
            }
        });

        setTimeout(function(){ leafletData.getMap().then(function(map) {
            //console.log("resize");
            map.invalidateSize(false);
        });
        }, 400);

        this.county_zoom = function() {
            console.log("extend county");
            angular.extend($scope, {
                center: {
                    lat: 33.8247936182649,
                    lng: -118.03985595703125,
                    zoom: 8
                },
                tiles: {
                    url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                    options: {
                        attribution: 'All maps &copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, map data &copy; <a href="http://www.openstreetmap.org">OpenStreetMap</a> (<a href="http://www.openstreetmap.org/copyright">ODbL</a>'
                    }
                },
                geojson : {
                    data: [county_los_angeles,county_orange],
                    style: county_style,
                    onEachFeature: function (feature, layer) {
                        // fixed issue with referencing layer inside our reset Highlight function
                        //console.log("layer",layer);
                        //layer.bindPopup(feature.properties.popupContent);

                        leafletData.getMap().then(function(map) {
                            label = new L.Label();
                            label.setContent(feature.properties.name);
                            label.setLatLng(layer.getBounds().getCenter());
                            //map.showLabel(label);
                        });


                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: zoomToFeature
                        });
                    }
                }
            });
        };

        this.city_zoom = function() {
            console.log("extend zip");
            //console.log("cities",cities);
            angular.extend($scope, {
                center: {
                    lat: 34.075406,
                    lng: -117.901087,
                    zoom: 9
                },
                tiles: {
                    url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                    options: {
                        attribution: 'All maps &copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, map data &copy; <a href="http://www.openstreetmap.org">OpenStreetMap</a> (<a href="http://www.openstreetmap.org/copyright">ODbL</a>'
                    }
                },
                layers: {
                    overlays: {}
                },
                geojson : {
                    data: [cities],
                    style: style,
                    onEachFeature: function (feature, layer) {
                        // fixed issue with referencing layer inside our reset Highlight function
                        //layer.bindPopup(feature.properties.popupContent);

                        leafletData.getMap().then(function(map) {
                            label = new L.Label();
                            label.setContent(feature.properties.name);
                            label.setLatLng(layer.getBounds().getCenter());
                            //console.log(feature.properties.name + " " + layer.getBounds().getCenter());
                            //map.showLabel(label);
                        });

                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: zoomToFeature
                        });
                    }
                }
            });
        };

        mc.city_zoom();

        function roughSizeOfObject( object ) {
            var objectList = [];
            var recurse = function( value ) {
                var bytes = 0;

                if ( typeof value === 'boolean' ) {
                    bytes = 4;
                } else if ( typeof value === 'string' ) {
                    bytes = value.length * 2;
                } else if ( typeof value === 'number' ) {
                    bytes = 8;
                } else if (typeof value === 'object'
                    && objectList.indexOf( value ) === -1) {
                    objectList[ objectList.length ] = value;
                    for( i in value ) {
                        bytes+= 8; // assumed existence overhead
                        bytes+= recurse( value[i] )
                    }
                }
                return bytes;
            };
            return recurse( object );
        }

        this.zipcode_zoom = function() {
            console.log("extend zip");
            angular.extend($scope, {
                center: {
                    lat: 33.63622083463071,
                    lng: -117.73948073387146,
                    zoom: 10
                },
                geojson : {
                    data: [ tammy_geojson,
                            losangeles_geojson
                            ],
                    style: style,
                    onEachFeature: function (feature, layer) {
                        // fixed issue with referencing layer inside our reset Highlight function
                        //console.log("features", feature.properties);
                        if(feature.properties.hasOwnProperty("score")){
                            //console.log("Score exist!");
                            layer.bindPopup(feature.properties.name + '<BR>Jobs: ' + feature.properties.jobs +
                                '<BR>Crimes: ' + feature.properties.crimes +
                                '<BR>Score: ' + feature.properties.score);
                        }


                        leafletData.getMap().then(function(map) {
                            label = new L.Label();
                            label.setContent(feature.properties.name);
                            label.setLatLng(layer.getBounds().getCenter());
                            //console.log(feature.properties.name + " " + layer.getBounds().getCenter());
                            //map.showLabel(label);
                        });

                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: zoomToFeature
                        });
                    }
                }
            });
        };

        this.markers_zoom = function() {
            console.log("extend marker");
            /*
            angular.extend($scope, {
                markers: {
                    r1: restaurants["Restaurant1"],
                    r2: restaurants["Restaurant2"],
                    r3: restaurants["Restaurant3"],
                    r4: restaurants["Restaurant4"],
                    r5: restaurants["Restaurant5"],
                    r6: restaurants["Restaurant6"],
                    r7: restaurants["Restaurant7"],
                    r8: restaurants["Restaurant8"],
                    r9: restaurants["Restaurant9"],
                    r10: restaurants["Restaurant10"]
                }
            });
            */
        };

        this.submit_zoom = function(zip) {
            console.log("zoomed on: ", zip);
            if (zip != undefined) {
                //console.log("zooming");
                var city = dataService.find_city_based_on_zip_code(zip);
                //console.log("zooming on ", city);

                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    //searchObj(tammy_geojson.features[i]);
                    //console.log(tammy_geojson.features[i]);
                    if(tammy_geojson.features[i].properties.name === zip) {
                        console.log("match!!!");
                        console.log(tammy_geojson.features[i].properties);
                    }
                }

                var center = {
                    lat: 33.63622083463071,
                    lng: -117.73948073387146,
                    zoom: 12
                };

                if(city.length) {
                    angular.extend($scope, {
                        center: center
                    });
                }

            }
        };

        function searchObj (obj, query) {

            for (var key in obj) {
                var value = obj[key];
                if (typeof value === 'object') {
                    searchObj(value, query);
                }

                if (value === query) {
                    console.log('property=' + key + ' value=' + value);
                }

            }

        }

        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }

            //info.update(layer.feature.properties);
        }

        function resetHighlight(e) {
            /* had to custom edit this for angular from interactive choropleth example */
            var layer = e.target;
            layer.setStyle({
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3'
            });
        }

            function zoomToFeature(e) {
            var area_click_on=e.target.feature.properties.name;
            console.log("zip obj ",e.target.feature.properties);
            console.log("zip ", area_click_on);
            if(area_click_on==="Los Angeles County"){
                mc.information=county_los_angeles.features[0].properties;
            }
            else if(area_click_on==="Orange County"){
                mc.information=county_orange.features[0].properties;
            }
            else{
                if(dataService.firebase.hasOwnProperty(area_click_on)){
                    var temp={};
                    for(var key in dataService.firebase[area_click_on]){
                        if(key!=="zip_codes"){
                            temp[key]=dataService.firebase[area_click_on][key];
                        }
                    }
                    mc.information=temp;
                }
                else {
                    var city=dataService.find_city_based_on_zip_code(area_click_on);
                    var crime_and_job={};
                    console.log(city);
                    if(city.length!==0){
                        mc.information={};
                        for(var i=0;i<city.length;i++){
                            if(dataService.firebase[city[i]]["zip_codes"][area_click_on]!==undefined)
                                try{
                                    crime_and_job["2005 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2005"]["Violent_sum"];
                                    crime_and_job["2006 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2006"]["Violent_sum"];
                                    crime_and_job["2007 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2007"]["Violent_sum"];
                                    crime_and_job["2008 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2008"]["Violent_sum"];
                                    crime_and_job["2009 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2009"]["Violent_sum"];
                                    crime_and_job["2010 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2010"]["Violent_sum"];
                                    crime_and_job["2011 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2011"]["Violent_sum"];
                                    crime_and_job["2012 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2012"]["Violent_sum"];
                                    crime_and_job["2013 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2013"]["Violent_sum"];
                                    crime_and_job["2014 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]
                                        ["crime"]["2014"]["Violent_sum"];
                                    crime_and_job["Total_Jobs"]=dataService.firebase[city[i]]["zip_codes"][area_click_on]["total jobs"];
                                    mc.information=crime_and_job;
                                }
                                catch(err){
                                    console.info(err);
                                }
                            else{
                                mc.information[city[i]]=dataService.firebase[city[i]]["zip_codes"];
                            }
                        }
                    }
                    else{
                        mc.information={name:area_click_on};
                    }
                }
            }
            leafletData.getMap().then(function(map) {
                //console.log(e);
                //console.log("event",e.target.feature.properties.name);
                var zipCodeClicked = e.target.feature.properties.name;
                //debugger;
                //console.log(map);

                $http.get("./app/controllers/all_places.json?1").success(function(data, status) {
                    //console.log("data",data);
                    gjLayer = L.geoJson(tammy_geojson);
                    //console.log("layer",gjLayer);
                    var matched_data = {
                        "type": "FeatureCollection",
                        "features": []
                    };

                    var res_markers = {};

                    for(var i = 0;i<data.features.length;i++) {
                        //console.log(data.features[i].geometry.coordinates);
                        var res = leafletPip.pointInLayer(
                            [data.features[i].geometry.coordinates[0], data.features[i].geometry.coordinates[1]], gjLayer);
                        if (res.length) {
                            //console.log("name", res[0].feature.properties.name);
                            if (zipCodeClicked === res[0].feature.properties.name) {
                                //console.log("name", res[0].feature.properties.name);
                                matched_data.features.push(data.features[i]);

                                res_markers["id" + i] = {
                                    "Place ID":dummy_place_id(),
                                    "Place Type":"Restaurant",
                                    "lat":data.features[i].geometry.coordinates[1],
                                    "lng":data.features[i].geometry.coordinates[0]
                                }
                            }
                        } else {
                            console.log("false");
                        }
                    }
                    //console.log("markers", res_markers);
                    //console.log("matched",matched_data);
                    //console.log("data",data);

                    angular.extend($scope, {
                        markers: res_markers
                    });

                    /*
                    angular.extend($scope.layers.overlays, {
                        cities: {
                            name:'All Places (Awesome Markers)',
                            type: 'geoJSONAwesomeMarker',
                            data: data,
                            visible: true,
                            icon: {
                                icon: 'heart',
                                markerColor: 'green',
                                prefix: 'fa'
                            }
                        }
                    });
                    */

                    map.fitBounds(e.target.getBounds(),{padding: [200, 200]});
                });

            });
            // Modified for Angular
            // map.fitBounds(e.target.getBounds());
        }

        function style(feature) {
            return {
                fillColor: getColor(feature.properties.score),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        function county_style(feature) {
            return {
                fillColor: getCountyColor(feature.properties.score),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        function getColor(d) {
/*            return d > 85000 ? '#FF403D' :
                d > 75000  ? '#DA4C47' :
                d > 65000  ? '#B65852' :
                d > 55000  ? '#91655D' :
                d > 45000   ? '#6D7167' :
                d > 35000   ? '#487E72' :
                d > 25000   ? '#248A7D' :
                           '#009788';*/

            return d > 8000000 ? '#009787' : //green
                d > 100000  ? '#029D73' :
                d > 60000  ? '#04A35D' :
                d > 50000  ? '#07A946' :
                d > 40000   ? '#09AF2E' :
                d > 30000   ? '#0CB515' :
                d > 10000   ? '#24BB0F' :
                d > 5000   ? '#45C113' :
                d > 1000   ? '#67C716' :
                d > 100   ? '#8ACE1A' :
                d > 10   ? '#AFD41D' :
                d > 0   ? '#D4DA21' :
                d > -10   ? '#E0C725' :
                d > -100      ? '#E6AC2A' :
                d > -1000   ? '#EC922E' :
                d > -5000   ? '#F27733' :
                d > -10000   ? '#F85B38' :
                d > -25000    ? '#FF403D' :
                '#000'; //red
        }

        function getCountyColor(d) {
/*            return d > 8000000 ? '#009788' :
                d > 5000000  ? '#248A7D' :
                d > 3000000  ? '#487E72' :
                d > 1000000  ? '#6D7167' :
                d > 500000   ? '#91655D' :
                d > 300000   ? '#B65852' :
                d > 100000   ? '#DA4C47' :
                              '#FF403D';*/
            return d > 8000000 ? '#009787' : //green
                d > 17  ? '#029D73' :
                d > 16  ? '#04A35D' :
                d > 15  ? '#07A946' :
                d > 14   ? '#09AF2E' :
                d > 13   ? '#0CB515' :
                d > 12   ? '#24BB0F' :
                d > 11   ? '#45C113' :
                d > 10   ? '#67C716' :
                d > 9   ? '#8ACE1A' :
                d > 8   ? '#AFD41D' :
                d > 7   ? '#D4DA21' :
                d > 6   ? '#E0C725' :
                d > 5   ? '#E6AC2A' :
                d > 4   ? '#EC922E' :
                d > 3   ? '#F27733' :
                d > 2   ? '#F85B38' :
                '#FF403D'; //red
        }

        leafletData.getMap().then(function (map) {

            map.on('zoomend', function (event) {
                console.log(map.getZoom());

                if (map.getZoom() <= 8) {
                    mc.county_zoom();
                }

                if (map.getZoom() > 8 && map.getZoom() <=9 ) {
                    mc.city_zoom();
                    //mc.city_geojson();
                }

                if (map.getZoom() > 9 && map.getZoom() <=12 ) {
                    mc.zipcode_zoom();
                }

                if (map.getZoom() > 12) {
                    mc.zipcode_zoom();
                    mc.markers_zoom();
                }

            });
        });

    }]);
