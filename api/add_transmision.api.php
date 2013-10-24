<?php
require_once(dirname(__FILE__)."/../class/transmision.class.php");

/** 
 * add_transmision
 * Verbo del API para agregar transmisiones
 *
 * @author Daniel Cantarín <omega_canta@yahoo.com>
 */
class add_transmision extends API{
	
	public function do_your_stuff($arr){
		@session_start();
		$user = Usuario::get_usuario_activo();
		
		$ret = Array();
		if ($user->puede("ADMIN_ADD_TRANSMISION")){
			$_REQUEST["id_usuario"] = $user->get("id");
			
			//limpio un par de campos sensibles
			$_REQUEST["nombre"] = str_replace("'","&quot;",(isset($_REQUEST["nombre"]) ? $_REQUEST["nombre"] : ""));
			$_REQUEST["descripcion"] = str_replace("'","&quot;",(isset($_REQUEST["descripcion"]) ? $_REQUEST["descripcion"] : ""));
			
			$abm = new ABM("transmision");
			$abm->load_fields_from_array($_REQUEST);
			$abm->save();
			
			$tmpok = true;
			$msgs = $abm->get_mensajes();
			foreach ($msgs as $msg){
				if ($msg->isError()){
					$tmpok = false;
					echo(var_dump($msg->getMensaje()));
				}
			}
			
			
			$c = Conexion::get_instance();
			$upd = $c->execute("update transmision set fin = 0 where id = ".$abm->get("id"));
			$t = new Transmision($abm->get("id"));
			
			$this->data["response"]->data["message"] = "La transmisión fue registrada.";
			$this->data["response"]->data["hash"] = $t->get("hash");
			if (isset($_REQUEST["id_servidor"])){
				$_REQUEST["id_servidor"] = (is_array($_REQUEST["id_servidor"])) ? $_REQUEST["id_servidor"] : Array($_REQUEST["id_servidor"]);
				for ($i = 0; $i < count($_REQUEST["id_servidor"]); $i++ ){
					$ins = $c->execute("insert into servidor_x_transmision (id_servidor, id_transmision) values('".mysql_escape_string($_REQUEST["id_servidor"][$i])."','".$t->get("id")."')");
				}
			}
		} else {
			return APIResponse::fail("Permiso denegado.");
		}
		
		//echo(json_encode($ret));
		return $this->data["response"];
	}
	
}

?>

