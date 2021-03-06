<?php

include_once 'domain/mails.php';

function getSocios($nrclub, $orderBy) {

	$condition = "";
	if (isset($nrclub) && $nrclub == '-') {
		$condition = "";
	}	else if (isset($nrclub) && $nrclub != '0') {
		$condition = " AND c.nro = ".$nrclub;
	}

	$order = "";
	if (isset($orderBy)) {
		$order = "$orderBy , ";
	}

	$query = "SELECT s.*, c.nombre as club, u.id as usuario_id FROM socios s join clubes c on c.nro = s.nrclub left join usuarios u on u.nrori = s.orden
						WHERE 1=1 $condition
						ORDER BY $order apellido, nombre";

	$result = mysql_query($query);

	return fetch_array($result);
	// return $obj->query = $query;
}

function getSocio($orden) {

	$query = "SELECT s.*, c.nombre as club, u.id as usuario_id, u.usuario, u.nivel
					FROM socios s join clubes c on c.nro = s.nrclub left join usuarios u on u.nrori = s.orden
					WHERE 1=1 AND s.orden = $orden";

	$result = mysql_query($query);

	$rows = fetch_array($result);

	return $rows[0];
}

function getSocioByUsuario($usuario_id) {

	$query = "SELECT s.*, coalesce(s.contacto, sa.contacto) as contacto, u.*, u.id as usuario_id
					FROM usuarios u left join socios s on u.nrori = s.orden left join socios_acciones sa on (sa.orden = s.orden and sa.aceptado = false)
					WHERE 1=1 AND u.id = $usuario_id";

	$result = mysql_query($query);

	$rows = fetch_array($result);

	return $rows[0];
}

function getSociosConAccionesPendientes() {

	$query = "SELECT a.id, a.accion, coalesce(a.nombre, s.nombre, '') as nombre, coalesce(a.apellido, s.apellido, '') as apellido,
									 c.nombre as club, a.mes, a.periodo, DATE_FORMAT(a.fecha,'%d-%m-%Y') as fecha, coalesce(a.categoria, s.categoria, '') as categoria,
									 coalesce(a.clasificacion, s.clasificacion, '') as clasificacion, coalesce(a.contacto, s.contacto, '') as contacto, coalesce(a.cargo, s.cargo, '') as cargo,
									 coalesce(concat(coalesce(us.apellido,''), ', ', us.nombre), u.usuario) as informante, a.motivo
						FROM socios_acciones a left join socios s on a.orden = s.orden left join clubes c on c.nro = a.nrclub
								 left join usuarios u on u.id = a.usuario_id left join socios us on us.orden = u.nrori
						WHERE a.aceptado = false
						ORDER BY a.accion, c.nombre, a.periodo, s.apellido, s.nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}

function getSociosHistorial($tipo) {

	$query = "SELECT a.accion, coalesce(a.nombre, s.nombre, '') as nombre, coalesce(a.apellido, s.apellido, '') as apellido, c.nombre as club, a.mes, a.periodo, DATE_FORMAT(a.fecha,'%d-%m-%Y') as fecha, a.motivo,
									 coalesce(a.categoria, s.categoria, '') as categoria, coalesce(a.clasificacion, s.clasificacion, '') as clasificacion,
									 coalesce(a.contacto, s.contacto, '') as contacto, a.cargo, coalesce(concat(coalesce(us.apellido,''), ', ', us.nombre), u.usuario) as informante, if(cast(mes as UNSIGNED) > 6, periodo, periodo + 1) as anio
						FROM socios_acciones a left join socios s on a.orden = s.orden left join clubes c on c.nro = a.nrclub
								 left join usuarios u on u.id = a.usuario_id left join socios us on us.orden = u.nrori
						WHERE a.aceptado = true and a.accion = '$tipo'
						ORDER BY anio desc, a.mes desc, c.nombre, s.apellido, s.nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}


function accionSocio($socio, $accion) {

	$obj->successful = true;
	$obj->method = 'accionSocio';

	$nrori = isset($socio->nrori) && trim($socio->nrori)!='' ? $socio->nrori : '' ;

	$query = "INSERT INTO socios_acciones (accion, mes, periodo, nombre, apellido, clasificacion, cargo, categoria, contacto, orden, nrori, nrclub, motivo, usuario_id, fechaoriginal)
						VALUES ('$accion', '".$socio->mes."', ".$socio->periodo.", '".$socio->nombre."', '".$socio->apellido."', '".$socio->clasificacion."',
						'".$socio->cargo."', '".$socio->categoria."', '".$socio->contacto."', ".$socio->orden.",
						'".$nrori."', ".$socio->nrclub.", '".$socio->motivo."', ".$socio->usuario_id.", now())";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	} else {
		$query = "SELECT id FROM socios_acciones ORDER BY id desc limit 1";
		$result = mysql_query($query);
		$arr = fetch_array($result);
		$obj->id = $arr[0]['id'];
	}
	$obj->query = $query;

	return $obj;
}

function bajaSocio($socio) {

	$obj->successful = true;
	$obj->method = 'bajaSocio';

	$nrori = isset($socio->nrori) && trim($socio->nrori)!='' ? $socio->nrori : '' ;

	$query = "INSERT INTO socios_acciones (accion, mes, periodo, nombre, apellido, clasificacion, cargo, categoria, contacto, orden, nrori, nrclub, motivo, usuario_id, fechaoriginal)
						VALUES ('BAJA', '".$socio->mes."', ".$socio->periodo.", '".$socio->nombre."', '".$socio->apellido."', '".$socio->clasificacion."',
						'".$socio->cargo."', '".$socio->categoria."', '".$socio->contacto."', ".$socio->orden.",
						'".$nrori."', ".$socio->nrclub.", '".$socio->motivo."', ".$socio->usuario_id.", now())";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	} else {
		$query = "SELECT id FROM socios_acciones ORDER BY id desc limit 1";
		$result = mysql_query($query);
		$arr = fetch_array($result);
		$obj->id = $arr[0]['id'];
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

		$nrori = isset($ares[0]['nrori']) && trim($ares[0]['nrori'])!='' ? $ares[0]['nrori'] : '' ;

		if ($ares[0]['accion']=='ALTA') {

			// generate new orden nr
			$noquery = "SELECT max(orden) as maxorden FROM socios";
			$result = mysql_query($noquery);
			$maxorden = fetch_array($result);

			$query = "INSERT INTO socios (orden, nombre, apellido, clasificacion, cargo, categoria, contacto, nrori, nrclub)
			VALUES (".($maxorden[0]['maxorden'] + 1).", '".$ares[0]['nombre']."', '".$ares[0]['apellido']."', '".$ares[0]['clasificacion']."', '".$ares[0]['cargo']."',
							'".$ares[0]['categoria']."', '".$ares[0]['contacto']."', '".$nrori."', ".$ares[0]['nrclub'].")";
			// $query='ALTA';
		} else if ($ares[0]['accion']=='MODIFICACION'){
			$query = "UPDATE socios SET nombre = '".$ares[0]['nombre']."', apellido = '".$ares[0]['apellido']."', nrori = '".$nrori."', nrclub = ".$ares[0]['nrclub'].",
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

?>
