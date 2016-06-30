<?php

function getUsuarios($login) {

	$query = "SELECT u.id, u.usuario, u.nivel, s.nombre, s.apellido, s.cargo, s.orden, c.nombre as club, c.nrori as nrclub
						FROM usuarios u left join socios s ON u.nrori = s.orden LEFT JOIN clubes c on c.nrori = u.nrclub
						WHERE (usuario = '".$login->usuario."' AND password = '".$login->password."')
							OR (usuario = '".$login->usuario2."' AND password = '".$login->password2."')";

	$result = mysql_query($query);

	return fetch_array($result);
}



function modificacionUsuario($usuario) {

	$obj->successful = true;
	$obj->method = 'modificacionUsuario';

	$query = "UPDATE usuarios SET usuario = '".$usuario->usuario."' , password = '".$usuario->password."' WHERE id = ".$usuario->id;

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
