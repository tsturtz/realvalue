function randomnumber(){
    return Math.floor(Math.random()*100);
}
function total(num_obj){
    var sum=0;
    console.log("----numbers91331-----");
    console.log(num_obj);
    for(var loc in num_obj){
        if((loc!=="crime")&&(loc!=="traffic")){
            sum+=num_obj[loc];
        }
    }
    console.log("------sum-------");
    console.log(sum);
    return sum;
}

function dummy_place_id(){
    var alpha="abcdefghijklmnopqrstuvwxyz0123456789";
    var result="";
    for(var i=0;i<10;i++){
        result+=alpha[Math.floor(Math.random()*alpha.length)];
    }
    return result;
}
function find_restaurants(zip_obj){
    var result=[];
    var lat_lng=zip_obj.features[0].geometry.coordinates;
    for(var i=0;i<10;i++){
        var random_lat_lng=lat_lng[0][Math.floor(Math.random()*lat_lng[0].length)];
        var restaurant={
            "Place ID":dummy_place_id(),
            "Place Type":"Restaurant",
            "lat":random_lat_lng[1],
            "lng":random_lat_lng[0]
        };
        result.push(restaurant);
    }
    console.log("----Restaurant----");
    console.log(result);
    return result;
}
var numbers_91331={
    "restaurant":randomnumber(),
    "airport":randomnumber(),
    "library":randomnumber(),
    "bar/nightclub":randomnumber(),
    "cafe":randomnumber(),
    "museum":randomnumber(),
    "park":randomnumber(),
    "police dept":randomnumber(),
    "hospital/doctor office":randomnumber(),
    "school":randomnumber(),
    "gas station":randomnumber(),
    "university":randomnumber(),
    "gym":randomnumber(),
    "zoo":randomnumber(),
    "crime":randomnumber(),
    "housing/rental market":randomnumber(),
    "traffic":randomnumber(),
    "walk score":randomnumber(),
    "job openings":randomnumber()
};

find_restaurants(zip_91331);
var dummy_restaurant_details={
    "html_attributions" : [],
    "result" : {
        "address_components" : [
            {
                "long_name" : "13630",
                "short_name" : "13630",
                "types" : [ "street_number" ]
            },
            {
                "long_name" : "Van Nuys Blvd",
                "short_name" : "Van Nuys Blvd",
                "types" : [ "route" ]
            },
            {
                "long_name" : "Pacoima",
                "short_name" : "Pacoima",
                "types" : [ "locality", "political" ]
            },
            {
                "long_name" : "California",
                "short_name" : "CA",
                "types" : [ "administrative_area_level_1", "political" ]
            },
            {
                "long_name" : "The United States",
                "short_name" : "US",
                "types" : [ "country", "political" ]
            },
            {
                "long_name" : "91331",
                "short_name" : "91331",
                "types" : [ "postal_code" ]
            }
        ],
        "formatted_address" : "13630 Van Nuys Blvd, Pacoima, CA, 91331",
        "formatted_phone_number" : "(818) 899 1199",
        "geometry" : {
            "location" : {
                "lat" :  33.77579,
                "lng" : -117.853125
            },
            "viewport" : {
                "northeast" : {
                    "lat" : 33.77579,
                    "lng" : -117.853125
                },
                "southwest" : {
                    "lat" : 33.77579,
                    "lng" : -117.853125
                }
            }
        },
        "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
        "id" : "4f89212bf76dde31f092cfc14d7506555d85b5c7",
        "international_phone_number" : "+1 818 899 1199",
        "name" : "Google The United States",
        "place_id" : "ChIJN1t_tDeuEmsRUsoyG83frY4",
        "scope" : "GOOGLE",
        "alt_ids" : [
            {
                "place_id" : "D9iJyWEHuEmuEmsRm9hTkapTCrk",
                "scope" : "APP"
            }
        ],
        "rating" : 4.70,
        "reference" : "CnRsAAAA98C4wD-VFvzGq-KHVEFhlHuy1TD1W6UYZw7KjuvfVsKMRZkbCVBVDxXFOOCM108n9PuJMJxeAxix3WB6B16c1p2bY1ZQyOrcu1d9247xQhUmPgYjN37JMo5QBsWipTsnoIZA9yAzA-0pnxFM6yAcDhIQbU0z05f3xD3m9NQnhEDjvBoUw-BdcocVpXzKFcnMXUpf-nkyF1w",
        "reviews" : [
            {
                "aspects" : [
                    {
                        "rating" : 3,
                        "type" : "quality"
                    }
                ],
                "author_name" : "Simon Bengtsson",
                "author_url" : "https://plus.google.com/104675092887960962573",
                "language" : "en",
                "rating" : 5,
                "text" : "Just went inside to have a look at Google. Amazing.",
                "time" : 1338440552869
            },
            {
                "aspects" : [
                    {
                        "rating" : 3,
                        "type" : "quality"
                    }
                ],
                "author_name" : "Felix Rauch Valenti",
                "author_url" : "https://plus.google.com/103291556674373289857",
                "language" : "en",
                "rating" : 5,
                "text" : "Best place to work :-)",
                "time" : 1338411244325
            },
            {
                "aspects" : [
                    {
                        "rating" : 3,
                        "type" : "quality"
                    }
                ],
                "author_name" : "Chris",
                "language" : "en",
                "rating" : 5,
                "text" : "Great place to work, always lots of free food!",
                "time" : 1330467089039
            }
        ],
        "types" : [ "establishment" ],
        "url" : "http://maps.google.com/maps/place?cid=10281119596374313554",
        "vicinity" : "48 Pirrama Road, Pyrmont",
        "website" : "http://www.google.com.au/"
    },
    "status" : "OK"
};
console.log('place details: ', dummy_restaurant_details);