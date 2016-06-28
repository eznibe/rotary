<?php

// Get list of all users or one in particular if the id is given

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

include_once 'domain/socios.php';

db_connect();



if(isset($_GET['id'])) {
	$value = getBoat($_GET['id']);
}
else if(isset($_GET['pendientes'])) {
	$value = getSociosConAccionesPendientes();
}
else if(isset($_GET['historial'])) {
	$value = getSociosBajaHistorial();
}
else {
	$value = getSocios();
}

//return JSON array
exit(json_encode($value));
?>
