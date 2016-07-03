<?php

// Get list of all users or one in particular if the id is given

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

include_once 'domain/clubes.php';

db_connect();


if(isset($_GET['nrori'])) {
	$value = getClub($_GET['nrori']);
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
