<?php

// Get list of all users or one in particular if the id is given

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

include_once 'domain/asistencias.php';

db_connect();



if(isset($_GET['id'])) {
	$value = getBoat($_GET['id']);
}
else if(isset($_GET['aceptadas'])) {
	$value = getAsistencias($_GET['aceptadas']);
}
else {
	$value = getAsistencias();
}

//return JSON array
exit(json_encode($value));
?>
