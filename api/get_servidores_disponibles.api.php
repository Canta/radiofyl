<?php
require_once("../class/servidor.class.php");


/** 
 * get_servidores_disponibles
 * Verbo del API para obtener la lista de servidores disponibles
 *
 * @author Daniel Cantarín <omega_canta@yahoo.com>
 */
class get_servidores_disponibles extends API{
	
	public function do_your_stuff($arr){
		@session_start();
		
		$ret = Array();
		$u = Usuario::get_usuario_activo();
		
		//$servidores = ServidorAjax::get_offline_by_id_usuario($usuario->get("id"));
		//Quito el método estático porque muchos hostings no tienen PHP 5.3, y entonces no tengo get_caller_class()
		
		$stmp = new Servidor(1);
		$servidores = $stmp->get_offline_by_id_usuario($usuario->get("id"));
		
		$ret = "[";
		foreach ($servidores as $s){
			$ret .= $s->to_json() . ",";
		}
		$ret = substr($ret,0,strlen($ret)-1) . "]";
		
		$this->data["response"]->data["servidores"] = $ret;
		return $this->data["response"];
	}
	
}

?>
