<?php
	session_start();
	require_once(dirname(__FILE__)."/../class/util/conexion.class.php");
	require_once(dirname(__FILE__)."/../class/transmisionajax.class.php");
	
	$return = array();
	
	$obj_transmision = new TransmisionAjax();
	$transmisiones = $obj_transmision->search(Array("fin = 0"));
	
	$ret = "[";
	foreach ($transmisiones as $t){
		$ret .= $t->to_json() . ",";
	}
	$ret = substr($ret,0,strlen($ret)-1) . "]";
	
	echo($ret);
?>
