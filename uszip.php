<?php
header("Access-Control-Allow-Origin: *");

echo "<a href='uszip.php?zip=92866'>Click Here</a><BR>";

if(isset($_GET['zip'])) {
    $zip = $_GET['zip'];
    $url = "http://www.unitedstateszipcodes.org/".$zip."/";
    $usps = file_get_contents($url);
    //echo $usps;

    $pos = strpos($usps,'geojson');
    $end_pos = strpos($usps, 'bounds =');
    $length = $end_pos - $pos;

    $table_pos = strpos($usps, '<table class="table table-hover">');
    $table_end_pos = strpos($usps, '</tbody>
			</table>
		</div>');
    $table_length = $table_end_pos - $table_pos;

    //echo "table pos " . $table_pos . "<BR>";
    //echo "table end pos " . $table_end_pos . "<BR>";

    echo substr($usps,$pos, $length);

    echo "<BR>" . substr($usps,$table_pos,$table_length);
    echo "</table>";

}

echo "<BR><a href='$url' target='_blank'>" . $url . "</a>";
?>