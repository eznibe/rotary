<?php

// Get list of all users or one in particular if the id is given

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

include_once 'domain/clubes.php';

db_connect();


if(isset($_GET['nro'])) {
	$value = getClub($_GET['nro']);
}
else if(isset($_GET['version'])) {
	echo 'Version: '.phpversion();
}
else {
	$value = getClubes();
}

//return JSON array
exit(json_encode($value));
?>
