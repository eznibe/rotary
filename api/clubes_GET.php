<?php

// Get list of all users or one in particular if the id is given

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

include_once 'domain/clubes.php';

db_connect();


if(isset($_GET['id'])) {
	$value = getBoat($_GET['id']);
}
else if(isset($_GET['onedesign'])) {
	$value = getOneDesignBoats($_GET['onedesign']);
}
else {
	$value = getClubes();
}

//return JSON array
exit(json_encode($value));
?>
