<?php
header('Content-type: application/json');
header("Access-Control-Allow-Origin: *");

if(!isset($address)) {
    $address = 'irvine,ca';
} else {
    $address = str_replace(" ", "+",$_GET['s']);
}
$json = file_get_contents("https://maps.googleapis.com/maps/api/geocode/json?address=$address&key=AIzaSyDa6lkpC-bOxXWEbrWaPlw_FneCpQhlgNE");
//$myXMLData = file_get_contents("http://www.zillow.com/webservice/GetRegionChildren.htm?zws-id=X1-ZWz19hii866bd7_14qhc&state=California&county=Orange&childtype=city");
print_r($json);
?>