<?php
require_once("../class/api.class.php");

/** 
 * check_login_status
 * Verbo del API para mantener actualizada la UI del lado del usuario.
 *
 * @author Daniel Cantarín <omega_canta@yahoo.com>
 */
class check_login_status extends API{
	
	public function do_your_stuff($arr){
		require_once("../class/usuario.class.php");
		
		if (!isset($_SESSION)){
			session_start();
		}
		if (!isset($_SESSION["user"]) || !($_SESSION["user"] instanceof Usuario)){
			return APIResponse::fail("Sesión expirada o no iniciada.");
		}
		
		return $this->data["response"];
	}
	
}

?>
