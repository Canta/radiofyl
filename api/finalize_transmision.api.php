<?php
require_once(dirname(__FILE__)."/../class/transmision.class.php");

/** 
 * logout
 * Verbo del API para desloguearse en el sistema
 *
 * @author Daniel Cantarín <omega_canta@yahoo.com>
 */
class finalize_transmission extends API{
	
	public function do_your_stuff($arr){
		@session_start();
		
		$user = Usuario::get_usuario_activo();
		
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
			} else {
				return APIResponse::fail("No se encontró la transmisión con ese hash.");
			}
			$this->data["response"]->data["message"] = "La transmisión fue finalizada con éxito.";
		} else {
			return APIResponse::fail("Permiso denegado");
		}
		
		
		return $this->data["response"];
	}
	
}

?>
