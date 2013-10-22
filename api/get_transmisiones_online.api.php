<?php
require_once("../class/transmision.class.php");

/** 
 * get_transmisiones_online
 * Verbo del API para obtener las transmisiones online en el sistema
 *
 * @author Daniel Cantarín <omega_canta@yahoo.com>
 */
class get_transmisiones_online extends API{
	
	public function do_your_stuff($arr){
		@session_start();
		
		$ret = array();
		
		$u = Usuario::get_usuario_activo();
		$c = Config::get_field("anon_sees_all_transmisions");
		$c = isset($c["field_value"]) ? $c["field_value"] : "";
		
		if ($u->puede("UI_VER_TRANSMISIONES") || $c == '1'){
			$obj_transmision = new Transmision();
			$transmisiones = $obj_transmision->search(Array("fin = 0"));
			
			$ret = "[";
			foreach ($transmisiones as $t){
				$ret .= $t->to_json(false) . ",";
			}
			$ret = substr($ret,0,strlen($ret)-1) . "]";
			
			$this->data["response"]->data["transmisiones"] = $ret;
			
			return $this->data["response"];
		} else {
			return APIResponse::fail("Acceso denegado.");
		}
	}
	
}

?>
