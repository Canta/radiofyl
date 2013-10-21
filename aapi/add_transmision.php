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
	if ($user->puede("ADMIN_ADD_TRANSMISION")){
		$_REQUEST["id_usuario"] = $user->get("id");
		
		//limpio un par de campos sensibles
		$_REQUEST["nombre"] = str_replace("'","&quot;",(isset($_REQUEST["nombre"]) ? $_REQUEST["nombre"] : ""));
		$_REQUEST["descripcion"] = str_replace("'","&quot;",(isset($_REQUEST["descripcion"]) ? $_REQUEST["descripcion"] : ""));
		
		$abm = new ABM("transmision");
		$abm->load_fields_from_array($_REQUEST);
		$abm->save();
		$c = Conexion::get_instance();
		$upd = $c->execute("update transmision set fin = 0 where id = ".$abm->get("id"));
		$t = new Transmision($abm->get("id"));
		$ret["status"] = "OK";
		$ret["message"] = "La transmisión fue registrada.";
		$ret["data"] = Array("hash"=>$t->get("hash"));
		if (isset($_REQUEST["id_servidor"])){
			$_REQUEST["id_servidor"] = (is_array($_REQUEST["id_servidor"])) ? $_REQUEST["id_servidor"] : Array($_REQUEST["id_servidor"]);
			for ($i = 0; $i < count($_REQUEST["id_servidor"]); $i++ ){
				$ins = $c->execute("insert into servidor_x_transmision (id_servidor, id_transmision) values('".mysql_escape_string($_REQUEST["id_servidor"][$i])."','".$t->get("id")."')");
			}
		}
	} else {
		$ret["status"] = "ERROR";
		$ret["message"] = "Permiso denegado.";
		$ret["data"] = Array();
	}
	
	echo(json_encode($ret));
?>
