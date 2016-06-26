<?php
function getClubes() {

	$query = "SELECT * FROM clubes c ORDER BY nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}


?>
