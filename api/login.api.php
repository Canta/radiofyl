<?php
require_once("../class/api.class.php");

/** 
 * login
 * Verbo del API para loguearse en el sistema
 *
 * @author Daniel Cantarín <omega_canta@yahoo.com>
 */
class login extends API{
	
	public function do_your_stuff($arr){
		require_once("../class/usuario.class.php");
		
		if (!isset($arr["username"]) || !isset($arr["password"]) || trim($arr["username"]) == "" || $arr["password"] == "" ){
			return APIResponse::fail("Falta el nombre de usuario o el password. Login cancelado.");
		}
		
		try{
			Usuario::login($arr["username"], $arr["password"]);
		} catch(Exception $e){
			return APIResponse::fail("Error fatal tratando de ingresar al sistema. Por favor, contacte al administrador.");
		}
		
		if (!isset($_SESSION)){
			session_start();
		}
		if (!isset($_SESSION["usuario"]) || is_null($_SESSION["usuario"])){
			return APIResponse::fail("Usuario o contraseña incorrectos.");
		}
		
		
		
		$this->data["response"]->data["usuario"] = Array(
			"id"=>$_SESSION["usuario"]->get("ID"),
			"username"=>$_SESSION["usuario"]->get("USUARIO"),
			"nombre"=>$p->get("NOMBRE")
		);
		
		return $this->data["response"];
	}
}

?>
