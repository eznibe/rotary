<?php

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

include_once 'domain/usuarios.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	if(isset($_GET['login'])) {
		$value = getUsuarios($json);
	}
	else if(isset($_GET['formPerfil'])) {
		$value = modificacionUsuario($json);
	}

	//return JSON array
	exit(json_encode($value));
}
?>
