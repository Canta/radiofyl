<?php
	
	require_once(dirname(__FILE__)."/../class/util/conexion.class.php");
	require_once(dirname(__FILE__)."/../class/view/servidor.ajaxapi.php");
	require_once(dirname(__FILE__)."/../class/controller/usuariocontroller.class.php");
	require_once(dirname(__FILE__)."/../class/controller/formatostreamcontroller.class.php");
	session_start();
	
	$return = array();
	$usuario = (isset($_SESSION["usuario"])) ? $_SESSION["usuario"] : new UsuarioController(UsuarioController::ID_USUARIO_ANONIMO);
	
	$servidores = ServidorAjax::get_offline_by_id_usuario($usuario->get_id());
	
	$return = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<servers>\n";
	for ($i = 0; $i < count($servidores); $i++){
		$server = $servidores[$i]->to_array();
		$return .= "<server ";
		foreach ($server as $key=>$value){
			$return .= $key."=\"".$value."\" ";
		}
		$formato = new FormatoStreamController($server["idFormatoStream"]);
		$return .= "formato=\"".$formato->getCodec()."\" ";
		$return .= "/>\n";
	}
	$return .= "</servers>";
	
	echo($return);
?>
