var config = {
    apiKey: "AIzaSyDA0QfT-TwSiFshrNjrg3yQ67bPBo4HVsw",
    authDomain: "realvalue-ebd58.firebaseapp.com",
    databaseURL: "https://realvalue-ebd58.firebaseio.com",
    storageBucket: "realvalue-ebd58.appspot.com",
    messagingSenderId: "73443138678"
};
firebase.initializeApp(config);
var fbRef=firebase.database();
var oc_cities=['Aliso Viejo', 'Anaheim', 'Brea', 'Buena Park', 'Costa Mesa', 'Cypress', 'Dana Point', 'Fountain Valley',
    'Fullerton', 'Garden Grove', 'Huntington Beach', 'Irvine', 'La Habra', 'La Palma', 'Laguna Beach', 'Laguna Hills',
'Laguna Niguel', 'Laguna Woods', 'Lake Forest', 'Los Alamitos', 'Mission Viejo', 'Newport Beach',
'Orange', 'Placentia', 'Rancho Santa Margarita', 'San Clemente', 'San Juan Capistrano', 'Santa Ana', 'Seal Beach',
    'Stanton', 'Tustin', 'Villa Park', 'Westminster', 'Yorba Linda'];
console.log(oc_cities.length);
var lc_cities=['Agoura Hills, CA', 'Alhambra, CA', 'Arcadia, CA', 'Artesia, CA', 'Avalon, CA', 'Azusa, CA',
    'Baldwin Park, CA', 'Bell, CA', 'Bell Gardens, CA', 'Bellflower, CA', 'Beverly Hills, CA', 'Bradbury, CA',
    'Burbank, CA', 'Calabasas, CA', 'Carson, CA', 'Cerritos, CA', 'Claremont, CA', 'Commerce, CA',
    'Compton, CA', 'Covina, CA', 'Cudahy, CA', 'Culver City, CA', 'Diamond Bar, CA', 'Downey, CA', 'Duarte, CA',
    'El Monte, CA', 'El Segundo, CA', 'Gardena, CA', 'Glendale, CA', 'Glendora, CA', 'Hawaiian Gardens, CA',
    'Hawthorne, CA', 'Hermosa Beach, CA', 'Hidden Hills, CA', 'Huntington Park, Los Angeles, CA', 'Industry, CA',
    'Inglewood, CA', 'Irwindale, CA', 'La Canada Flintridge, CA', 'La Habra Heights, Los Angeles, CA', 'La Mirada, CA',
    'La Puente, CA', 'La Verne, CA', 'Lakewood, CA', 'Lancaster, CA', 'Lawndale, CA', 'Lomita, CA',
    'Long Beach, CA', 'Los Angeles, CA', 'Lynwood, CA', 'Malibu, CA', 'Manhattan Beach, CA', 'Maywood, CA',
    'Monrovia, CA', 'Montebello, CA', 'Monterey Park, CA', 'Norwalk, CA', 'Palmdale, CA', 'Palos Verdes Estates, CA',
    'Paramount, CA', 'Pasadena, CA', 'Pico Rivera, CA', 'Pomona, CA', 'Rancho Palos Verdes, CA', 'Redondo Beach, CA',
    'Rolling Hills, CA', 'Rolling Hills Estates, CA', 'Rosemead, CA', 'San Dimas, CA', 'San Fernando, CA',
    'San Gabriel, CA', 'San Marino, CA', 'Santa Clarita, CA', 'Santa Fe Springs, Los Angeles, CA', 'Santa Monica, CA',
    'Sierra Madre, CA', 'Signal Hill, CA', 'South El Monte, CA', 'South Gate, CA', 'South Pasadena, CA',
    'Temple City, CA', 'Torrance, CA', 'Vernon, CA', 'Walnut, CA', 'West Covina, CA', 'West Hollywood, CA',
    'Westlake Village, CA', 'Whittier, CA'];
