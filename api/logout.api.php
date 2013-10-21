<?php
require_once("../class/api.class.php");

/** 
 * logout
 * Verbo del API para desloguearse en el sistema
 *
 * @author Daniel Cantarín <omega_canta@yahoo.com>
 */
class logout extends API{
	
	public function do_your_stuff($arr){
		@session_start();
		session_destroy();
		return $this->data["response"];
	}
	
}

?>
