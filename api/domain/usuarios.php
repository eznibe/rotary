<?php

function getUsuarios($login) {

	$query = "SELECT u.id, u.usuario, u.nivel, s.nombre, s.apellido, s.cargo, s.orden, c.nombre as club, c.nrori as nrclub
						FROM usuarios u left join socios s ON u.nrori = s.orden LEFT JOIN clubes c on c.nrori = u.nrclub
						WHERE (usuario = '".$login->usuario."' AND password = '".$login->password."')
							OR (usuario = '".$login->usuario2."' AND password = '".$login->password2."')";

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
