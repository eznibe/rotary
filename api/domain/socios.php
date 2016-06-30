<?php

function getSocios() {

	$query = "SELECT * FROM socios s ORDER BY apellido, nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getSociosConAccionesPendientes() {

	$query = "SELECT a.id, a.accion, coalesce(a.nombre, s.nombre, '') as nombre, coalesce(a.apellido, s.apellido, '') as apellido,
									 c.nombre as club, a.mes, DATE_FORMAT(a.fecha,'%d-%m-%Y') as fecha, coalesce(a.categoria, s.categoria, '') as categoria,
									 coalesce(a.clasificacion, s.clasificacion, '') as clasificacion, coalesce(a.contacto, s.contacto, '') as contacto, coalesce(a.cargo, s.cargo, '') as cargo,
									 coalesce(concat(coalesce(us.apellido,''), ', ', us.nombre), u.usuario) as informante
						FROM socios_acciones a left join socios s on a.orden = s.orden left join clubes c on c.nrori = a.nrclub
								 left join usuarios u on u.id = a.usuario_id left join socios us on us.orden = u.nrori
						WHERE a.aceptado = false
						ORDER BY a.accion, c.nombre, s.apellido, s.nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getSociosBajaHistorial() {

	$query = "SELECT a.accion, coalesce(a.nombre, s.nombre, '') as nombre, coalesce(a.apellido, s.apellido, '') as apellido, c.nombre as club, a.mes, DATE_FORMAT(a.fecha,'%d-%m-%Y') as fecha, a.motivo,
									 coalesce(a.categoria, s.categoria, '') as categoria, coalesce(a.clasificacion, s.clasificacion, '') as clasificacion,
									 coalesce(a.contacto, s.contacto, '') as contacto, a.cargo, coalesce(concat(coalesce(us.apellido,''), ', ', us.nombre), u.usuario) as informante
						FROM socios_acciones a left join socios s on a.orden = s.orden left join clubes c on c.nrori = a.nrclub
								 left join usuarios u on u.id = a.usuario_id left join socios us on us.orden = u.nrori
						WHERE a.aceptado = true and a.accion = 'BAJA'
						ORDER BY s.apellido, s.nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}


function accionSocio($socio, $accion) {

	$obj->successful = true;
	$obj->method = 'altaSocio';

	$nrori = isset($accion->nrori) && trim($accion->nrori)!='' ? $accion->nrori : 'null' ;

	$query = "INSERT INTO socios_acciones (accion, mes, nombre, apellido, clasificacion, cargo, categoria, contacto, orden, nrori, nrclub, motivo, usuario_id)
						VALUES ('$accion', '".$socio->mes."', '".$socio->nombre."', '".$socio->apellido."', '".$socio->clasificacion."',
						'".$socio->cargo."', '".$socio->categoria."', '".$socio->contacto."', ".$socio->orden.",
						".$nrori.", ".$socio->nrclub.", '".$socio->motivo."', ".$socio->usuario_id.")";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function bajaSocio($socio) {

	$obj->successful = true;
	$obj->method = 'bajaSocio';

	$nrori = isset($accion->nrori) && trim($accion->nrori)!='' ? $accion->nrori : 'null' ;

	$query = "INSERT INTO socios_acciones (accion, mes, nombre, apellido, clasificacion, cargo, categoria, contacto, orden, nrori, nrclub, motivo, usuario_id)
						VALUES ('BAJA', '".$socio->mes."', '".$socio->nombre."', '".$socio->apellido."', '".$socio->clasificacion."',
						'".$socio->cargo."', '".$socio->categoria."', '".$socio->contacto."', ".$socio->orden.",
						".$nrori.", ".$socio->nrclub.", '".$socio->motivo."', ".$socio->usuario_id.")";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}


function aceptarAccion($accion) {

	$obj->successful = true;
	$obj->method = 'aceptarAccion';

	$update = "UPDATE socios_acciones SET aceptado = true WHERE id = ".$accion->id;
	if(!mysql_query($update)) {
		$obj->successful = false;
		$obj->update = $update;
	}

	if ($obj->successful) {
		$query = "SELECT * FROM socios_acciones WHERE id = ".$accion->id;
		$result = mysql_query($query);
		$ares = fetch_array($result);

		if ($ares[0]['accion']=='ALTA') {

			// generate new orden nr
			$noquery = "SELECT max(orden) as maxorden FROM socios";
			$result = mysql_query($noquery);
			$maxorden = fetch_array($result);

			$query = "INSERT INTO socios (orden, nombre, apellido, clasificacion, cargo, categoria, contacto, nrclub)
			VALUES (".($maxorden[0]['maxorden'] + 1).", '".$ares[0]['nombre']."', '".$ares[0]['apellido']."', '".$ares[0]['clasificacion']."', '".$ares[0]['cargo']."',
							'".$ares[0]['categoria']."', '".$ares[0]['contacto']."', ".$ares[0]['nrclub'].")";
			// $query='ALTA';
		} else if ($ares[0]['accion']=='MODIFICACION'){
			$query = "UPDATE socios SET nombre = '".$ares[0]['nombre']."', apellido = '".$ares[0]['apellido']."',
							clasificacion = '".$ares[0]['clasificacion']."', cargo = '".$ares[0]['cargo']."', categoria = '".$ares[0]['categoria']."', contacto = '".$ares[0]['contacto']."'
							WHERE orden = ".$ares[0]['orden'];

		} else if ($ares[0]['accion']=='BAJA') {
			$query = "DELETE FROM socios WHERE orden = ".$ares[0]['orden'];
		}

		if(!mysql_query($query)) {
			$obj->successful = false;
			$obj->query = $query;
		}
		$obj->query = $query;
	}

	return $obj;
}


function deleteOneDesignCloth($odId) {

	$obj->successful = true;

	$query = "DELETE FROM onedesign WHERE id = '$odId'";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}


?>