var crime;
fbRef.ref('morecrime').on('value',function(snapshot){
   crime=snapshot.val()["2014"];
    console.log("loaded");
});
fbRef.ref('combine').on('value',function(snapshot){
    var object=snapshot.val();
    var oc_job_number_array=[];
    var oc_job_number=0;
    var oc_crime_number_array=[];
    var oc_crime_number=0;

    var lc_job_number_array=[];
    var lc_job_number=0;
    var lc_crime_number_array=[];
    var lc_crime_number=0;

    var job_number_array=[];
    var job_number=0;
    var crime_number_array=[];
    var crime_number=0;
    var oc={};
    var lc={};
    var oc_lc={};
    for(var city in object){
        var city_no_ca=city.substring(0,city.length-4);
        if(oc_cities.indexOf(city_no_ca)!==-1) {
            console.log(city_no_ca);
            oc_job_number_array.push(object[city]["Number of job openings"]);
            oc_job_number+=object[city]["Number of job openings"];
            job_number_array.push(object[city]["Number of job openings"]);
            job_number+=object[city]["Number of job openings"];

            try {
                oc_crime_number_array.push(parseInt(crime[city_no_ca]["Violent_sum"]));
                oc_crime_number += parseInt(crime[city_no_ca]["Violent_sum"]);
                crime_number_array.push(parseInt(crime[city_no_ca]["Violent_sum"]));
                crime_number += parseInt(crime[city_no_ca]["Violent_sum"]);
            }catch(err){
                //console.error(city);
            }
        }
        else if(lc_cities.indexOf(city)!==-1){
            lc_job_number_array.push(object[city]["Number of job openings"]);
            lc_job_number+=object[city]["Number of job openings"];
            job_number_array.push(object[city]["Number of job openings"]);
            job_number+=object[city]["Number of job openings"];
            try{
            lc_crime_number_array.push(parseInt(crime[city_no_ca]["Violent_sum"]));
            lc_crime_number+=parseInt(crime[city_no_ca]["Violent_sum"]);
            crime_number_array.push(parseInt(crime[city_no_ca]["Violent_sum"]));
            crime_number+=parseInt(crime[city_no_ca]["Violent_sum"]);}catch(err){
                //console.error(city);
            }
        }

    }
    console.log(lc_crime_number);
    oc.jobMax=Math.max.apply(null,oc_job_number_array);
    oc.jobMin=Math.min.apply(null,oc_job_number_array);
    oc.jobDataTotal=oc_job_number_array.length;
    oc.jobAverage=Math.floor(oc_job_number/oc.jobDataTotal);

    oc.crimeMax=Math.max.apply(null,oc_crime_number_array);
    oc.crimeMin=Math.min.apply(null,oc_crime_number_array);
    oc.crimeDataTotal=oc_crime_number_array.length;
    oc.crimeAverage=Math.floor(oc_crime_number/oc.crimeDataTotal);

    lc.jobMax=Math.max.apply(null,lc_job_number_array);
    lc.jobMin=Math.min.apply(null,lc_job_number_array);
    lc.jobDataTotal=lc_job_number_array.length;
    lc.jobAverage=Math.floor(lc_job_number/lc.jobDataTotal);

    lc.crimeMax=Math.max.apply(null,lc_crime_number_array);
    lc.crimeMin=Math.min.apply(null,lc_crime_number_array);
    lc.crimeDataTotal=lc_crime_number_array.length;
    lc.crimeAverage=Math.floor(lc_crime_number/lc.crimeDataTotal);

    oc_lc.jobMax=Math.max.apply(null,job_number_array);
    oc_lc.jobMin=Math.min.apply(null,job_number_array);
    oc_lc.jobDataTotal=job_number_array.length;
    oc_lc.jobAverage=Math.floor(job_number/oc_lc.jobDataTotal);

    oc_lc.crimeMax=Math.max.apply(null,crime_number_array);
    oc_lc.crimeMin=Math.min.apply(null,crime_number_array);
    oc_lc.crimeDataTotal=crime_number_array.length;
    oc_lc.crimeAverage=Math.floor(crime_number/oc_lc.crimeDataTotal);


    console.log(oc);
    console.log(lc);
    console.log(oc_lc);
    fbRef.ref('crime-and-job-data-analysis/all').set(oc_lc);
    fbRef.ref('crime-and-job-data-analysis/oc').set(oc);
    fbRef.ref('crime-and-job-data-analysis/lc').set(lc);



});