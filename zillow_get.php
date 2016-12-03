<?php
header('Content-type: application/json');
header("Access-Control-Allow-Origin: *");
$myXMLData = file_get_contents("http://www.zillow.com/webservice/GetRegionChildren.htm?zws-id=X1-ZWz19hii866bd7_14qhc&state=California&county=LosAngeles&childtype=zipcode");
//$myXMLData = file_get_contents("http://www.zillow.com/webservice/GetRegionChildren.htm?zws-id=X1-ZWz19hii866bd7_14qhc&state=California&county=Orange&childtype=city");

$xml=simplexml_load_string($myXMLData) or die("Error: Cannot create object");
print_r(json_encode($xml));

?>