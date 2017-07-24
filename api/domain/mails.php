<?php

function enviarFormularioIngresado($form) {

	$obj->successful = true;
	$obj->method = 'enviarFormularioIngresado';

	// chequear que exista un usuario con nombre o email asignado igual a lo enviado
	$query = "SELECT s.*, u.* FROM usuarios u LEFT JOIN socios s on u.nrori = s.orden WHERE u.id = ". $form->usuario_id;

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
		$to =  isset($rows[0]['mail']) && $rows[0]['mail']!='' ? $rows[0]['mail'] : $rows[0]['contacto'];

		$nombre = isset($rows[0]['responsable']) && $rows[0]['responsable']!=''
								? $rows[0]['responsable']
								: (isset($rows[0]['nombre']) && $rows[0]['nombre']!='' ? ($rows[0]['nombre'] . ' ' . $rows[0]['apellido']) : $rows[0]['usuario']);

    if (isset($to) && $to!='' && +$rows[0]['nivel'] != 5) { // dont' send mail if no user has no email address or is the admin doing a change

			$obj->nivel = $rows[0]['nivel'];

  		$subject = "Formulario enviado";
  		$message = '
  							<html>
  							<head>
  							  <title>Formulario enviado</title>
  							</head>
  							<body>
  							  <p>Estimado/a '.$nombre . ',</p>
  							  <p>El formulario de "' . $form->type . '" fue enviado con éxito. Verifique que no haya errores en los datos y de haberlos por favor comuníqueselo al administrador.</p>
                  <p>' . fillFormData($form) . '</p>
  								<p>Muchas gracias.</p>
  							</body>
  							</html>
  							';

  		$headers  = 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
  		$headers .= "From: Rotary distrito 4905 <rotary@rotary4905.com.ar>" . "\r\n";
  		$headers .= 'Bcc: enbertran@gmail.com' . "\r\n";

  		if(!mail($to, $subject, $message, $headers)) {
  			$obj->message = 'Error mandando mail';
  			$obj->successful = false;
  		} else {
  			$obj->message = $message;

				$orden = isset($rows[0]['orden']) ? $rows[0]['orden'] : 'null';

  			// guardar log de formulario enviado por mail
  			$insert = "INSERT INTO envio_mail_formularios (orden, form, fechacreado, usuarioid) VALUES (".$orden.", '". $form->type ."', now(), ".$rows[0]['id'].")";

  			if (!mysql_query($insert)) {
  				$obj->successful = false;
  				$obj->insert = $insert;
  			}
  		}
    } else {
      $obj->successful = false;
			$obj->nivel = $rows[0]['nivel'];
			$obj->to = $to;
    }
	}

	return $obj;
}

