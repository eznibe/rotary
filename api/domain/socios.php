<?php

function getSocios() {

	$query = "SELECT * FROM socios s ORDER BY apellido, nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getSociosConAccionesPendientes() {

	$query = "SELECT a.accion, s.nombre, s.apellido, c.nombre as club, a.mes, DATE_FORMAT(a.fecha,'%d-%m-%Y') as fecha, a.categoria, a.clasificacion, a.contacto, a.cargo
						FROM socios_acciones a left join socios s on a.orden = s.orden left join clubes c on c.nrori = a.nrclub
						WHERE a.aceptado = false
						ORDER BY s.apellido, s.nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getSociosBajaHistorial() {

	$query = "SELECT a.accion, s.nombre, s.apellido, c.nombre as club, a.mes, DATE_FORMAT(a.fecha,'%d-%m-%Y') as fecha, a.motivo, s.categoria, s.clasificacion, s.contacto, s.cargo
						FROM socios_acciones a left join socios s on a.orden = s.orden left join clubes c on c.nrori = a.nrclub
						WHERE a.aceptado = true and a.accion = 'BAJA'
						ORDER BY s.apellido, s.nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}


function accionSocio($socio, $accion) {

	$obj->successful = true;
	$obj->method = 'altaSocio';

	$query = "INSERT INTO socios_acciones (accion, mes, nombre, apellido, clasificacion, cargo, categoria, contacto, orden, nrori, nrclub, motivo)
						VALUES ('$accion', '".$socio->mes."', '".$socio->nombre."', '".$socio->apellido."', '".$socio->clasificacion."',
						'".$socio->cargo."', '".$socio->categoria."', '".$socio->contacto."', ".$socio->orden.",
						".$socio->nrori.", ".$socio->nrclub.", '".$socio->motivo."')";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function bajaSocio($socio) {

	$obj->successful = true;
	$obj->method = 'bajaSocio';

	$query = "INSERT INTO socios_acciones (accion, mes, orden, nrori, nrclub, motivo)
						VALUES ('BAJA', '".$socio->mes."', ".$socio->orden.", ".$socio->nrori.", ".$socio->nrclub.", '".$socio->motivo."')";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}

function updateBoatName($boat) {

	$obj->successful = true;

	if(!isset($boat->boat) || $boat->boat=="") {

		$obj->successful = false;
		$obj->oldName = $boat->oldName;
		return $obj;
	}

	$query = "UPDATE onedesign SET boat = '".$boat->boat."' WHERE boat = '".$boat->oldName."'";
	if(!mysql_query($query)) {
		$obj->successful = false;
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
