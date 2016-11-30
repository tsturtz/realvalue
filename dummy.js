/**
 * Created by danh on 11/22/16.
 */
function dummydata(data) {
    //console.log(data);
    var dummy = [
        {
            id:92856,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92859,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92863,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92865,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92867,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92689,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92857,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92862,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92864,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92866,
            lat:33.78404,
            lng:-117.844161
        },
        {
            id:92868,
            lat:33.78404,
            lng:-117.844161
        }
    ];

    for(var i=0;i<20;i++) {
        var lat=data.lat+randomNumber()*i;
        var lng=data.lng+randomNumber()*i;
        var dummyObj = {
            lat:lat ,
            lng:lng
        }
        addMarkerWithTimeout(dummyObj,500); // function that adds markers
        //console.log("dummy",dummyObj);
    }

}

function randomNumber() {
    return Math.random()*0.05;
}