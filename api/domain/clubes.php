<?php

function getClubes() {

	$query = "SELECT * FROM clubes c ORDER BY nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getClub($nro) {

	$query = "SELECT * FROM clubes c WHERE nrori = $nrori";

	$result = mysql_query($query);

	$arr = fetch_array($result);

	return $arr[0];
	// return $arr[0]['nombre'];
}

function clubAccion($club) {

	$obj->successful = true;
	$obj->method = 'clubAccion';


	if (!isset($club->nro) || $club->nro=='') {

		// generate new orden nr
		$noquery = "SELECT max(nro) as maxnro FROM clubes";
		$result = mysql_query($noquery);
		$maxnro = fetch_array($result);

		$query = "INSERT INTO clubes (nro, nrori, nombre, direccion, localidad, zona, dia, horario, aniversario, contacto, asistente)
		VALUES (".($maxnro[0]['maxnro'] + 1).", '".$club->nrori."', '".$club->nombre."', '".$club->direccion."', '".$club->localidad."',
						'".$club->zona."', '".$club->dia."', '".$club->horario."', '".$club->aniversario."', '".$club->contacto."', '".$club->asistente."')";
		// $query='ALTA';
	} else {
		$query = "UPDATE clubes SET nombre = '".$club->nombre."', nrori = '".$club->nrori."',
						direccion = '".$club->direccion."', localidad = '".$club->localidad."', zona = '".$club->zona."', dia = '".$club->dia."',
						horario = '".$club->horario."', aniversario = '".$club->aniversario."', contacto = '".$club->contacto."', asistente = '".$club->asistente."'
						WHERE nro = ".$club->nro;
	}

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}
	$obj->query = $query;

	return $obj;
}

?>
