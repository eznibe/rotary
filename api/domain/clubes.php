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

function getClubesConAccionesPendientes() {

	$query = "SELECT a.*, DATE_FORMAT(a.fechaoriginal,'%d-%m-%Y') as fecha, coalesce(concat(coalesce(s.apellido,''), ', ', s.nombre), u.responsable) as informante
						FROM clubes_acciones a left join clubes c on a.nro = c.nro left join usuarios u on u.id = a.usuario_id left join socios s on s.orden = u.nrori
						WHERE a.aceptado = false
						ORDER BY c.nombre, s.apellido, s.nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}



function clubAccion($club) {

	$obj->successful = true;
	$obj->method = 'clubAccion';

	// obtiene max nro en clubes actuales
	$noquery = "SELECT max(nro) as maxnro FROM clubes";
	$result = mysql_query($noquery);
	$maxnro = fetch_array($result);

	if (!isset($club->nro) || $club->nro=='') {

		$query = "INSERT INTO clubes (nro, nrori, nombre, direccion, localidad, zona, dia, horario, aniversario, contacto, asistente)
		VALUES (".($maxnro[0]['maxnro'] + 1).", '".$club->nrori."', '".$club->nombre."', '".$club->direccion."', '".$club->localidad."',
						'".$club->zona."', '".$club->dia."', '".$club->horario."', '".$club->aniversario."', '".$club->contacto."', '".$club->asistente."')";
		// $query='ALTA';
		$obj->newnro = $maxnro[0]['maxnro'] + 1;
	} else {
		// incluir en acciones clubes (siempre es como modificaion)
		$nrori = isset($club->nrori) && trim($club->nrori)!='' ? $club->nrori : '' ;

		$query = "INSERT INTO clubes_acciones (nro, nrori, nombre, direccion, localidad, zona, dia, horario, aniversario, contacto, asistente, usuario_id, fechaoriginal)
							VALUES (".$club->nro.", '".$nrori."', '".$club->nombre."', '".$club->direccion."', '".$club->localidad."', '".$club->zona."', '".$club->dia."',
											'".$club->horario."', '".$club->aniversario."', '".$club->contacto."', '".$club->asistente."', ".$club->usuario_id.", now())";
	}

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	} else {
		$query = "SELECT id FROM clubes_acciones ORDER BY id desc limit 1";
		$result = mysql_query($query);
		$arr = fetch_array($result);
		$obj->id = $arr[0]['id'];

		if (isset($club->isAdmin) && $club->isAdmin) {
			// autoaceptar accion si es admin
			$accion = new stdClass();
			$accion->id = $obj->id;
			clubAceptarAccion($accion);
		}
	}
	$obj->query = $query;

	return $obj;
}

function clubAceptarAccion($accion) {

	$obj->successful = true;
	$obj->method = 'clubAceptarAccion';

	$update = "UPDATE clubes_acciones SET aceptado = true WHERE id = ".$accion->id;
	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	if ($obj->successful) {
		$query = "SELECT * FROM clubes_acciones WHERE id = ".$accion->id;
		$result = mysql_query($query);
		$ares = fetch_array($result);

		$query = "UPDATE clubes SET nombre = '".$ares[0]['nombre']."', nrori = '".$ares[0]['nrori']."',
								direccion = '".$ares[0]['direccion']."', localidad = '".$ares[0]['localidad']."', zona = '".$ares[0]['zona']."', dia = '".$ares[0]['dia']."',
								horario = '".$ares[0]['horario']."', aniversario = '".$ares[0]['aniversario']."', contacto = '".$ares[0]['contacto']."', asistente = '".$ares[0]['asistente']."'
							WHERE nro = ".$ares[0]['nro'];


		if(!mysql_query($query)) {
			$obj->successful = false;
			$obj->query = $query;
		}
		$obj->query = $query;
	}

	return $obj;
}

?>
