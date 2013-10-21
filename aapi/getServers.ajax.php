<?php
	
	require_once(dirname(__FILE__)."/../class/util/conexion.class.php");
	require_once(dirname(__FILE__)."/../class/view/servidor.ajaxapi.php");
	require_once(dirname(__FILE__)."/../class/controller/usuariocontroller.class.php");
	session_start();
	
	$return = array();
	$usuario = (isset($_SESSION["usuario"])) ? $_SESSION["usuario"] : new UsuarioController(UsuarioController::ID_USUARIO_ANONIMO);
	
	$servidores = ServidorAjax::get_offline_by_id_usuario($usuario->get_id());
	
	for ($i = 0; $i < count($servidores); $i++){
		$return[] = $servidores[$i]->to_array();
	}
	
	echo(json_encode($return));
?>
