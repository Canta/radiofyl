<?php
	
	require_once(dirname(__FILE__)."/../class/servidor.ajaxapi.php");
	session_start();
	
	$return = array();
	$usuario = (isset($_SESSION["usuario"])) ? $_SESSION["usuario"] : new UsuarioController(UsuarioController::ID_USUARIO_ANONIMO);
	
	//$servidores = ServidorAjax::get_offline_by_id_usuario($usuario->get("id"));
	//Quito el método estático porque muchos hostings no tienen PHP 5.3, y entonces no tengo get_caller_class()
	
	$stmp = new ServidorAjax(1);
	$servidores = $stmp->get_offline_by_id_usuario($usuario->get("id"));
	
	$ret = "[";
	foreach ($servidores as $s){
		$ret .= $s->to_json() . ",";
	}
	$ret = substr($ret,0,strlen($ret)-1) . "]";
	
	echo($ret);
?>
