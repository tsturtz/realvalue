angular.module('realValue')

    .controller("mapController", [ '$scope', '$http', 'leafletData', 'leafletMapEvents', 'checkboxService','$mdDialog', function($scope, $http, leafletData, leafletMapEvents, checkboxService, $mdDialog) {
        var mc = this;

        self.name = "Map Obj";

        weikuan_init().then(
            function(response) {
                Weikuan_Combined_Firebase = response;
                console.log("weikuan", Weikuan_Combined_Firebase);
                console.log(roughSizeOfObject(Weikuan_Combined_Firebase));
                mc.mergeData();
            });

        console.log("init map");

        /*******************************************************************************
         * Google Place Details
         ******************************************************************************/

        /**
         * Google Places Firebase config
         */

        var config = {
            apiKey: "AIzaSyD7lWychYO044cw2lPl6chSaBTt85kId5E",
            authDomain: "datamap-3c35f.firebaseapp.com",
            databaseURL: "https://datamap-3c35f.firebaseio.com",
            storageBucket: "datamap-3c35f.appspot.com",
            messagingSenderId: "582541890710"
        };
        firebase.initializeApp(config);
        var fb = firebase.database();

        /**
         * Init google map so we can make place ID calls
         * TODO: DONT THINK WE NEED THIS ANYMORE
         */

        /*this.initMap = function (key) {

            var service = new google.maps.places.PlacesService($('#data-here').get(0));

            console.log(key);
            if (key === undefined) {
                key = 'ChIJl_N4tlno3IARWDJLc0k1zX0';
            }
            console.log(key);

            service.getDetails({
                placeId: key
            }, function(place){
                console.log('actual place details call with dummy place ID: ', place);
            });

        };*/

        this.mergeData = function() {
            console.log("merging data");

            var zip_city;
            var lookup_zip;
            var jobs_openings;
            for(var i=0;i<tammy_geojson.features.length;i++){
                //console.log(miles_geojson.features[i].properties.name);
                lookup_zip = tammy_geojson.features[i].properties.name;
                zip_city = find_city_based_on_zip_code_oc(lookup_zip);
                //console.log(miles_geojson.features[i]);
                console.log("tammy match zip: " + lookup_zip + " with " + zip_city);
                if(zip_city != '' ){
                    jobs_openings = Weikuan_Combined_Firebase[zip_city]["Number of job openings"];
                    console.log("job openings ", jobs_openings);
                    tammy_geojson.features[i].properties.score = jobs_openings;
                    console.log(Weikuan_Combined_Firebase[zip_city]);

                    for (var props in Weikuan_Combined_Firebase[zip_city]) {
                        console.log(props);
                        tammy_geojson.features[i].properties[props] = Weikuan_Combined_Firebase[zip_city][props];
                    }
                }
            }

            var zip_city;
            var lookup_zip;
            var jobs_openings;
            for(var i=0;i<miles_geojson.features.length;i++){
                //console.log(miles_geojson.features[i].properties.name);
                lookup_zip = miles_geojson.features[i].properties.name;
                zip_city = find_city_based_on_zip_code(lookup_zip);
                //console.log(miles_geojson.features[i]);
                console.log("miles match zip: " + lookup_zip + " with " + zip_city);
                if(zip_city != '' ){
                    jobs_openings = Weikuan_Combined_Firebase[zip_city]["Number of job openings"];
                    console.log("job openings ", jobs_openings);
                    miles_geojson.features[i].properties.score = jobs_openings;
                }
            }
        };

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
                console.log('after focus')
            }

            // dialog controller
            function detailsCtrl($mdDialog) {
                this.cancel = function () {
                    $mdDialog.hide();
                };
                this.getPlaceDetails = function () {
                    callPlace(args.model['Place ID']); // passed in place ID from event args
                };
                this.getPlaceDetails();
            }

            // google places API call
            function callPlace(key) {

                var service = new google.maps.places.PlacesService($('#data-here').get(0));

                console.log('passed in key: ', key);

                if (key) {
                    service.getDetails({
                        placeId: key // real place id example: 'ChIJl_N4tlno3IARWDJLc0k1zX0'
                    }, function(place){

                        console.log('%c :) real place ID call: ', 'background: green; color: white; display: block;', place);
                    });
                } else {
                    console.warn('you didn\'t pass in a place id');
                }
            }
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
            console.log("cities",cities);
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
        function find_city_based_on_zip_code_oc(zip) {
            var zips = {
                "Anaheim": {"zip_codes": ["92804", "92805", "92801", "92806", "92807", "92802", "92808", "92803", "92825", "92817", "92814", "92816", "92809", "92815", "92812", "92899", "92850"]},
                "Brea": {"zip_codes": ["92821", "92823", "92822"]},
                "Irvine": {"zip_codes": ["92620", "92618", "92612", "92602", "92614", "92604", "92606", "92603", "92617", "92623", "92650", "92616", "92619", "92697"]},
                "Santa Ana": {"zip_codes": ["92704", "92707", "92703", "92701", "92706", "92711", "92735", "92702", "92712"]},
                "Orange": {"zip_codes": ["92867", "92869", "92868", "92865", "92866", "92863", "92859", "92856", "92857", "92864", "92862"]},
                "Tustin": {"zip_codes": ["92780", "92782", "92781"]}
            };
            var result=[];
            for(var city in zips){
                for(var i=0;i<zips[city]["zip_codes"].length;i++){
                    if(zips[city]["zip_codes"][i]===zip){
                        result.push(city+", CA");
                    }
                }

            }
            return result;
        }

        function find_city_based_on_zip_code(zip) {
            var zips = {
                "Acampo": {"zip_codes": ["95220", "95258"]},
                "Agoura": {"zip_codes": ["91301", "91376"]},
                "Agoura Hills": {"zip_codes": ["91301", "91376"]},
                "Ahwahnee": {"zip_codes": ["95338", "93601"]},
                "Alameda": {"zip_codes": ["94501", "94502"]},
                "Alhambra": {"zip_codes": ["91801", "91803", "91802", "91804", "91896", "91899"]},
                "Aliso Viejo": {"zip_codes": ["92656", "92698"]},
                "Alpine": {"zip_codes": ["91901", "91903"]},
                "Alta Loma": {"zip_codes": ["91730", "91701", "91739", "91737", "92358", "91759", "91729"]},
                "Altadena": {"zip_codes": ["91001", "91003"]},
                "Alviso": {"zip_codes": ["95123", "95125", "95112", "95127", "95136", "95111", "95129", "95134", "95116", "95122", "95132", "95148", "95118", "95117", "95121", "95131", "95133", "95135", "95110", "95138", "95130", "95119", "95139", "95113", "95156", "95002", "95173", "95152", "95190", "95153", "95159", "95154", "95151", "95160", "95170", "95106", "95103", "95161", "95108", "95157", "95150", "95109", "95155", "95172", "95158", "95013", "95196", "95164", "95141", "95115", "95101", "95191", "95192", "95193", "95194"]},
                "Anaheim": {"zip_codes": ["92804", "92805", "92801", "92806", "92807", "92802", "92808", "92803", "92825", "92817", "92814", "92816", "92809", "92815", "92812", "92899", "92850"]},
                "Anaheim Hills": {"zip_codes": ["92804", "92805", "92801", "92806", "92807", "92802", "92808", "92803", "92825", "92817", "92814", "92816", "92809", "92815", "92812", "92899", "92850"]},
                "Antelope": {"zip_codes": ["95610", "95621", "95611"]},
                "Antioch": {"zip_codes": ["94509", "94531"]},
                "Apple Valley": {"zip_codes": ["92307", "92308"]},
                "Aptos": {"zip_codes": ["95003", "95073", "95001"]},
                "Arcadia": {"zip_codes": ["91007", "91006", "91077", "91066"]},
                "Arroyo Grande": {"zip_codes": ["93420", "93421"]},
                "Artesia": {"zip_codes": ["90701", "90702"]},
                "Atascadero": {"zip_codes": ["93422", "93423"]},
                "Atwood": {"zip_codes": ["92870", "92871", "92811"]},
                "Auberry": {"zip_codes": ["93602", "93664", "93634"]},
                "Auburn": {"zip_codes": ["95602", "95604"]},
                "Auckland": {"zip_codes": ["93271", "93603"]},
                "Badger": {"zip_codes": ["93271", "93603"]},
                "Bakersfield": {"zip_codes": ["93309", "93307", "93312", "93304", "93305", "93301", "93390", "93387", "93384", "93303", "93383", "93389", "93385", "93302"]},
                "Banning": {"zip_codes": ["92220", "92230"]},
                "Barstow": {"zip_codes": ["92311", "92312", "92327"]},
                "Bell": {"zip_codes": ["90040", "90096"]},
                "Bellflower": {"zip_codes": ["90706", "90707"]},
                "Berkeley": {"zip_codes": ["94704", "94703", "94702", "94705", "94709", "94710", "94720", "94712", "94701"]},
                "Bermuda Dunes": {"zip_codes": ["92201", "92203", "92202"]},
                "Bethel Island": {"zip_codes": ["94561", "94511"]},
                "Beverly Hills": {"zip_codes": ["90210", "90212", "90211", "90209", "90213"]},
                "Big Bear City": {"zip_codes": ["92382", "92333"]},
                "Biggs": {"zip_codes": ["95917", "95974"]},
                "Bishop": {"zip_codes": ["93514", "93512", "93515"]},
                "Blue Jay": {"zip_codes": ["92317", "92352", "92391", "92321", "92378", "92385"]},
                "Blythe": {"zip_codes": ["92225", "92226"]},
                "Boron": {"zip_codes": ["93516", "93596"]},
                "Boulder Creek": {"zip_codes": ["95006", "95007"]},
                "Boyes Hot Springs": {"zip_codes": ["95416", "95487", "95433"]},
                "Brea": {"zip_codes": ["92821", "92823", "92822"]},
                "Brentwood": {"zip_codes": ["94513", "94551", "95219", "94548"]},
                "Brooks": {"zip_codes": ["95606", "95679"]},
                "Buena Park": {"zip_codes": ["90620", "90621", "90622", "90624"]},
                "Burbank": {"zip_codes": ["91505", "91504", "91501", "91506", "91502", "91507", "91510", "91508", "91503", "91523", "91521", "91522", "91526"]},
                "Burlingame": {"zip_codes": ["94010", "94011"]},
                "Burrel": {"zip_codes": ["93656", "93607"]},
                "Calabasas": {"zip_codes": ["91302", "91372"]},
                "Calexico": {"zip_codes": ["92231", "92232"]},
                "Calif City": {"zip_codes": ["93505", "93504"]},
                "California City": {"zip_codes": ["93505", "93504"]},
                "Calimesa": {"zip_codes": ["92223", "92320"]},
                "Calistoga": {"zip_codes": ["95448", "94515", "94576"]},
                "Calpella": {"zip_codes": ["95482", "95481", "95418"]},
                "Camarillo": {"zip_codes": ["93010", "93012", "93011"]},
                "Camp Pendleton": {"zip_codes": ["92056", "92057", "92672", "92054", "92058", "92673", "92052", "92068", "92051", "92049", "92055"]},
                "Campbell": {"zip_codes": ["95008", "95011", "95009"]},
                "Campo": {"zip_codes": ["91906", "91962"]},
                "Canyon Country": {"zip_codes": ["91355", "91350", "91321", "91351", "91386", "91322", "91380", "91385", "91382", "91383"]},
                "Cardiff by the Sea": {"zip_codes": ["92024", "92007", "92023"]},
                "Carlsbad": {"zip_codes": ["92009", "92008", "92011", "92010", "92018", "92013"]},
                "Carmel-by-the-Sea": {"zip_codes": ["93921", "93922"]},
                "Carmichael": {"zip_codes": ["95608", "95609"]},
                "Carpinteria": {"zip_codes": ["93013", "93067", "93014"]},
                "Carson": {"zip_codes": ["90745", "90746", "90749", "90747"]},
                "Castaic": {"zip_codes": ["91354", "91384", "91310"]},
                "Castro Valley": {"zip_codes": ["94546", "94552"]},
                "Cathedral City": {"zip_codes": ["92234", "92235"]},
                "Cayucos": {"zip_codes": ["93430", "93435"]},
                "Cedar Glen": {"zip_codes": ["92317", "92352", "92391", "92321", "92378", "92385"]},
                "Central": {"zip_codes": ["93722", "93720", "93711", "93726", "93705", "93702", "93710", "93704", "93706", "93703", "93728", "93730", "93701", "93721", "93650", "93888", "93747", "93745", "93750", "93729", "93724", "93790", "93786", "93794", "93755", "93774", "93707", "93779", "93773", "93708", "93709", "93772", "93771", "93712", "93715", "93717", "93775", "93716", "93765", "93791", "93714", "93718", "93776", "93744", "93777", "93778", "93793", "93760", "93792", "93761", "93741", "93844", "93740", "93764"]},
                "Central Valley": {"zip_codes": ["96089", "96079"]},
                "Cerritos": {"zip_codes": ["90703"]},
                "Chester": {"zip_codes": ["96137", "96020"]},
                "Chicago Park": {"zip_codes": ["95945", "95949", "95924", "95712"]},
                "Chico": {"zip_codes": ["95926", "95928", "95942", "95976", "95927", "95929"]},
                "China Lake": {"zip_codes": ["93555", "93556"]},
                "Chinese Camp": {"zip_codes": ["95327", "95309"]},
                "Chula Vista": {"zip_codes": ["91910", "91911", "91913", "91915", "91902", "91909", "91912", "91921"]},
                "Citrus Heights": {"zip_codes": ["95610", "95621", "95611"]},
                "City Industry": {"zip_codes": ["91715", "91716", "91714"]},
                "City of Industry": {"zip_codes": ["91715", "91716", "91714"]},
                "Clearlake": {"zip_codes": ["95422", "95424"]},
                "Clovis": {"zip_codes": ["93611", "93612", "93619", "93626", "93651", "93613"]},
                "Coleville": {"zip_codes": ["96107", "96133"]},
                "Coloma": {"zip_codes": ["95667", "95651", "95613"]},
                "Compton": {"zip_codes": ["90220", "90222", "90223", "90224"]},
                "Concord": {"zip_codes": ["94521", "94520", "94518", "94519", "94522", "94524", "94527", "94529"]},
                "Corcoran": {"zip_codes": ["93212", "93282"]},
                "Corona": {"zip_codes": ["92882", "92880", "92879", "92883", "92881", "91708", "92878", "92877"]},
                "Corona del Mar": {"zip_codes": ["92660", "92625", "92661", "92662", "92658", "92659"]},
                "Coronado": {"zip_codes": ["92178", "92155", "92135"]},
                "Corralitos": {"zip_codes": ["95076", "95077"]},
                "Corte Madera": {"zip_codes": ["94925", "94976"]},
                "Costa Mesa": {"zip_codes": ["92627", "92626", "92628"]},
                "Coulterville": {"zip_codes": ["95311", "95345", "95347"]},
                "Covina": {"zip_codes": ["91722", "91724", "91723"]},
                "Crescent City": {"zip_codes": ["95548", "95538", "95532"]},
                "Culver City": {"zip_codes": ["90232", "90231", "90233"]},
                "Cupertino": {"zip_codes": ["95014", "95015"]},
                "Cypress": {"zip_codes": ["90630"]},
                "Danville": {"zip_codes": ["94526", "94506", "94517"]},
                "Davis": {"zip_codes": ["95616", "95618", "95617"]},
                "Del Rio": {"zip_codes": ["95355", "95350", "95351", "95356", "95358", "95354", "95367", "95357", "95368", "95352", "95353", "95397"]},
                "Delano": {"zip_codes": ["93216", "93287"]},
                "Denair": {"zip_codes": ["95316", "95323"]},
                "Desert Hot Springs": {"zip_codes": ["92240", "92241", "92258"]},
                "Diablo": {"zip_codes": ["94507", "94528"]},
                "Discovery Bay": {"zip_codes": ["95206", "94505", "94514"]},
                "Dos Palos": {"zip_codes": ["93620", "93665", "93661"]},
                "Downey": {"zip_codes": ["90241", "90242", "90240", "90239"]},
                "Duarte": {"zip_codes": ["91010", "91009"]},
                "Dunsmuir": {"zip_codes": ["96025", "96017"]},
                "Earp": {"zip_codes": ["92252", "92242"]},
                "East Irvine": {"zip_codes": ["92620", "92618", "92612", "92602", "92614", "92604", "92606", "92603", "92617", "92623", "92650", "92616", "92619", "92697"]},
                "Edwards": {"zip_codes": ["93523", "93524"]},
                "Edwards AFB": {"zip_codes": ["93523", "93524"]},
                "El Cajon": {"zip_codes": ["92021", "92020", "92019", "92022"]},
                "El Centro": {"zip_codes": ["92243", "92249", "92244", "92273"]},
                "El Granada": {"zip_codes": ["94019", "94018"]},
                "El Monte": {"zip_codes": ["91732", "91731", "91734", "91735"]},
                "El Sobrante": {"zip_codes": ["94803", "94820"]},
                "El Segundo":{"zip_codes":["90245"]},
                "El Toro": {"zip_codes": ["92630", "92610", "92609"]},
                "Eldridge": {"zip_codes": ["95416", "95487", "95433"]},
                "Elk Grove": {"zip_codes": ["95758", "95624", "95757", "95639", "95759"]},
                "Emeryville": {"zip_codes": ["94608", "94662"]},
                "Encinitas": {"zip_codes": ["92024", "92007", "92023"]},
                "Escondido": {"zip_codes": ["92026", "92029", "92046", "92030", "92033"]},
                "Eureka": {"zip_codes": ["95501", "95503", "95551", "95534", "95502"]},
                "Fairfax": {"zip_codes": ["94930", "94978"]},
                "Fairfield": {"zip_codes": ["94533", "94534"]},
                "Fallbrook": {"zip_codes": ["92028", "92088"]},
                "Farmington": {"zip_codes": ["95228", "95230"]},
                "Felton": {"zip_codes": ["95018", "95041"]},
                "Fiddletown": {"zip_codes": ["95669", "95629", "95656", "95675"]},
                "Fillmore": {"zip_codes": ["93015", "93016"]},
                "Florin": {"zip_codes": ["95823", "95828"]},
                "Folsom": {"zip_codes": ["95630", "95763", "95671"]},
                "Fontana": {"zip_codes": ["92336", "92335", "92337", "92331", "92334"]},
                "Foothill Ranch": {"zip_codes": ["92630", "92610", "92609"]},
                "Forbestown": {"zip_codes": ["95941", "95930"]},
                "Fountain Valley": {"zip_codes": ["92708", "92728"]},
                "Fremont": {"zip_codes": ["94536", "94538", "94555", "94537"]},
                "French Camp": {"zip_codes": ["95330", "95231"]},
                "Fresno": {"zip_codes": ["93722", "93720", "93711", "93726", "93705", "93702", "93710", "93704", "93706", "93703", "93728", "93730", "93701", "93721", "93650", "93888", "93747", "93745", "93750", "93729", "93724", "93790", "93786", "93794", "93755", "93774", "93707", "93779", "93773", "93708", "93709", "93772", "93771", "93712", "93715", "93717", "93775", "93716", "93765", "93791", "93714", "93718", "93776", "93744", "93777", "93778", "93793", "93760", "93792", "93761", "93741", "93844", "93740", "93764"]},
                "Fullerton": {"zip_codes": ["92833", "92831", "92835", "92832", "92834", "92836", "92837", "92838"]},
                "Garden Grove": {"zip_codes": ["92840", "92843", "92841", "92844", "92845", "92842", "92846", "90721"]},
                "Geyserville": {"zip_codes": ["95425", "95441"]},
                "Gilroy": {"zip_codes": ["95020", "95021"]},
                "Glen Ellen": {"zip_codes": ["95442", "95431"]},
                "Glendale": {"zip_codes": ["91205", "91206", "91214", "91202", "91208", "91204", "91203", "91207", "91020", "91226", "91210", "91393", "91046", "91225", "91209", "91222", "91221"]},
                "Glendora": {"zip_codes": ["91702", "91740", "91741"]},
                "Glenoaks Country": {"zip_codes": ["92591", "92590", "92589", "92593"]},
                "Gold River": {"zip_codes": ["95670", "95742", "95741"]},
                "Goleta": {"zip_codes": ["93116", "93118", "93199"]},
                "Gonzales": {"zip_codes": ["93926", "93925"]},
                "Goshen": {"zip_codes": ["93277", "93291", "93292", "93278", "93227", "93290", "93279", "93670"]},
                "Grass Valley": {"zip_codes": ["95945", "95949", "95924", "95712"]},
                "Groveland": {"zip_codes": ["95321", "95389", "95305"]},
                "Grover Beach": {"zip_codes": ["93433", "93483"]},
                "Guadalupe": {"zip_codes": ["93455", "93434"]},
                "Guasti": {"zip_codes": ["91762", "91761", "91764", "91743", "91758"]},
                "Half Moon Bay": {"zip_codes": ["94019", "94018"]},
                "Hamilton City": {"zip_codes": ["95951", "95943"]},
                "Hanford": {"zip_codes": ["93230", "93232"]},
                "Hawaiian Gardens": {"zip_codes": ["90716"]},
                "Hawthorne": {"zip_codes": ["90250", "90251"]},
                "Hayward": {"zip_codes": ["94544", "94541", "94588", "94545", "94542", "94540", "94557", "94543"]},
                "Healdsburg": {"zip_codes": ["95492", "95446"]},
                "Heavenly Hills": {"zip_codes": ["95327", "95309"]},
                "Hemet": {"zip_codes": ["92545", "92544", "92543", "92546"]},
                "Hesperia": {"zip_codes": ["92345", "92344", "92340"]},
                "Hidden Valley Lake": {"zip_codes": ["95467", "95461"]},
                "Hollister": {"zip_codes": ["95023", "95045", "95024"]},
                "Humboldt Hill": {"zip_codes": ["95501", "95503", "95551", "95534", "95502"]},
                "Huntington Beach": {"zip_codes": ["92646", "92647", "92648", "92649", "90742", "90743", "92605", "92615"]},
                "Imperial Beach": {"zip_codes": ["91932", "91933"]},
                "Indio": {"zip_codes": ["92201", "92203", "92202"]},
                "Industry": {"zip_codes": ["91715", "91716", "91714"]},
                "Inglewood": {"zip_codes": ["90301", "90302", "90303", "90305", "90304", "90310", "90307", "90306", "90309", "90308", "90311", "90312"]},
                "Irvine": {"zip_codes": ["92620", "92618", "92612", "92602", "92614", "92604", "92606", "92603", "92617", "92623", "92650", "92616", "92619", "92697"]},
                "Jamestown": {"zip_codes": ["95327", "95309"]},
                "Kensington": {"zip_codes": ["94707", "94708"]},
                "Kernville": {"zip_codes": ["93285", "93238", "93208"]},
                "Knightsen": {"zip_codes": ["94513", "94551", "95219", "94548"]},
                "La Canada Flintridge": {"zip_codes": ["91011", "91012"]},
                "La Crescenta": {"zip_codes": ["91224", "91021"]},
                "La Habra": {"zip_codes": ["90633", "90632","90631"]},
                "La Jolla": {"zip_codes": ["92109", "92126", "92101", "92115", "92104", "92154", "92105", "92122", "92117", "92128", "92071", "92130", "92037", "92103", "92114", "92129", "92111", "92116", "92027", "92025", "92127", "92102", "92107", "92113", "92108", "92131", "92110", "92120", "92123", "92124", "92139", "92119", "92118", "92106", "92173", "92143", "92192", "92121", "92038", "92138", "92161", "92174", "92150", "92039", "92195", "92160", "92172", "92137", "92187", "92153", "92142", "92170", "92145", "92171", "92168", "92159", "92196", "92175", "92165", "92112", "92149", "92176", "92191", "92169", "92140", "92193", "92177", "92167", "92163", "92198", "92166", "92186", "92147", "92152", "92136", "92134", "92132", "92182", "92190", "92093", "92197", "92199", "92092"]},
                "La Mesa": {"zip_codes": ["91942", "91941", "91943", "91944"]},
                "La Mirada": {"zip_codes": ["90638", "90637", "90639"]},
                "La Puente": {"zip_codes": ["91744", "91747"]},
                "La Quinta": {"zip_codes": ["92253", "92247"]},
                "Lafayette": {"zip_codes": ["94549", "94595"]},
                "Laguna Beach": {"zip_codes": ["92651", "92652"]},
                "Laguna Hills": {"zip_codes": ["92653", "92654"]},
                "Laguna Niguel": {"zip_codes": ["92677", "92607"]},
                "Lake Arrowhead": {"zip_codes": ["92317", "92352", "92391", "92321", "92378", "92385"]},
                "Lake Elsinore": {"zip_codes": ["92530", "92532", "92531"]},
                "Lake Forest": {"zip_codes": ["92630", "92610", "92609"]},
                "Lake Los Angeles": {"zip_codes": ["93550", "93551", "93552", "93591", "93590", "93599"]},
                "Lakeport": {"zip_codes": ["95453", "95435"]},
                "Lakeside": {"zip_codes": ["92040", "92065"]},
                "Lakewood": {"zip_codes": ["90712", "90713", "90715", "90714", "90711"]},
                "Lancaster": {"zip_codes": ["93535", "93536", "93534", "93539", "93584", "93586"]},
                "Larkspur": {"zip_codes": ["94939", "94914", "94977"]},
                "Lemon Grove": {"zip_codes": ["91945", "91946"]},
                "Lemoore": {"zip_codes": ["93245", "93246"]},
                "Livermore": {"zip_codes": ["94568", "94550", "95391", "95140"]},
                "Lockeford": {"zip_codes": ["95240", "95237"]},
                "Lodi": {"zip_codes": ["95242", "95253", "95241"]},
                "Loma Linda": {"zip_codes": ["92354", "92318", "92350", "92357"]},
                "Lompoc": {"zip_codes": ["93437", "93438"]},
                "Long Beach": {"zip_codes": ["90805", "90802", "90803", "90813", "90804", "90815", "90808", "90807", "90806", "90814", "90809", "90832", "90853", "90801", "90822", "90833", "90834", "90835", "90840", "90842", "90844", "90846", "90847", "90848", "90831", "90899"]},
                "Los Alamitos":{"zip_codes":["90720"]},
                "Los Alamos": {"zip_codes": ["93436", "93427", "93440"]},
                "Los Altos": {"zip_codes": ["94024", "94022", "94023"]},
                "Los Angeles": {"zip_codes": ["90046", "90034", "90026", "90066", "90019", "90004", "90011", "90025", "90027", "90731", "91335", "90036", "91331", "90042", "90006", "90024", "91402", "91367", "90049", "91406", "90020", "90028", "91601", "91405", "90003", "91343", "90018", "90016", "90247", "91304", "90043", "90037", "90045", "90005", "91344", "90057", "91605", "90029", "90291", "91606", "90065", "91423", "90069", "90292", "91604", "91401", "90035", "91306", "90744", "91607", "90048", "90007", "90068", "90032", "90063", "90033", "91316", "90038", "91326", "90064", "90039", "91325", "90012", "91403", "91356", "91352", "90031", "90017", "91364", "90041", "90272", "91303", "91324", "90062", "90710", "91411", "90732", "90015", "91201", "91340", "91040", "90293", "90502", "90013", "91436", "91345", "90014", "90077", "90094", "90009", "90067", "91309", "90010", "91413", "90021", "91392", "91409", "90748", "90733", "91365", "91313", "91416", "90051", "91353", "90294", "91371", "90086", "91609", "91394", "91412", "91610", "91615", "91327", "91426", "90075", "91346", "90083", "91614", "90082", "91333", "91395", "91043", "91396", "90071", "90053", "91408", "91357", "91334", "90296", "90030", "90054", "90060", "90070", "91603", "91041", "91328", "91305", "90087", "91337", "90093", "90076", "90091", "90081", "90073", "91404", "91407", "90050", "91616", "91617", "90072", "90078", "90079", "90055", "90090", "91330", "90189", "90099", "90095", "90089", "90088", "90084", "90080", "91329", "90074", "90052", "91410", "91470", "91482", "91495", "91496", "91499", "91608", "91611", "91612"]},
                "Los Gatos": {"zip_codes": ["95032", "95030", "95031"]},
                "Los Osos": {"zip_codes": ["93402", "93412"]},
                "Lyoth": {"zip_codes": ["95376", "95377", "95304", "95378", "95296"]},
                "Madera": {"zip_codes": ["93638", "93637", "93636", "93639"]},
                "Malibu": {"zip_codes": ["90265", "90264", "90263"]},
                "Manhattan Beach": {"zip_codes": ["90266", "90267"]},
                "Manteca": {"zip_codes": ["95336", "95337"]},
                "Maricopa": {"zip_codes": ["93225", "93222", "93252"]},
                "Marin City": {"zip_codes": ["94965", "94966"]},
                "Marshall": {"zip_codes": ["94952", "94940"]},
                "Mather": {"zip_codes": ["95321", "95389", "95305"]},
                "Maxwell": {"zip_codes": ["95932", "95955"]},
                "McClellan": {"zip_codes": ["95831", "95822", "95825", "95821", "95833", "95835", "95820", "95842", "95660", "95838", "95816", "95834", "95818", "95824", "95815", "95841", "95819", "95817", "95814", "95811", "95894", "95652", "95853", "95851", "95813", "95812", "95852", "95867", "94277", "94261", "94262", "94263", "94267", "94268", "94269", "94271", "94273", "94274", "94203", "94278", "94279", "94280", "94282", "94283", "94284", "94285", "94286", "94287", "94288", "94289", "94290", "94291", "94293", "94294", "94295", "94296", "94297", "94298", "94299", "94204", "94205", "94206", "94207", "94208", "94209", "94211", "94229", "94230", "94232", "94234", "94235", "94236", "94237", "94239", "94240", "94244", "94245", "94247", "94248", "95840", "94249", "94250", "94252", "94254", "94256", "94257", "94258", "94259"]},
                "Mendocino": {"zip_codes": ["95437", "95460", "95420"]},
                "Menifee": {"zip_codes": ["92584", "92586"]},
                "Menlo Park": {"zip_codes": ["94025", "94026"]},
                "Merced": {"zip_codes": ["95301", "95340", "95348", "95341", "95344", "95343"]},
                "Midway City": {"zip_codes": ["92684", "92685"]},
                "Mill Valley": {"zip_codes": ["94941", "94942"]},
                "Milpitas": {"zip_codes": ["95035", "95036"]},
                "Mira Mesa": {"zip_codes": ["92109", "92126", "92101", "92115", "92104", "92154", "92105", "92122", "92117", "92128", "92071", "92130", "92037", "92103", "92114", "92129", "92111", "92116", "92027", "92025", "92127", "92102", "92107", "92113", "92108", "92131", "92110", "92120", "92123", "92124", "92139", "92119", "92118", "92106", "92173", "92143", "92192", "92121", "92038", "92138", "92161", "92174", "92150", "92039", "92195", "92160", "92172", "92137", "92187", "92153", "92142", "92170", "92145", "92171", "92168", "92159", "92196", "92175", "92165", "92112", "92149", "92176", "92191", "92169", "92140", "92193", "92177", "92167", "92163", "92198", "92166", "92186", "92147", "92152", "92136", "92134", "92132", "92182", "92190", "92093", "92197", "92199", "92092"]},
                "Mission Viejo": {"zip_codes": ["92692", "92691", "92690"]},
                "Moccasin": {"zip_codes": ["95311", "95345", "95347"]},
                "Modesto": {"zip_codes": ["95355", "95350", "95351", "95356", "95358", "95354", "95367", "95357", "95368", "95352", "95353", "95397"]},
                "Moffett Field": {"zip_codes": ["94040", "94043", "94041", "94039", "94035", "94042"]},
                "Mojave": {"zip_codes": ["93501", "93502"]},
                "Mokelumne Hill": {"zip_codes": ["95245", "95248"]},
                "Monrovia": {"zip_codes": ["91016", "91017"]},
                "Montecito": {"zip_codes": ["93108", "93150"]},
                "Monterey": {"zip_codes": ["93940", "93955", "93923", "93944", "93943", "93942"]},
                "Monterey Park": {"zip_codes": ["91754", "91755", "91756"]},
                "Montrose": {"zip_codes": ["91224", "91021"]},
                "Moorpark": {"zip_codes": ["93021", "93020"]},
                "Moraga": {"zip_codes": ["94556", "94570", "94575"]},
                "Moreno Valley": {"zip_codes": ["92553", "92557", "92555", "92551", "92552", "92556", "92554"]},
                "Morro Bay": {"zip_codes": ["93442", "93443"]},
                "Mount Hermon": {"zip_codes": ["95018", "95041"]},
                "Mountain Gate": {"zip_codes": ["92262", "92264", "92282", "92263"]},
                "Mountain View": {"zip_codes": ["94040", "94043", "94041", "94039", "94035", "94042"]},
                "Murrieta": {"zip_codes": ["92562", "92563", "92564"]},
                "Napa": {"zip_codes": ["94558", "94559", "95694", "94599", "94581"]},
                "National City": {"zip_codes": ["91950", "91951"]},
                "Nevada City": {"zip_codes": ["95960", "95986"]},
                "Newbury Park": {"zip_codes": ["91320", "91360", "91362", "91359", "91319", "91358"]},
                "Newhall": {"zip_codes": ["91355", "91350", "91321", "91351", "91386", "91322", "91380", "91385", "91382", "91383"]},
                "Newman": {"zip_codes": ["95363", "95360"]},
                "Newport Beach": {"zip_codes": ["92660", "92625", "92661", "92662", "92658", "92659"]},
                "Newport Coast": {"zip_codes": ["92663", "92657"]},
                "Nipton": {"zip_codes": ["92323", "92366"]},
                "Nord": {"zip_codes": ["95926", "95928", "95942", "95976", "95927", "95929"]},
                "Norden": {"zip_codes": ["96161", "96140", "95728", "96162", "96111", "96160", "95724"]},
                "North Fork": {"zip_codes": ["93643", "93669"]},
                "North Highlands": {"zip_codes": ["95831", "95822", "95825", "95821", "95833", "95835", "95820", "95842", "95660", "95838", "95816", "95834", "95818", "95824", "95815", "95841", "95819", "95817", "95814", "95811", "95894", "95652", "95853", "95851", "95813", "95812", "95852", "95867", "94277", "94261", "94262", "94263", "94267", "94268", "94269", "94271", "94273", "94274", "94203", "94278", "94279", "94280", "94282", "94283", "94284", "94285", "94286", "94287", "94288", "94289", "94290", "94291", "94293", "94294", "94295", "94296", "94297", "94298", "94299", "94204", "94205", "94206", "94207", "94208", "94209", "94211", "94229", "94230", "94232", "94234", "94235", "94236", "94237", "94239", "94240", "94244", "94245", "94247", "94248", "95840", "94249", "94250", "94252", "94254", "94256", "94257", "94258", "94259"]},
                "North Sacramento": {"zip_codes": ["95831", "95822", "95825", "95821", "95833", "95835", "95820", "95842", "95660", "95838", "95816", "95834", "95818", "95824", "95815", "95841", "95819", "95817", "95814", "95811", "95894", "95652", "95853", "95851", "95813", "95812", "95852", "95867", "94277", "94261", "94262", "94263", "94267", "94268", "94269", "94271", "94273", "94274", "94203", "94278", "94279", "94280", "94282", "94283", "94284", "94285", "94286", "94287", "94288", "94289", "94290", "94291", "94293", "94294", "94295", "94296", "94297", "94298", "94299", "94204", "94205", "94206", "94207", "94208", "94209", "94211", "94229", "94230", "94232", "94234", "94235", "94236", "94237", "94239", "94240", "94244", "94245", "94247", "94248", "95840", "94249", "94250", "94252", "94254", "94256", "94257", "94258", "94259"]},
                "Northstar": {"zip_codes": ["95616", "95618", "95617"]},
                "Norwalk": {"zip_codes": ["90650", "90651", "90652"]},
                "Novato": {"zip_codes": ["94947", "94949", "94945", "94948", "94998"]},
                "Oakhurst": {"zip_codes": ["93644", "93604"]},
                "Oakland": {"zip_codes": ["94605", "94601", "94606", "94602", "94607", "94609", "94603", "94619", "94621", "94612", "94618", "94623", "94604", "94613", "94661", "94660", "94624", "94617", "94615", "94649", "94659", "94622", "94614", "94666"]},
                "Oakville": {"zip_codes": ["94558", "94559", "95694", "94599", "94581"]},
                "Oceano": {"zip_codes": ["93445", "93475"]},
                "Oceanside": {"zip_codes": ["92056", "92057", "92672", "92054", "92058", "92673", "92052", "92068", "92051", "92049", "92055"]},
                "Ojai": {"zip_codes": ["93023", "93024", "93040"]},
                "Ontario": {"zip_codes": ["91762", "91761", "91764", "91743", "91758"]},
                "Orange": {"zip_codes": ["92867", "92869", "92868", "92865", "92866", "92863", "92859", "92856", "92857", "92864", "92862"]},
                "Orcutt": {"zip_codes": ["93458", "93454", "93456", "93457"]},
                "Orland": {"zip_codes": ["95963", "95939", "95913"]},
                "Oroville": {"zip_codes": ["95969", "95965", "95938", "95940"]},
                "Oxnard": {"zip_codes": ["93033", "93030", "93036", "93035", "93031", "93034", "93032"]},
                "Pacific Beach": {"zip_codes": ["92109", "92126", "92101", "92115", "92104", "92154", "92105", "92122", "92117", "92128", "92071", "92130", "92037", "92103", "92114", "92129", "92111", "92116", "92027", "92025", "92127", "92102", "92107", "92113", "92108", "92131", "92110", "92120", "92123", "92124", "92139", "92119", "92118", "92106", "92173", "92143", "92192", "92121", "92038", "92138", "92161", "92174", "92150", "92039", "92195", "92160", "92172", "92137", "92187", "92153", "92142", "92170", "92145", "92171", "92168", "92159", "92196", "92175", "92165", "92112", "92149", "92176", "92191", "92169", "92140", "92193", "92177", "92167", "92163", "92198", "92166", "92186", "92147", "92152", "92136", "92134", "92132", "92182", "92190", "92093", "92197", "92199", "92092"]},
                "Palm Desert": {"zip_codes": ["92211", "92255", "92261"]},
                "Palm Springs": {"zip_codes": ["92262", "92264", "92282", "92263"]},
                "Palmdale": {"zip_codes": ["93550", "93551", "93552", "93591", "93590", "93599"]},
                "Palo Alto": {"zip_codes": ["94306", "94309", "94301", "94028", "94304", "94302"]},
                "Pasadena": {"zip_codes": ["91104", "91106", "91101", "91103", "91105", "91126", "91125", "91129", "91114", "91124", "91115", "91189", "91116", "91109", "91182", "91184", "91117", "91102", "91121", "91123", "91185", "91188", "91110", "91199"]},
                "Paso Robles": {"zip_codes": ["93446", "93447"]},
                "Paramount":{"zip_codes":["90723"]},
                "Penngrove": {"zip_codes": ["94951", "94999"]},
                "Perris": {"zip_codes": ["92585", "92572", "92599"]},
                "Petaluma": {"zip_codes": ["95476", "94954", "94931", "94975", "94953", "94955"]},
                "Phelan": {"zip_codes": ["92371", "92329"]},
                "Pico Rivera": {"zip_codes": ["90660", "90662", "90661"]},
                "Piedmont": {"zip_codes": ["94611", "94610", "94620"]},
                "Pine Grove": {"zip_codes": ["95666", "95665"]},
                "Pinecrest": {"zip_codes": ["95364", "95375"]},
                "Pixley": {"zip_codes": ["93219", "93256"]},
                "Placentia": {"zip_codes": ["92870", "92871", "92811"]},
                "Placerville": {"zip_codes": ["95667", "95651", "95613"]},
                "Planada": {"zip_codes": ["95365", "95333"]},
                "Pleasant Grove": {"zip_codes": ["95626", "95668"]},
                "Point Arena": {"zip_codes": ["95468", "95459"]},
                "Point Mugu NAWC": {"zip_codes": ["93041", "93044", "93043", "93042"]},
                "Point Reyes Station": {"zip_codes": ["94937", "94950"]},
                "Pollock Pines": {"zip_codes": ["95726", "95709"]},
                "Pomona": {"zip_codes": ["91766", "91767", "91768", "91769"]},
                "Port Hueneme": {"zip_codes": ["93041", "93044", "93043", "93042"]},
                "Portola": {"zip_codes": ["96122", "96106"]},
                "Poway": {"zip_codes": ["92064", "92074"]},
                "Prunedale": {"zip_codes": ["93906", "93905", "93901", "93907", "93912", "93915", "93902", "93962"]},
                "Quartz Hill": {"zip_codes": ["93535", "93536", "93534", "93539", "93584", "93586"]},
                "Quincy": {"zip_codes": ["95971", "95956", "95934", "95984", "95915"]},
                "Rancho Bernardo": {"zip_codes": ["92109", "92126", "92101", "92115", "92104", "92154", "92105", "92122", "92117", "92128", "92071", "92130", "92037", "92103", "92114", "92129", "92111", "92116", "92027", "92025", "92127", "92102", "92107", "92113", "92108", "92131", "92110", "92120", "92123", "92124", "92139", "92119", "92118", "92106", "92173", "92143", "92192", "92121", "92038", "92138", "92161", "92174", "92150", "92039", "92195", "92160", "92172", "92137", "92187", "92153", "92142", "92170", "92145", "92171", "92168", "92159", "92196", "92175", "92165", "92112", "92149", "92176", "92191", "92169", "92140", "92193", "92177", "92167", "92163", "92198", "92166", "92186", "92147", "92152", "92136", "92134", "92132", "92182", "92190", "92093", "92197", "92199", "92092"]},
                "Rancho Cordova": {"zip_codes": ["95670", "95742", "95741"]},
                "Rancho Cucamonga": {"zip_codes": ["91730", "91701", "91739", "91737", "92358", "91759", "91729"]},
                "Rancho Dominguez": {"zip_codes": ["90222", "90223", "90224"]},
                "Rancho Palos Verdes": {"zip_codes": ["90275", "90734"]},
                "Rancho San Diego": {"zip_codes": ["92021", "92020", "92019", "92022"]},
                "Rancho Santa Fe": {"zip_codes": ["92067", "92091"]},
                "Redding": {"zip_codes": ["96003", "96001", "96002", "96019", "96099"]},
                "Redlands": {"zip_codes": ["92373", "92374", "92375"]},
                "Redwood City": {"zip_codes": ["94061", "94065", "94064"]},
                "Represa": {"zip_codes": ["95630", "95763", "95671"]},
                "Rialto": {"zip_codes": ["92376", "92377"]},
                "Richgrove": {"zip_codes": ["93215", "93261"]},
                "Richmond": {"zip_codes": ["94804", "94801", "94805", "94802", "94808", "94850", "94807"]},
                "Ridgecrest": {"zip_codes": ["93555", "93556"]},
                "Riverdale": {"zip_codes": ["93656", "93607"]},
                "Riverside": {"zip_codes": ["92504", "92506", "92505", "92508", "92501", "92517", "92513", "92514", "92522", "92516", "92502", "92515", "92521"]},
                "Robbins": {"zip_codes": ["95645", "95676"]},
                "Rocklin": {"zip_codes": ["95678", "95765", "95677"]},
                "Rohnert Park": {"zip_codes": ["94928", "94927", "94926"]},
                "Rosemead": {"zip_codes": ["91770", "91771", "91772"]},
                "Rosemont, San Diego": {"zip_codes": ["92109", "92126", "92101", "92115", "92104", "92154", "92105", "92122", "92117", "92128", "92071", "92130", "92037", "92103", "92114", "92129", "92111", "92116", "92027", "92025", "92127", "92102", "92107", "92113", "92108", "92131", "92110", "92120", "92123", "92124", "92139", "92119", "92118", "92106", "92173", "92143", "92192", "92121", "92038", "92138", "92161", "92174", "92150", "92039", "92195", "92160", "92172", "92137", "92187", "92153", "92142", "92170", "92145", "92171", "92168", "92159", "92196", "92175", "92165", "92112", "92149", "92176", "92191", "92169", "92140", "92193", "92177", "92167", "92163", "92198", "92166", "92186", "92147", "92152", "92136", "92134", "92132", "92182", "92190", "92093", "92197", "92199", "92092"]},
                "Roseville": {"zip_codes": ["95747", "95661"]},
                "Ross": {"zip_codes": ["94904", "94957"]},
                "Rowland Heights": {"zip_codes": ["91748", "91789"]},
                "Rutherford": {"zip_codes": ["94558", "94559", "95694", "94599", "94581"]},
                "Sacramento": {"zip_codes": ["95831", "95822", "95825", "95821", "95833", "95835", "95820", "95842", "95660", "95838", "95816", "95834", "95818", "95824", "95815", "95841", "95819", "95817", "95814", "95811", "95894", "95652", "95853", "95851", "95813", "95812", "95852", "95867", "94277", "94261", "94262", "94263", "94267", "94268", "94269", "94271", "94273", "94274", "94203", "94278", "94279", "94280", "94282", "94283", "94284", "94285", "94286", "94287", "94288", "94289", "94290", "94291", "94293", "94294", "94295", "94296", "94297", "94298", "94299", "94204", "94205", "94206", "94207", "94208", "94209", "94211", "94229", "94230", "94232", "94234", "94235", "94236", "94237", "94239", "94240", "94244", "94245", "94247", "94248", "95840", "94249", "94250", "94252", "94254", "94256", "94257", "94258", "94259"]},
                "Saint Helena": {"zip_codes": ["94574", "94562", "94573"]},
                "Salinas": {"zip_codes": ["93906", "93905", "93901", "93907", "93912", "93915", "93902", "93962"]},
                "San Anselmo": {"zip_codes": ["94960", "94979"]},
                "San Bernardino": {"zip_codes": ["92404", "92346", "92410", "92405", "92411", "92408", "92423", "92401", "92402", "92406", "92369", "92413", "92427", "92418", "92415", "92403"]},
                "San Diego": {"zip_codes": ["92109", "92126", "92101", "92115", "92104", "92154", "92105", "92122", "92117", "92128", "92071", "92130", "92037", "92103", "92114", "92129", "92111", "92116", "92027", "92025", "92127", "92102", "92107", "92113", "92108", "92131", "92110", "92120", "92123", "92124", "92139", "92119", "92118", "92106", "92173", "92143", "92192", "92121", "92038", "92138", "92161", "92174", "92150", "92039", "92195", "92160", "92172", "92137", "92187", "92153", "92142", "92170", "92145", "92171", "92168", "92159", "92196", "92175", "92165", "92112", "92149", "92176", "92191", "92169", "92140", "92193", "92177", "92167", "92163", "92198", "92166", "92186", "92147", "92152", "92136", "92134", "92132", "92182", "92190", "92093", "92197", "92199", "92092"]},
                "San Francisco": {"zip_codes": ["94109", "94110", "94122", "94112", "94115", "94117", "94121", "94102", "94118", "94114", "94107", "94116", "94123", "94103", "94131", "94133", "94134", "94132", "94124", "94127", "94108", "94105", "94158", "94111", "94129", "94130", "94141", "94104", "94142", "94126", "94164", "94140", "94146", "94016", "94172", "94159", "94125", "94119", "94147", "94188", "94120", "94137", "94139", "94143", "94144", "94145", "94151", "94160", "94161", "94163", "94177"]},
                "San Gabriel": {"zip_codes": ["91776", "91775", "91778"]},
                "San Jacinto": {"zip_codes": ["92583", "92582", "92581"]},
                "San Jose": {"zip_codes": ["95123", "95125", "95112", "95127", "95136", "95111", "95129", "95134", "95116", "95122", "95132", "95148", "95118", "95117", "95121", "95131", "95133", "95135", "95110", "95138", "95130", "95119", "95139", "95113", "95156", "95002", "95173", "95152", "95190", "95153", "95159", "95154", "95151", "95160", "95170", "95106", "95103", "95161", "95108", "95157", "95150", "95109", "95155", "95172", "95158", "95013", "95196", "95164", "95141", "95115", "95101", "95191", "95192", "95193", "95194"]},
                "San Juan Capistrano": {"zip_codes": ["92675", "92694", "92693"]},
                "San Leandro": {"zip_codes": ["94577", "94578", "94579"]},
                "San Lucas": {"zip_codes": ["93450", "93954"]},
                "San Luis Obispo": {"zip_codes": ["93401", "93405", "93449", "93403", "93406", "93408", "93409", "93410", "93407"]},
                "San Luis Rey": {"zip_codes": ["92056", "92057", "92672", "92054", "92058", "92673", "92052", "92068", "92051", "92049", "92055"]},
                "San Marcos": {"zip_codes": ["92078", "92069", "92079", "92096"]},
                "San Marino": {"zip_codes": ["91108", "91118"]},
                "San Mateo": {"zip_codes": ["94403", "94404", "94401", "94402", "94497"]},
                "San Rafael": {"zip_codes": ["94901", "94903", "94913", "94964", "94912", "94915"]},
                "San Ramon": {"zip_codes": ["94583", "94582"]},
                "San Ysidro": {"zip_codes": ["92109", "92126", "92101", "92115", "92104", "92154", "92105", "92122", "92117", "92128", "92071", "92130", "92037", "92103", "92114", "92129", "92111", "92116", "92027", "92025", "92127", "92102", "92107", "92113", "92108", "92131", "92110", "92120", "92123", "92124", "92139", "92119", "92118", "92106", "92173", "92143", "92192", "92121", "92038", "92138", "92161", "92174", "92150", "92039", "92195", "92160", "92172", "92137", "92187", "92153", "92142", "92170", "92145", "92171", "92168", "92159", "92196", "92175", "92165", "92112", "92149", "92176", "92191", "92169", "92140", "92193", "92177", "92167", "92163", "92198", "92166", "92186", "92147", "92152", "92136", "92134", "92132", "92182", "92190", "92093", "92197", "92199", "92092"]},
                "Santa Ana": {"zip_codes": ["92704","92705", "92707", "92703", "92701", "92706", "92711", "92735", "92702", "92712"]},
                "Santa Barbara": {"zip_codes": ["93101", "93103", "93109", "93140", "93102", "93120", "93160", "93130", "93190", "93121", "93107"]},
                "Santa Clara": {"zip_codes": ["95051", "95050", "95054", "95052", "95056", "95055", "95053"]},
                "Santa Clarita": {"zip_codes": ["91355", "91350", "91321", "91351", "91386", "91322", "91380", "91385", "91382", "91383"]},
                "San Clemente":{"zip_codes":["92672"]},
                "Santa Cruz": {"zip_codes": ["95060", "95062", "95065", "95064", "95017", "95063", "95061"]},
                "Santa Fe Springs, Los Angeles": {"zip_codes": ["90670", "90671"]},
                "Santa Margarita": {"zip_codes": ["93422", "93423"]},
                "Santa Maria": {"zip_codes": ["93458", "93454", "93456", "93457"]},
                "Santa Monica": {"zip_codes": ["90405", "90403", "90404", "90401", "90402", "90409", "90406", "90408", "90410", "90411", "90407"]},
                "Santa Paula": {"zip_codes": ["93060", "93061"]},
                "Santa Rosa": {"zip_codes": ["95403", "95404", "95401", "95407", "95409", "95405", "95452", "95406", "95402"]},
                "Santa Venetia": {"zip_codes": ["94901", "94903", "94913", "94964", "94912", "94915"]},
                "Saratoga": {"zip_codes": ["95070", "95071"]},
                "Saugus": {"zip_codes": ["91355", "91350", "91321", "91351", "91386", "91322", "91380", "91385", "91382", "91383"]},
                "Sausalito": {"zip_codes": ["94965", "94966"]},
                "Scenic Heights": {"zip_codes": ["95370", "95373"]},
                "Scotts Valley": {"zip_codes": ["95066", "95067"]},
                "Seal Beach": {"zip_codes": ["92683", "90740"]},
                "Seaside": {"zip_codes": ["93933", "93908"]},
                "Sepulveda": {"zip_codes": ["91205", "91206", "91214", "91202", "91208", "91204", "91203", "91207", "91020", "91226", "91210", "91393", "91046", "91225", "91209", "91222", "91221"]},
                "Shandon": {"zip_codes": ["93432", "93461"]},
                "Shasta Lake": {"zip_codes": ["96089", "96079"]},
                "Sierra Madre": {"zip_codes": ["91024", "91025"]},
                "Silverado": {"zip_codes": ["92676"]},
                "Simi Valley": {"zip_codes": ["93065", "93063", "93094", "93062", "93064", "93099"]},
                "Solvang": {"zip_codes": ["93463", "93464"]},
                "Sonoma": {"zip_codes": ["95416", "95487", "95433"]},
                "Sonora": {"zip_codes": ["95370", "95373"]},
                "South Bay Terraces": {"zip_codes": ["92109", "92126", "92101", "92115", "92104", "92154", "92105", "92122", "92117", "92128", "92071", "92130", "92037", "92103", "92114", "92129", "92111", "92116", "92027", "92025", "92127", "92102", "92107", "92113", "92108", "92131", "92110", "92120", "92123", "92124", "92139", "92119", "92118", "92106", "92173", "92143", "92192", "92121", "92038", "92138", "92161", "92174", "92150", "92039", "92195", "92160", "92172", "92137", "92187", "92153", "92142", "92170", "92145", "92171", "92168", "92159", "92196", "92175", "92165", "92112", "92149", "92176", "92191", "92169", "92140", "92193", "92177", "92167", "92163", "92198", "92166", "92186", "92147", "92152", "92136", "92134", "92132", "92182", "92190", "92093", "92197", "92199", "92092"]},
                "South Lake Tahoe": {"zip_codes": ["96150", "96151", "96158", "96152", "96154", "96155", "96156", "96157", "95721"]},
                "South Pasadena": {"zip_codes": ["91030", "91031"]},
                "South San Francisco": {"zip_codes": ["94080", "94083"]},
                "Spreckels": {"zip_codes": ["93906", "93905", "93901", "93907", "93912", "93915", "93902", "93962"]},
                "Spring Valley": {"zip_codes": ["91977", "91914", "91978", "91979", "91976"]},
                "Stanislaus": {"zip_codes": ["95247", "95233"]},
                "Stanton":{"zip_codes":["90680"]},
                "Stevinson": {"zip_codes": ["95334", "95374"]},
                "Stockton": {"zip_codes": ["95209", "95210", "95212", "95203", "95202", "95208", "95269", "95213", "95201", "95211", "95267", "95297"]},
                "Suisun City": {"zip_codes": ["94585", "94512"]},
                "Sultana": {"zip_codes": ["93618", "93666"]},
                "Sun City": {"zip_codes": ["92584", "92586"]},
                "Sunnyvale": {"zip_codes": ["94087", "94086", "94085", "94088"]},
                "Sunol": {"zip_codes": ["94539", "94586"]},
                "Susanville": {"zip_codes": ["96130", "96127"]},
                "Sutter Creek": {"zip_codes": ["95642", "95685"]},
                "Tehachapi": {"zip_codes": ["93561", "93581", "93531"]},
                "Tehama": {"zip_codes": ["96021", "96090"]},
                "Temecula": {"zip_codes": ["92591", "92590", "92589", "92593"]},
                "Thermal": {"zip_codes": ["92274", "92275"]},
                "Thousand Oaks": {"zip_codes": ["91320", "91360", "91362", "91359", "91319", "91358"]},
                "Three Rivers": {"zip_codes": ["93262", "93237"]},
                "Tollhouse": {"zip_codes": ["93657", "93667"]},
                "Torrance": {"zip_codes": ["90277", "90503", "90501", "90505", "90504", "90510", "90507", "90508", "90509"]},
                "Tracy": {"zip_codes": ["95376", "95377", "95304", "95378", "95296"]},
                "Traver": {"zip_codes": ["93631", "93673"]},
                "Truckee": {"zip_codes": ["96161", "96140", "95728", "96162", "96111", "96160", "95724"]},
                "Tulare": {"zip_codes": ["93274", "93275"]},
                "Turlock": {"zip_codes": ["95380", "95382", "95381"]},
                "Tustin": {"zip_codes": ["92780", "92782", "92781"]},
                "Twain Harte": {"zip_codes": ["95383", "95346"]},
                "Twin Bridges": {"zip_codes": ["95735", "95720"]},
                "Twin Peaks": {"zip_codes": ["94109", "94110", "94122", "94112", "94115", "94117", "94121", "94102", "94118", "94114", "94107", "94116", "94123", "94103", "94131", "94133", "94134", "94132", "94124", "94127", "94108", "94105", "94158", "94111", "94129", "94130", "94141", "94104", "94142", "94126", "94164", "94140", "94146", "94016", "94172", "94159", "94125", "94119", "94147", "94188", "94120", "94137", "94139", "94143", "94144", "94145", "94151", "94160", "94161", "94163", "94177"]},
                "Ukiah": {"zip_codes": ["95482", "95481", "95418"]},
                "Upland": {"zip_codes": ["91786", "91784", "91785"]},
                "Upper Lake": {"zip_codes": ["95485", "95493"]},
                "Vacaville": {"zip_codes": ["95687", "95688", "94535", "95696", "95625"]},
                "Valencia": {"zip_codes": ["91355", "91350", "91321", "91351", "91386", "91322", "91380", "91385", "91382", "91383"]},
                "Vallejo": {"zip_codes": ["94591", "94590", "94589", "94592"]},
                "Valley Springs": {"zip_codes": ["95252", "95225", "95226"]},
                "Vandenberg AFB": {"zip_codes": ["93437", "93438"]},
                "Ventura": {"zip_codes": ["93003", "93001", "93004", "93022", "93002", "93005", "93007", "93006", "93009"]},
                "Verdugo City": {"zip_codes": ["91205", "91206", "91214", "91202", "91208", "91204", "91203", "91207", "91020", "91226", "91210", "91393", "91046", "91225", "91209", "91222", "91221"]},
                "Victorville": {"zip_codes": ["92392", "92395", "92394", "92393"]},
                "Visalia": {"zip_codes": ["93277", "93291", "93292", "93278", "93227", "93290", "93279", "93670"]},
                "Vista": {"zip_codes": ["92084", "92083", "92081", "92085"]},
                "Walnut Grove": {"zip_codes": ["95690", "95615", "95680"]},
                "Watsonville": {"zip_codes": ["95076", "95077"]},
                "Waukena": {"zip_codes": ["93274", "93275"]},
                "West Covina": {"zip_codes": ["91790", "91791", "91792", "91793"]},
                "West Sacramento": {"zip_codes": ["95691", "95605", "95799", "95798", "95899"]},
                "Westminster": {"zip_codes": ["92684", "92685"]},
                "Westmont": {"zip_codes": ["90044", "90047"]},
                "Westmorland": {"zip_codes": ["92251", "92281"]},
                "Whittier": {"zip_codes": ["90602", "90603","90604", "90610", "90607", "90609", "90608"]},
                "Willowbrook": {"zip_codes": ["90059", "90061"]},
                "Winterhaven": {"zip_codes": ["92283", "92222", "85369"]},
                "Woodcrest": {"zip_codes": ["92504", "92506", "92505", "92508", "92501", "92517", "92513", "92514", "92522", "92516", "92502", "92515", "92521"]},
                "Woodland": {"zip_codes": ["95776", "95698"]},
                "Yolo": {"zip_codes": ["95695", "95697"]},
                "Yorba Linda": {"zip_codes": ["92886", "92887", "92885"]},
                "Yuba City": {"zip_codes": ["95991", "95993", "95992"]},
                "Yucca Valley": {"zip_codes": ["92284", "92286"]}
            };
            var result = [];
            for (var city in zips) {
                for (var i = 0; i < zips[city]["zip_codes"].length; i++) {
                    if (zips[city]["zip_codes"][i] === zip) {
                        result.push(city + ", CA");
                    }
                }

            }
            return result;
        }

            function zoomToFeature(e) {
            var area_click_on=e.target.feature.properties.name;
            console.log(area_click_on);
            if(area_click_on==="Los Angeles County"){
                mc.information=county_los_angeles.features[0].properties;
            }
            else if(area_click_on==="Orange County"){
                mc.information=county_orange.features[0].properties;
            }
            else{
                if(Weikuan_Combined_Firebase.hasOwnProperty(area_click_on)){
                    var temp={};
                    for(var key in Weikuan_Combined_Firebase[area_click_on]){
                        if(key!=="zip_codes"){
                            temp[key]=Weikuan_Combined_Firebase[area_click_on][key];
                        }
                    }
                    mc.information=temp;
                }
                else {
                    var city=find_city_based_on_zip_code(area_click_on);
                    console.log(city);
                    if(city.length!==0){
                        mc.information={};
                        for(var i=0;i<city.length;i++){
                            if(Weikuan_Combined_Firebase[city[i]]["zip_codes"][area_click_on]!==undefined)
                                mc.information[city[i]]=Weikuan_Combined_Firebase[city[i]]["zip_codes"][area_click_on];
                            else{
                                mc.information[city[i]]=Weikuan_Combined_Firebase[city[i]]["zip_codes"];
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