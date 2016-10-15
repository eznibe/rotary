<?php

include_once 'include/headers.php';
include_once 'include/dbutils.php';
include_once 'include/main.php';

include_once 'domain/mails.php';

db_connect();



if($_SERVER['REQUEST_METHOD'] == 'POST') {

	$request_payload = file_get_contents('php://input');

	//var_dump($request_payload);

	$json = json_decode($request_payload);

	$value = enviarFormularioIngresado($json);


	//return JSON array
	exit(json_encode($value));
}
?>
