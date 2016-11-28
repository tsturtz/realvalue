/**
 * Created by danh on 11/23/16.
 */
function walkscore(obj) {


    console.log("obj",obj);

    $.ajax({
        url: 'walk_score.php',
        async: true,
        data: {lat:obj.lat,lng:obj.lng},
        success: function (response) {
            walkobj = response;
            console.log("walk ", walkobj);
        }
    });
}