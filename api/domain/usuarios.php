<?php

function getUsuarios($login) {

	$query = "SELECT u.id, u.usuario, u.nivel, s.nombre, s.apellido, s.cargo, s.orden, c.nombre as club, c.nro as nrclub
						FROM usuarios u left join socios s ON u.nrori = s.orden LEFT JOIN clubes c on c.nro = u.nrclub
						WHERE (usuario = '".$login->usuario."' AND password = '".$login->password."')
							OR (usuario = '".$login->usuario2."' AND password = '".$login->password2."')";

	$result = mysql_query($query);

	$resultarray = fetch_array($result);

	// insert log of attempt
	$insert = "INSERT INTO log_logins (usuario, password, results) values ('".$login->usuario."', '".$login->password."', ".count($resultarray).")";

	if(!mysql_query($insert)) {
		$obj->successful = false;
		$obj->insert = $insert;
		// return $obj;
	}

	return $resultarray;
}



function modificacionUsuario($usuario) {

	$obj->successful = true;
	$obj->method = 'modificacionUsuario';

	$query = "UPDATE usuarios SET usuario = '".$usuario->usuario."' , password = '".$usuario->password."' WHERE id = ".$usuario->id;

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	} else {
		// actualizar estado de hash si se usó para restablecer clave
		if (isset($usuario->hash)) {
			$update = "UPDATE reset_claves SET usado = true WHERE id = '".$usuario->hash."'";

			if(!mysql_query($update)) {
				$obj->successful = false;
				$obj->query = $update;
			}

		} else {
			$obj->msg = 'Sin hash';
		}
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

// se fija si el nombre de usuario o email ingresado está linkeado a algun usuario y ese user tiene mail a donde mandarle
function restablecerPasswordCheck($usuario) {

	$obj->successful = true;
	$obj->method = 'restablecerPasswordCheck';

	// chequear que exista un usuario con nombre o email asignado igual a lo enviado
	$query = "SELECT s.orden, s.contacto FROM usuarios u JOIN socios s ON s.orden = u.nrori WHERE u.usuario = '". $usuario->value ."' OR s.contacto = '". $usuario->value ."'";

	$result = mysql_query($query);

	if(!$result) {
		$obj->successful = false;
		$obj->query = $query;
	} else {

		$rows = fetch_array($result);
		if (isset($usuario->value) && $usuario->value!='' && count($rows) > 0 && isset($rows[0]['contacto']) && $rows[0]['contacto']!='') {

			$obj->value = $usuario->value;
			// $obj->email = $rows[0]['contacto']; //remove
			$obj->orden = $rows[0]['orden'];

		} else {
			$obj->successful = false;
			$obj->message = 'Usuario o mail no encontrado';
		}
	}

	return $obj;
}

function enviarRestablecerPasswordMail($usuario) {

	$obj->successful = true;
	$obj->method = 'enviarRestablecerPasswordMail';

	// chequear que exista un usuario con nombre o email asignado igual a lo enviado
	$query = "SELECT * FROM socios s WHERE s.orden = ". $usuario->orden;

	$result = mysql_query($query);

	if(!$result) {
		$obj->successful = false;
		$obj->query = $query;
	} else {

		$rows = fetch_array($result);

		// enviar mail
		$obj->value = $usuario->value;
		// $obj->email = $rows[0]['contacto'];

		$hash = uniqid();

		// $to = "enbertran@gmail.com";
		$to =  $rows[0]['contacto'];

		$subject = "Restablecer contraseña";
		$message = '
							<html>
							<head>
							  <title>Restablecer contraseña</title>
							</head>
							<body>
							  <p>Estimado/a '.$rows[0]['nombre'] . ' ' . $rows[0]['apellido'] . ',</p>
							  <p>Haga click en el siguiente link para restablecer su contraseña en Rotary distrito 4905: http://www.rotary4905.com.ar/gestion/reset.html?hash='.$hash.'</p>
								<p>Muchas gracias.</p>
							</body>
							</html>
							';
		// $message = 'Estimado/a '.$rows[0]['nombre'] . ' ' . $rows[0]['apellido'] . ','.
		// 				'<p> Haga click en el siguiente link para restablecer su contraseña en Rotary 4905: http://rotary4905.com.ar/gestion?hash=13abc </p> <br> Muchas gracias.';

		$headers  = 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
		$headers .= "From: Rotary distrito 4905 <rotary@rotary4905.com.ar>" . "\r\n";
		$headers .= 'Bcc: enbertran@gmail.com' . "\r\n";

		if(!mail($to, $subject, $message, $headers)) {
			$obj->message = 'Error mandando mail';
			$obj->successful = false;
		} else {
			$obj->message = 'Mandó mail';

			// guardar hash para restaurar clave luego
			$insert = "INSERT INTO reset_claves (id, orden, fechacreado) VALUES ('".$hash."', ".$rows[0]['orden'].", now())";

			if (!mysql_query($insert)) {
				$obj->successful = false;
				$obj->insert = $insert;
			}
		}
	}

	return $obj;
}


function getUsuarioConHash($hash) {

	$obj->successful = true;
	$obj->method = 'getUsuarioConHash';

	$query = "SELECT r.id as hash, u.id, u.usuario, r.orden FROM reset_claves r JOIN usuarios u on u.nrori = r.orden WHERE r.usado = false AND r.id = '". $hash ."'";

	$result = mysql_query($query);

	if(!$result) {
		$obj->successful = false;
		$obj->query = $query;
	} else {

		$rows = fetch_array($result);

		if (count($rows) == 1) {
			$obj->result = $rows[0];
		} else {
			$obj->successful = false;
		}
	}

	return $obj;
}

?>
