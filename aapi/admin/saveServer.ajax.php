<?php
	
	require_once(dirname(__FILE__)."/../../class/util/conexion.class.php");
	require_once(dirname(__FILE__)."/../../class/controller/servidorcontroller.class.php");
	require_once(dirname(__FILE__)."/../../class/controller/usuariocontroller.class.php");
	session_start();
	
	$return = array();
	
	if (!isset($_SESSION["usuario"])){
		$return = array("error" => "Debe registrarse en el sistema.");
		die(json_encode($return));
	}
	$usuario = $_SESSION["usuario"];
	
	if (isset($_REQUEST["idServidor"])){
		$server = ServidorController::from_array($_REQUEST);
		$idPermiso = ($_REQUEST["idServidor"] == "0") ? ServidorController::PERMISO_AGREGAR_SERVIDOR : ServidorController::PERMISO_MODIFICAR_SERVIDOR;
		if ($usuario->puede($idPermiso)){
			$server ->save();
			$return[] = $server->to_array();
		} else {
			$return = array("error" => "Acceso denegado.");
		}
	} else {
		$return = array("error" => "Faltan datos");
	}
	
	echo(json_encode($return));
?>
