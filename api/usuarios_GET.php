<?php

// Get list of all users or one in particular if the id is given

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

include_once 'domain/socios.php';
include_once 'domain/usuarios.php';

db_connect();



if(isset($_GET['id'])) {
	$value = getUsuario($_GET['id']);
}
else if(isset($_GET['pendientes'])) {
	$value = getSociosConAccionesPendientes();
}
else if(isset($_GET['hash'])) {
	$value = getUsuarioConHash($_GET['hash']);
}
else {
	$value = getSocios();
}

//return JSON array
exit(json_encode($value));
?>
