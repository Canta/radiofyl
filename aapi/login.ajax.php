<?php
	session_start();
	require_once(dirname(__FILE__)."/../class/util/conexion.class.php");
	require_once(dirname(__FILE__)."/../class/view/usuario.ajaxapi.php");
	
	$return = array();
	
	$campos = array("username", "password");
	$valores = array(mysql_escape_string($_REQUEST["text_username"]), mysql_escape_string($_REQUEST["text_password"]));
	
	$usuarios = UsuarioAjax::search($campos, $valores);
	if (count($usuarios)>0){
		$_SESSION["usuario"] = $usuarios[0];
		$return = $usuarios[0];
	} else {
		$_SESSION["usuario"] = new UsuarioAjax(UsuarioAjax::ID_USUARIO_ANONIMO);
		$return = array("error" => "usuario o contraseña incorrectos");
	}
	
	echo(json_encode($return));
?>
