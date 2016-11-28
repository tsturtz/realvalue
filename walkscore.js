/**
 * Created by danh on 11/23/16.
 */
function walkscore(obj) {
    $.ajax({
        url: 'walk_score.php',
        async: true,
        data: {lat:obj.lat,lng:obj.lng},
        success: function (response) {
            console.log("Walkscore is "+response.walkscore);
        }
    });
}