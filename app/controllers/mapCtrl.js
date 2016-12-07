angular.module('realValue')

    .controller("mapController", [ '$scope', '$http', 'leafletData', 'leafletMapEvents', 'checkboxService','$mdDialog', function($scope, $http, leafletData, leafletMapEvents, checkboxService, $mdDialog) {
        //console.log("style", style);
        var mc = this;
        self.name = "Map Obj";

        console.log("init map");
/*
        /!************************************************!/
        // Trying to get data from checkboxService, from the other controller where the checkboxes are -T
        self.checkboxService = checkboxService.list;
        setTimeout(function() {
            console.log('passed in object array after 10 seconds: ', checkboxService.checkboxObj.list);
        }, 10000);
        /!*************************************************!/
*/

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
                targetEvent: e
            });

            // dialog controller

            function detailsCtrl($mdDialog) {
                this.cancel = function () {
                    $mdDialog.cancel();
                };
            }
//old regular dialog box
/*            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Restaurant Detail')
                    .textContent("Address:"+dummy_restaurant_details["result"]["formatted_address"]+"Phone Number:"+dummy_restaurant_details["result"]["formatted_phone_number"])
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                    .targetEvent(e)
            );*/
        });
        setTimeout(function(){ leafletData.getMap().then(function(map) {
            console.log("resize");
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
                        layer.bindPopup(feature.properties.popupContent);

                        leafletData.getMap().then(function(map) {
                            label = new L.Label();
                            label.setContent(feature.properties.name);
                            label.setLatLng(layer.getBounds().getCenter());
                            map.showLabel(label);
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
                            console.log(feature.properties.name + " " + layer.getBounds().getCenter());
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

        this.city_zoom();

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
                            mike_geojson,
                            miles_geojson,
                            zip_91331,
                            jason_geojson,
                            // zip_92618,zip_92604,zip_92620,zip_91331,zip_92602,zip_92782,zip_93536,zip_90265,zip_92672
                            ],
                    style: style,
                    onEachFeature: function (feature, layer) {
                        // fixed issue with referencing layer inside our reset Highlight function
                        //layer.bindPopup(feature.properties.popupContent);

                        leafletData.getMap().then(function(map) {
                            label = new L.Label();
                            label.setContent(feature.properties.name);
                            label.setLatLng(layer.getBounds().getCenter());
                            console.log(feature.properties.name + " " + layer.getBounds().getCenter());
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

                    map.fitBounds(e.target.getBounds(),{padding: [150, 150]});
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
            return d > 8000000 ? '#009787' :
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
                    '#FF403D';
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
            return d > 8000000 ? '#009787' :
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
                '#FF403D';
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