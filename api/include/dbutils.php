<?php

function db_connect()
{
 $db = mysql_pconnect("localhost", "root", "");
 mysql_set_charset('utf8', $db);
 if (!$db)
 {
  echo "Error: No es posible conectar al motor de base de datos." . mysql_error();
  exit;
 }
 if ( !mysql_select_db("rotary") )
 {
  echo "Error: No es posible seleccionar la base de datos." . mysql_error();
  exit;
 }
}


?>
