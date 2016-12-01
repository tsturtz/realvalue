angular.module('realValue')

    .controller("mapController", [ '$scope', '$http', 'leafletData', 'leafletMapEvents', function($scope, $http, leafletData,leafletMapEvents) {
        //console.log("style", style);
        console.log("init map");


        // fixed issue when map is shown after the map container has been resized by css
        // http://stackoverflow.com/questions/24412325/resizing-a-leaflet-map-on-container-resize
        setTimeout(function(){ leafletData.getMap().then(function(map) {
            console.log("resize");
            map.invalidateSize(false);
        });
        }, 400);

        $scope.$on("leafletDirectiveMap.geojsonMouseover", function(ev, leafletEvent) {
            countryMouseover(leafletEvent);
            console.log(leafletEvent);
        });

        $scope.$on("leafletDirectiveMap.geojsonClick", function(ev, featureSelected, leafletEvent) {
            console.log(leafletEvent);
        });

        function countryMouseover(leafletEvent) {
            var layer = leafletEvent.target;
            layer.setStyle({
                weight: 2,
                color: '#666',
                fillColor: 'white'
            });
            //layer.bringToFront();
        }

        angular.extend($scope, {
            center: {
                 lat: 33.63622083463071,
                 lng: -117.73948073387146,
                 zoom: 10
            },
            bounds: {},
            layers: {},
            tiles: tiles,
            geojson : {
                data: [zip_92866,zip_92618,zip_92604,zip_92620],
                style: style,
                onEachFeature: function (feature, layer) {
                    // fixed issue with referencing layer inside our reset Highlight function
                    console.log("layer",layer);
                    layer.bindPopup(feature.properties.popupContent);

                    leafletData.getMap().then(function(map) {
                        label = new L.Label();
                        label.setContent(feature.properties.name)
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
                dashArray: '3',
            });
        }

        function zoomToFeature(e) {
            leafletData.getMap().then(function(map) {
                console.log(e);
                console.log(map);
                //map.fitBounds(e.target.getBounds());
            });
            // Modified for Angular
            // map.fitBounds(e.target.getBounds());
        }

        function style(feature) {
            return {
                fillColor: getColor(feature.properties.population),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        function getColor(d) {
            return d > 85000 ? '#800026' :
                d > 75000  ? '#BD0026' :
                d > 65000  ? '#E31A1C' :
                d > 55000  ? '#FC4E2A' :
                d > 45000   ? '#FD8D3C' :
                d > 35000   ? '#FEB24C' :
                d > 25000   ? '#FED976' :
                           '#FFEDA0';
        }

        $scope.searchIP = function(ip) {
            var url = "http://freegeoip.net/json/" + ip;
            $http.get(url).success(function(res) {
                $scope.center = {
                    lat: res.latitude,
                    lng: res.longitude,
                    zoom: 10
                };
                $scope.ip = res.ip;
            });
        };

        //console.log(tiles);
        $scope.updateGeojson = function() {
            console.log("HI");
        };



    }]);