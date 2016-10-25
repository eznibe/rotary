<?php

// Get list of all users or one in particular if the id is given

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

include_once 'domain/socios.php';

db_connect();


if(isset($_GET['pendientes'])) {
	$value = getSociosConAccionesPendientes();
}
else if(isset($_GET['historial'])) {
	$value = getSociosBajaHistorial();
}
else if(isset($_GET['test'])) {
	$value = 'TEST';
}
else if(isset($_GET['orden'])) {
	$value = getSocio($_GET['orden']);
}
else if(isset($_GET['byUsuario'])) {
	$value = getSocioByUsuario($_GET['usuario_id']);
}
else {
	$value = getSocios($_GET['nrclub'], $_GET['orderBy']);
}

//return JSON array
exit(json_encode($value));
?>
