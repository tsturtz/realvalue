angular.module('realValue')

    .controller("mapController", [ '$scope', '$http', 'leafletData', 'leafletMapEvents', 'checkboxService','dataService','$mdDialog', '$q', function($scope, $http, leafletData, leafletMapEvents, checkboxService,dataService, $mdDialog, $q) {
        var mc = this;
        var varMap;
        //mc.gjLayer;
        mc.gjLayer = L.geoJson(tammy_geojson, {
            style: style
        });
        self.name = "Map Obj";
        dataService.weikuan_init();
        console.log("init map");

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

                deets.remaining = 0;

                this.starsRemaining = function(remaining) {
                    return new Array(remaining);
                };

                this.starRange = function(stars) {
                    deets.remaining = 5 - stars;
                    return new Array(stars);
                };

                this.getPlaceDetails = function () {
                    // google places API call
                    this.callPlace = function(key) {

                        this.service = new google.maps.places.PlacesService($('#data-here').get(0));

                        //console.log('args', args.model);
                        console.log('passed in key: ', key);

                        if (key) {
                            this.service.getDetails({
                                placeId: key // key is passed in place ID. Here's a real place id for testing: 'ChIJl_N4tlno3IARWDJLc0k1zX0'
                            }, function(place){
                                console.log('%c actual place ID call: ', 'background: green; color: white; display: block;', place);
                                console.log('just before placeObj definition: ', args.model);
                                deets.placeObj = {
                                    type : place.types[0],
                                    icon :
                                        (args.model["Place Type"] === "airport") ? 'local_airport' :
                                        (args.model["Place Type"] === "bar") ? 'local_bar' :
                                        (args.model["Place Type"] === "gas") ? 'gas_station' :
                                        (args.model["Place Type"] === "gym") ? 'fitness_center' :
                                        (args.model["Place Type"] === "hospital") ? 'local_hospital' :
                                        (args.model["Place Type"] === "library") ? 'local_library' :
                                        (args.model["Place Type"] === "park") ? 'nature_people' :
                                        (args.model["Place Type"] === "restaurant") ? 'restaurant' :
                                        (args.model["Place Type"] === "school") ? 'school' :
                                        (args.model["Place Type"] === "university") ? 'school' :
                                        'place',
                                    name : place.name,
                                    address : place.formatted_address,
                                    phone : place.formatted_phone_number,
                                    openNow : (place.hasOwnProperty('opening_hours')) ? place.opening_hours.open_now : false, // boolean
                                    hours : (place.hasOwnProperty('opening_hours')) ? place.opening_hours.weekday_text : ['Store hours unavailable'], // all days array
                                    photos : place.photos, // all photos array
                                    reviews : place.reviews // all reviews array
                                };
                            });
                        } else {
                            console.warn('you didn\'t pass in a place id');
                        }
                    };
                    console.log(args.model);
                    this.callPlace(args.model['Place ID']); // passed in place ID from event args
                };
                this.getPlaceDetails();
            }
        });

        setTimeout(function(){ leafletData.getMap().then(function(map) {
            varMap = map;
            //console.log("resize");
            // This code helps the map not get sized before it is finish loading
            map.invalidateSize(false);
            // This code below removes the zoom control that's present on the map
            map.removeControl(map.zoomControl);
            map.options.minZoom = 7;
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
                    //url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                    url: "http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png",
                    options: {
                        attribution: ''
                    }
                },
                geojson : {
                    data: [county_los_angeles,county_orange],
                    style: county_style,
                    onEachFeature: function (feature, layer) {
                        // fixed issue with referencing layer inside our reset Highlight function
                        //console.log("layer",layer);
                        //layer.bindPopup(feature.properties.popupContent);

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
            console.log("extend city");
            //console.log("cities",cities);
            angular.extend($scope, {
                center: {
                    lat: 33.8247936182649,
                    lng: -118.03985595703125,
                    zoom: 9
                },
                defaults: {
                    zoomAnimation: true
                },
                legend: {
                    position: 'bottomright',
                    colors: [ '#1a9850', '#a6d96a', '#ffffbf', '#fdae61','#d73027', '#000' ],
                    labels: [ 'Best', 'Good', 'Average', 'Bad', 'Worst', 'No Data']
                },
                maxbounds: {
                    southWest: {
                        lat:32.88,
                        lng: -115.011
                    },
                    northEast: {
                        lat:34.72,
                        lng:-120.624
                    }

                },
                tiles: {
                    //url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                    //url: "http://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}",
                    url: "http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png",
                    options: {
                        //attribution: 'All maps &copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, map data &copy; <a href="http://www.openstreetmap.org">OpenStreetMap</a> (<a href="http://www.openstreetmap.org/copyright">ODbL</a>'
                    }
                },
                controls: {},
                layers: {
                    overlays: {
                        search: {
                            name: 'search',
                            type: 'group',
                            visible: true,
                            layerParams: {
                                showOnSelector: false
                            }
                        }
                    }
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
            //console.log("center", varMap.getCenter());
            angular.extend($scope, {
                center: {
                    autoDiscover: true,
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
                        // if(feature.properties.hasOwnProperty("score")){
                        //     //console.log("Score exist!");
                        //     layer.bindPopup(feature.properties.name + '<BR>Jobs: ' + feature.properties.jobs +
                        //         '<BR>Crimes: ' + feature.properties.crimes +
                        //         '<BR>Score: ' + feature.properties.score);
                        // }


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
        };

        this.submit_zoom = function(zip) {
/*
            losangeles_geojson.features.filter(function(data) {
                //console.log("data", data);
                $scope.geojson.data = data;
            });

            leafletData.getMap().then(function(map) {

                // var featuresLayer = new L.GeoJSON(tammy_geojson, {
                // });

                //map.addLayer(mc.gjLayer);
                //console.log(featuresLayer);
                console.log(dataService.crime_and_job_data_analysis);
                console.log(mc.gjLayer);
                var searchControl = new L.Control.Search({
                    layer: mc.gjLayer,
                    propertyName: 'name',
                    circleLocation: false,
                    moveToLocation: function(latlng, title, map) {
                        //map.fitBounds( latlng.layer.getBounds() );
                        var zoom = map.getBoundsZoom(latlng.layer.getBounds());
                        map.setView(latlng, zoom); // access the zoom
                    }
                });

                searchControl.on('search:locationfound', function(e) {

                    e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
                    if(e.layer._popup)
                        e.layer.openPopup();

                }).on('search:collapsed', function(e) {

                    featuresLayer.eachLayer(function(layer) {	//restore feature color
                        featuresLayer.resetStyle(layer);
                    });
                });

                map.addControl( searchControl );
            });

            leafletData.getLayers().then(function(baselayers) {
                console.log(baselayers);
                angular.extend($scope.controls, {
                    search: {
                        layer: baselayers.overlays.search
                    }
                });
            });*/

            var calculated_center;
            var match = false;
            //console.log("zoomed on: ", zip);
            if (zip != undefined) {
                //console.log("zooming");
                var city = dataService.find_city_based_on_zip_code(zip);
                //console.log("zooming on ", city);

                for(var i = 0; i<tammy_geojson.features.length;i++) {
                    //searchObj(tammy_geojson.features[i]);
                    //console.log(tammy_geojson.features[i]);
                    if(tammy_geojson.features[i].properties.name === zip) {
                        console.log("match!!!");
                        //console.log(tammy_geojson.features[i]);
                        calculated_center = this.findCenterFromCoordinatesArray(tammy_geojson.features[i].geometry.coordinates[0]);
                        match = true;
                    }
                }

                if(match) {
                    console.log(calculated_center);
                    var center = {
                        lat: calculated_center.x,
                        lng: calculated_center.y,
                        zoom: 13
                    };

                    if(city.length) {
                        angular.extend($scope, {
                            center: center
                        });
                    }
                }

            }
        };

        this.findMinMaxNumber = function(arr) {
            var l = arr.length;
            var max = -Infinity;
            var min = Infinity;
            var i;
            for (i = 0; l > i; i++) {
                if (arr[i] > max) {
                    max = arr[i];
                }
                if (arr[i] < min) {
                    min = arr[i];
                }
            }

            return {
                min: min,
                max: max
            };
        };

        this.findCenterFromCoordinatesArray = function(array) {

            var array_x = [];
            var array_y = [];
            for(var i=0;i<array.length;i++){
                array_x.push(array[i][1]);
                array_y.push(array[i][0]);
            }
            // console.log(array_x);
            // console.log(array_y);
            var maxmin_x = this.findMinMaxNumber(array_x);
            var maxmin_y = this.findMinMaxNumber(array_y);

            //console.log(maxmin_x);
            //console.log(maxmin_y);
            var center_x = maxmin_x.min + ((maxmin_x.max - maxmin_x.min) / 2);
            var center_y = maxmin_y.min + ((maxmin_y.max - maxmin_y.min) / 2);

            return {
                x:center_x,
                y:center_y
            };
            //console.log(center_x);
            //console.log(center_y);
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
            var zip_code_name = e.target.feature.properties.name;
            var county_name = e.target.feature.properties.county;
            var zip_code_score = e.target.feature.properties.score;
            var zip_code_crimes = e.target.feature.properties.crimes;
            var zip_code_jobs = e.target.feature.properties.jobs;
            var zip_code_crimes_zscore = e.target.feature.properties.crime_zscore;
            var zip_code_jobs_zscore = e.target.feature.properties.job_zscore;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
            //console.log(e.target.feature.properties.name);
            mc.information = {
                name: zip_code_name,
                county: county_name,
                score: zip_code_score,
                crimes: zip_code_crimes,
                jobs: zip_code_jobs,
                jobs_zscore: zip_code_jobs_zscore,
                crimes_zscore: zip_code_crimes_zscore
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
                dashArray: ''
            });
        }

        // share method between controllers through obj prototypical inheritance
        $scope.openSidenav = {};

        function InitChart(barData) {
            $(".pre-visualisation").empty();
            $("#visualisation").empty();
            var vis = d3.select('#visualisation'),
                WIDTH = 250,
                HEIGHT = 250,
                MARGINS = {
                    top: 20,
                    right: 0,
                    bottom: 20,
                    left: 40
                },
                xRange = d3.scale.ordinal().rangeRoundBands([MARGINS.left, WIDTH - MARGINS.right], 0.1).domain(barData.map(function (d) {
                    return d.x;
                })),

                yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0,
                    d3.max(barData, function (d) {
                        return d.y;
                    })
                ]),
                xAxis = d3.svg.axis()
                    .scale(xRange)
                    .tickSize(1)
                    .tickSubdivide(true),

                yAxis = d3.svg.axis()
                    .scale(yRange)
                    .tickSize(5)
                    .orient("left")
                    .tickSubdivide(true);
            vis.append('svg:g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + 230 + ')')
                .call(xAxis);

            vis.append('svg:g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
                .call(yAxis);

            vis.selectAll('rect')
                .data(barData)
                .enter()
                .append('rect')
                .attr('x', function (d) {
                    return xRange(d.x);
                })
                .attr('y', function (d) {
                    return yRange(d.y);
                })
                .attr('width', 10)
                .attr('height', function (d) {
                    return ((HEIGHT - MARGINS.bottom) - yRange(d.y));
                })
                .attr('fill', 'grey')
                .on('mouseover',function(d){
                    d3.select(this)
                        .attr('fill','blue');
                })
                .on('mouseout',function(d){
                    d3.select(this)
                        .attr('fill','grey');
                });
            $scope.openSidenav.open();
        }
        function job_pie_chart(dataset){
            $("#chart").empty();
            var width = 250;
            var height = 250;
            var radius = Math.min(width, height) / 2;

            var color = d3.scale.ordinal()
                .range(['#CA525A','#4FA242' ]);

            var svg = d3.select('#chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + (width / 2) +
                    ',' + (height / 2) + ')');

            var arc = d3.svg.arc()
                .innerRadius(0)
                .outerRadius(radius);

            var pie = d3.layout.pie()
                .value(function(d) { return d.count; })
                .sort(null);

            var path = svg.selectAll('path')
                .data(pie(dataset))
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', function(d) {
                    return color(d.data.label);
                });
            path.append("text")
                .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                .text(function(d) { return d.data.label;})
                .style("fill", "#ffffff");
        }

        mc.showDataVar = false;

        function zoomToFeature(e) {
            mc.showDataVar = true;
            mc.area_click_on=e.target.feature.properties.name;
            mc.county_click_on=e.target.feature.properties.county;
            //console.log("zip obj ",e.target.feature.properties);
            //console.log("zip ", area_click_on);
            if(mc.area_click_on==="Los Angeles County"){
                mc.information=county_los_angeles.features[0].properties;
            }
            else if(mc.area_click_on==="Orange County"){
                mc.information=county_orange.features[0].properties;
            }
            else{
                if(dataService.firebase.hasOwnProperty(mc.area_click_on)){
                    var temp={};
                    for(var key in dataService.firebase[mc.area_click_on]){
                        if(key!=="zip_codes"){
                            temp[key]=dataService.firebase[mc.area_click_on][key];
                        }
                    }
                    mc.information=temp;
                }
                else {
                    var city=dataService.find_city_based_on_zip_code(mc.area_click_on);
                    var crime_and_job={};
                    console.log(city);
                    if(city.length!==0){
                        for(var i=0;i<city.length;i++){
                            if(dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]!==undefined)
                                try{
                                    crime_and_job["2005 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2005"]["Violent_sum"];
                                    crime_and_job["2006 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2006"]["Violent_sum"];
                                    crime_and_job["2007 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2007"]["Violent_sum"];
                                    crime_and_job["2008 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2008"]["Violent_sum"];
                                    crime_and_job["2009 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2009"]["Violent_sum"];
                                    crime_and_job["2010 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2010"]["Violent_sum"];
                                    crime_and_job["2011 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2011"]["Violent_sum"];
                                    crime_and_job["2012 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2012"]["Violent_sum"];
                                    crime_and_job["2013 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2013"]["Violent_sum"];
                                    crime_and_job["2014 Violent Sum"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                        ["crime"]["2014"]["Violent_sum"];
                                    crime_and_job["Total_Jobs"]=dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]["total jobs"];
                                    //mc.information=crime_and_job;
                                    var barData = [{
                                        'x': "'05",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2005"]["Violent_sum"]
                                    }, {
                                        'x': "'06",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2006"]["Violent_sum"]
                                    }, {
                                        'x': "'07",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2007"]["Violent_sum"]
                                    }, {
                                        'x': "'08",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2008"]["Violent_sum"]
                                    }, {
                                        'x': "'09",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2009"]["Violent_sum"]
                                    }, {
                                        'x': "'10",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2010"]["Violent_sum"]
                                    }, {
                                        'x': "'11",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2011"]["Violent_sum"]
                                    }, {
                                        'x': "'12",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2012"]["Violent_sum"]
                                    }, {
                                        'x': "'13",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2013"]["Violent_sum"]
                                    }, {
                                        'x': "'14",
                                        'y': dataService.firebase[city[i]]["zip_codes"][mc.area_click_on]
                                            ["crime"]["2014"]["Violent_sum"]
                                    }];
                                    var pie=[];
                                    for (var data in dataService.firebase[city[i]]["Number of job openings"]){
                                        var temp={};
                                        if(data!=="all") {
                                            temp["label"] = data;
                                            temp["count"] = dataService.firebase[city[i]]["Number of job openings"][data];
                                            pie.push(temp);
                                        }
                                    }
                                    console.log(pie);
                                    mc.information=InitChart(barData);
                                    job_pie_chart(pie);
                                    mc.crimejob=1;
                                }
                                catch(err){
                                    console.info(err);
                                }
                            else{
                                mc.information={};
                                mc.information[city[i]]=dataService.firebase[city[i]]["zip_codes"];
                                mc.crimejob=0;
                            }
                        }
                    }
                    else{
                        mc.information={name:mc.area_click_on};
                    }
                }
            }
            leafletData.getMap().then(function(map) {
                mc.that = e;
                //console.log("event",e.target.feature.properties.name);
                    //mc.gjLayer = L.geoJson(tammy_geojson);
                    //console.log("layer",gjLayer);
                angular.extend($scope, {
                    progress: true
                });
                dataService.makePlacesGeojson().then(function(response) {
                    mc.placesGeojson2 = response;
                    mc.scanMarkers();
                    angular.extend($scope, {
                        progress: false
                    });
                });

                map.fitBounds(e.target.getBounds(),{padding: [230, 230]});

            });
        }

        this.scanMarkers = function() {

            var zipCodeClicked = mc.that.target.feature.properties.name;

            var matched_data = {
                "type": "FeatureCollection",
                "features": []
            };

            var res_markers = {};
            //console.log('places geojson: ', dataService.placesGeojson);
            if (!isNaN(mc.area_click_on) && mc.county_click_on==="Orange") {
                console.log(mc.area_click_on, 'is a number');
                for (var rest in mc.placesGeojson2.restaurant) {
                    //console.log(rest);
                    var res = leafletPip.pointInLayer(
                        [mc.placesGeojson2.restaurant[rest].geometry.coordinates[1], mc.placesGeojson2.restaurant[rest].geometry.coordinates[0]], mc.gjLayer);
                    if (res.length) {
                        //console.log(rest);
                        //console.log("name", res[0].feature.properties.name);
                        if (zipCodeClicked === res[0].feature.properties.name) {
                            //console.log("name", res[0].feature.properties.name);
                            //matched_data.features.push(data.features[i]);
                            res_markers[rest.substr(rest.length-5).replace("-","_")] = {
                                "Place ID": mc.placesGeojson2.restaurant[rest].properties.placeId,
                                "Place Type": mc.placesGeojson2.restaurant[rest].properties.type,
                                "lat": mc.placesGeojson2.restaurant[rest].geometry.coordinates[0],
                                "lng": mc.placesGeojson2.restaurant[rest].geometry.coordinates[1],
                                "icon": {}
                            }
                        }
                    }
                }

                // for (var i = 0; i < dataService.placesGeojson.features.length; i++) {
                //     //console.log(dataService.placesGeojson.features[i].geometry.coordinates);
                //     var res = leafletPip.pointInLayer(
                //         [dataService.placesGeojson.features[i].geometry.coordinates[1], dataService.placesGeojson.features[i].geometry.coordinates[0]], mc.gjLayer);
                //     if (res.length) {
                //         //console.log("name", res[0].feature.properties.name);
                //         if (zipCodeClicked === res[0].feature.properties.name) {
                //             //console.log("name", res[0].feature.properties.name);
                //             matched_data.features.push(data.features[i]);
                //             res_markers["id" + i] = {
                //                 "Place ID": dataService.placesGeojson.features[i].properties.placeId,
                //                 "Place Type": dataService.placesGeojson.features[i].properties.type,
                //                 "lat": dataService.placesGeojson.features[i].geometry.coordinates[0],
                //                 "lng": dataService.placesGeojson.features[i].geometry.coordinates[1],
                //                 "icon": {}
                //             }
                //         }
                //     } else {
                //         console.log("false");
                //     }
                // }
            }
            console.log("markers", Object.size(res_markers));

            angular.extend($scope, {
                markers: res_markers
            });
        }

        function style(feature) {
            return {
                fillColor: getColor(feature.properties.score),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '',
                fillOpacity: 0.7
            };
        }

        function county_style(feature) {
            return {
                fillColor: getCountyColor(feature.properties.score),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '',
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

            return d > 3 ? '#006837' :
                d > 1  ? '#1a9850' :
                d > .15  ? '#66bd63' :
                d > .10  ? '#a6d96a' :
                d > .08   ? '#d9ef8b' :
                d > .05   ? '#ffffbf' :
                d > .03  ? '#fee08b' :
                d > .01   ? '#fdae61' :
                d > 0   ? '#f46d43' :
                d > -1   ? '#d73027' :
                d > -3   ? '#a50026' : '#000';
/*
            return d > 8000000 ? '#d73027' : //green
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
                d > -100   ? '#E0C725' :
                d > -1000      ? '#E6AC2A' :
                d > -5000   ? '#EC922E' :
                d > -10000   ? '#F27733' :
                d > -50000   ? '#F85B38' :
                d > -75000    ? '#FF403D' :
                '#000'; //red
                */
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

        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        leafletData.getMap().then(function (map) {

            map.on('zoomend', function (event) {
                console.log(map.getZoom());

                console.log('overlay', map.getPanes().overlayPane);

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
                    mc.markers_zoom();
                }

            });
        });

    }]);
