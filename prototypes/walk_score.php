<?php
header('Content-type: application/json');
header("Access-Control-Allow-Origin: *");
$myXMLData = file_get_contents("http://api.walkscore.com/score?&lat=".$_GET['lat']."&lon=".$_GET['lng']."&wsapikey=dab01cb779ede18acd2be6e25a898acb");
$xml=simplexml_load_string($myXMLData) or die("Error: Cannot create object");
print_r(json_encode($xml));
?>