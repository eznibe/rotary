<?php

function getAsistencias($aceptadas) {

	$query = "SELECT a.*, c.nombre as club, DATE_FORMAT(a.fecha,'%d-%m-%Y') as fecha
						FROM asistencias a left join clubes c on c.nrori = a.nrclub
						WHERE a.aceptado = $aceptadas
						ORDER BY c.nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}

function aceptarAccion($accion) {

	$obj->successful = true;
	$obj->method = 'aceptarAccion';

	$query = "UPDATE asistencias SET aceptado = true WHERE id = ".$accion->id;
	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}


function formAsistencias($asistencias) {

	$obj->successful = true;
	$obj->method = 'formAsistencias';

	$query = "INSERT INTO asistencias (nrclub, mes, periodo, total_reuniones, promedio_asist, reuniones_completas, total_socios)
						VALUES (".$asistencias->nrclub.", '".$asistencias->mes."', '".$asistencias->periodo."', ".($asistencias->total_reuniones?$asistencias->total_reuniones:0).",
						".($asistencias->promedio_asist?$asistencias->promedio_asist:0).", ".($asistencias->reuniones_completas?$asistencias->reuniones_completas:0).", ".($asistencias->total_socios?$asistencias->total_socios:0).")";

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
