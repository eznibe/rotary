<?php

include_once 'domain/mails.php';

function getAsistencias($aceptadas) {

	$query = "SELECT a.*, coalesce(c.nombre,cb.nombre) as club, DATE_FORMAT(a.fecha,'%d-%m-%Y') as fecha, coalesce(coalesce(concat(coalesce(s.apellido,''), ', ', s.nombre), u.usuario),'-') as informante, if(cast(mes as UNSIGNED) > 6, periodo, periodo + 1) as anio
						FROM asistencias a
						left join clubes c on c.nro = a.nrclub
						left join clubes_borrados cb on cb.nro = a.nrclub
						left join usuarios u on u.id = a.usuario_id
						left join socios s on s.orden = u.nrori
						WHERE a.aceptado = $aceptadas
						ORDER BY anio desc, a.mes desc,
										--  date(a.fecha) desc,
										 c.nombre";

	$result = mysql_query($query);

	return fetch_array($result);
}

function aceptarAccion($accion) {

	$obj->successful = true;
	$obj->method = 'aceptarAccion';

	$query = "UPDATE asistencias SET aceptado = true, fecha_aceptado = now() WHERE id = ".$accion->id;
	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}


function formAsistencias($asistencias) {

	$obj->successful = true;
	$obj->method = 'formAsistencias';

	$query = "INSERT INTO asistencias (nrclub, mes, periodo, total_reuniones, promedio_asist, reuniones_completas, total_socios, usuario_id, fecha)
						VALUES (".$asistencias->nrclub.", '".$asistencias->mes."', '".$asistencias->periodo."', ".($asistencias->total_reuniones?$asistencias->total_reuniones:0).",
						".($asistencias->promedio_asist?$asistencias->promedio_asist:0).", ".($asistencias->reuniones_completas?$asistencias->reuniones_completas:0).", ".($asistencias->total_socios?$asistencias->total_socios:0)."
						, ".$asistencias->usuario_id.", now())";

	if(!mysql_query($query)) {
		$obj->successful = false;
		$obj->query = $query;
	}

	return $obj;
}



?>
