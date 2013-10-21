<?php
	require_once(dirname(__FILE__)."/../class/usuariocontroller.class.php");
	require_once(dirname(__FILE__)."/../class/transmision.class.php");
	session_start();
	
	$user = null;
	if (!isset($_SESSION["usuario"])){
		$user = UsuarioController::login($_REQUEST);
	} else {
		$user = $_SESSION["usuario"];
	}
	
	$ret = Array();
	if ($user->puede("ADMIN_MODIFY_TRANSMISION")){
		$_REQUEST["id_usuario"] = $user->get("id");
		$hash = (isset($_REQUEST["hash"])) ? $_REQUEST["hash"] : "0";
		$abm = new ABM("transmision");
		$c = new Condicion(Condicion::TIPO_IGUAL, Condicion::ENTRE_CAMPO_Y_VALOR);
		$c->set_comparador($hash);
		$c->set_comparando("hash");
		$abm->load(Array($c));
		$abm->datos["fields"]["FIN"]->set_valor("0");
		$abm->set_operacion("modificacion");
		if ((int)$abm->get("id") > 0){
			$abm->save();
		}
		$ret["status"] = "OK";
		$ret["message"] = "La transmisión fue finalizada con éxito.";
	} else {
		$ret["status"] = "ERROR";
		$ret["message"] = "Permiso denegado.";
	}
	$ret["data"] = Array();
	
	echo(json_encode($ret));
?>
