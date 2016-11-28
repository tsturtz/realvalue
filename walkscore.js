/**
 * Created by danh on 11/23/16.
 */
function walkscore(obj) {
    console.log("obj",obj);
    var deferred = Q.defer();

    $.ajax({
        url: 'walk_score.php',
        async: true,
        data: {lat:obj.lat,lng:obj.lng},
        success: function (response) {
            console.log(response);
            deferred.resolve(response);
        }
    });

    return deferred.promise;
}