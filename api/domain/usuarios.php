<?php

function getUsuarios($login) {

	$query = "SELECT u.id, u.usuario, u.nivel, s.nombre, s.apellido, s.cargo, s.orden, c.nombre as club, c.nro as nrclub
						FROM usuarios u left join socios s ON u.nrori = s.orden LEFT JOIN clubes c on c.nro = u.nrclub
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

function nuevoUsuario($usuario) {

	$obj->successful = true;
	$obj->method = 'nuevoUsuario';

	$query = "INSERT INTO usuarios (nrori, nrclub, usuario, password, nivel) VALUES (".$usuario->nrori.", ".$usuario->nrclub.", '".$usuario->usuario."', '".$usuario->password."', 1)";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}





?>
