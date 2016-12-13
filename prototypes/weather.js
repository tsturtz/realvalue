


function weather(obj) {
    var deferred = Q.defer();
    $.ajax({
        url:'http://api.openweathermap.org/data/2.5/weather?units=Imperial&lat='+obj.lat+'&lon='+obj.lng+'&APPID=314dd833bfe94b3598a281b4d9482534',
        dataType:'json',
        success:function(response){
            deferred.resolve(response.main.temp);
        }
    })
    return deferred.promise;

}