function fillFormData($form) {

  $html = "<ul>";

  // get extra data
  if (isset($form->nrclub)) {
    $clubquery = "SELECT * FROM clubes WHERE nro = ".$form->nrclub;
    $resultclub = mysql_query($clubquery);
    $clubrows = fetch_array($resultclub);
    $form->club = $clubrows[0]['nombre'];
  }
  if (isset($form->orden)) {
    $socioquery = "SELECT * FROM socios WHERE orden = ".$form->orden;
    $resultsocio = mysql_query($socioquery);
    $sociorows = fetch_array($resultsocio);
    $form->socio = $sociorows[0]['apellido'] . ', ' . $sociorows[0]['nombre'];
  }
  if (isset($form->mes)) {
         if ($form->mes == '01') {      $form->nombremes = 'Enero';    }
    else if ($form->mes == '02') {      $form->nombremes = 'Febrero';    }
    else if ($form->mes == '03') {      $form->nombremes = 'Marzo';    }
    else if ($form->mes == '04') {      $form->nombremes = 'Abril';    }
    else if ($form->mes == '05') {      $form->nombremes = 'Mayo';    }
    else if ($form->mes == '06') {      $form->nombremes = 'Junio';    }
    else if ($form->mes == '07') {      $form->nombremes = 'Julio';    }
    else if ($form->mes == '08') {      $form->nombremes = 'Agosto';    }
    else if ($form->mes == '09') {      $form->nombremes = 'Septiembre';    }
    else if ($form->mes == '10') {      $form->nombremes = 'Octubre';    }
    else if ($form->mes == '11') {      $form->nombremes = 'Noviembre';    }
    else if ($form->mes == '12') {      $form->nombremes = 'Diciembre';    }
  }



  // fill html
  if ($form->type == 'Asistencias') {

    $html .= "<li>Club que informa: ".  $form->club ."</li>";
    $html .= "<li>Mes que informa: ".  $form->nombremes ."</li>";
    $html .= "<li>Período: ".  $form->periodo ."</li>";
    $html .= "<li>Total de Reuniones del mes: ".  $form->total_reuniones ."</li>";
    $html .= "<li>Promedio de asistencia del mes: ". $form->promedio_asist ."</li>";
    $html .= "<li>Reuniones con el 100% de asistencia en el mes: ". $form->reuniones_completas ."</li>";
    $html .= "<li>Total de socios activos al finalizar el mes: ". $form->total_socios ."</li>";

  } else if ($form->type == 'MODIFICACION socio') {

    $html .= "<li>Club: ". $form->club ."</li>";
    $html .= "<li>Mes: ". $form->nombremes ."</li>";
    $html .= "<li>Período: ". $form->periodo ."</li>";
    $html .= "<li>Categoría de socio: ". $form->categoria ."</li>";
    $html .= "<li>Nombre: ". $form->nombre ."</li>";
    $html .= "<li>Apellido: ". $form->apellido ."</li>";
    $html .= "<li>Clasificación: ". $form->clasificacion ."</li>";
    $html .= "<li>E-mail: ". $form->contacto ."</li>";
    $html .= "<li>Nro RI: ". $form->nrori ."</li>";

  } else if ($form->type == 'ALTA socio') {

    $html .= "<li>Club: ". $form->club ."</li>";
    $html .= "<li>Mes: ". $form->nombremes ."</li>";
    $html .= "<li>Período: ". $form->periodo ."</li>";
    $html .= "<li>Categoría de socio: ". $form->categoria ."</li>";
    $html .= "<li>Nombre: ". $form->nombre ."</li>";
    $html .= "<li>Apellido: ". $form->apellido ."</li>";
    $html .= "<li>Clasificación: ". $form->clasificacion ."</li>";
    $html .= "<li>E-mail: ". $form->contacto ."</li>";
    $html .= "<li>Nro RI: ". $form->nrori ."</li>";

  } else if ($form->type == 'BAJA socio') {

    $html .= "<li>Club: ". $form->club ."</li>";
    $html .= "<li>Mes: ". $form->nombremes ."</li>";
    $html .= "<li>Período: ". $form->periodo ."</li>";
    $html .= "<li>Socio: ". $form->socio ."</li>";
    $html .= "<li>Motivo: ". $form->motivo ."</li>";

  } else if ($form->type == 'MODIFICACION club') {

    $html .= "<li>Nombre: ". $form->nombre ."</li>";
    $html .= "<li>Dirección: ". $form->direccion ."</li>";
    $html .= "<li>Localidad: ". $form->localidad ."</li>";
    $html .= "<li>Zona: ". $form->zona ."</li>";
    $html .= "<li>Día reunión: ". $form->dia ."</li>";
    $html .= "<li>Hora reunión: ". $form->horario ."</li>";
    $html .= "<li>Fecha aniversario: ". $form->aniversario ."</li>";
    $html .= "<li>Contacto: ". $form->contacto ."</li>";
    $html .= "<li>Asistente: ". $form->asistente ."</li>";
  }

  $html .= "</ul>";

  return $html;
}

?>
