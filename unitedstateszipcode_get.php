<?php
header("Access-Control-Allow-Origin: *");

if(isset($_GET['zip'])) {
    $zip = $_GET['zip'];
}
$url = "http://www.unitedstateszipcodes.org/".$zip."/";
$usps = file_get_contents($url);

echo $usps;

str_
?>