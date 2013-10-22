<?php

require_once(dirname(__FILE__)."/orm.class.php");
require_once(dirname(__FILE__)."/permiso.class.php");

class Usuario Extends Model{
	
	const ID_USUARIO_ANONIMO = 1; //id del user anónimo, que se usa de fallback para muchas operaciones.
	
	public function __construct($id_usuario = 1){
		parent::__construct("usuario");
		$this->datos["permisos"] = Array();
		$this->datos["encrypted_fields"] = array("password");
		if (($id_usuario !== NULL) && ($id_usuario > 0)){
			$this->load($id_usuario);
		}
	}
	
	public static function get_usuario_activo(){
		return (is_array($_SESSION) && isset($_SESSION["usuario"])) ? $_SESSION["usuario"] : new Usuario(Usuario::ID_USUARIO_ANONIMO);
	}
	
	public function load($id=0){
		parent::load($id);
		$this->load_permisos();
	}
	
	public function load_permisos(){
		$this->permisos = Permiso::get_by_id_usuario($this->get("id"));
	}
	
	private static function null2empty($value){
		$return = ($value === NULL) ? "" : $value;
		
		return $return;
	}
	
	public function puede($codigo_permiso){
		$found = false;
		foreach ($this->datos["permisos"] as $permiso){
			if (strtoupper(trim($permiso["codigo"])) == strtoupper(trim($codigo_permiso)) || strtoupper(trim($permiso["codigo"])) == "ROOT_ADMIN"){
				$found = true;
				break;
			}
		}
		return $found;
	}
	
	
	public static function login($arr){
		//Se asume que el password ya está pasado por una función md5
		$user = null;
		$username = (isset($arr["username"])) ? mysql_escape_string($arr["username"]) : "";
		$password = (isset($arr["password"])) ? mysql_escape_string($arr["password"]) : "";
		
		$users = ClassGetter::get("usuario", Array("username='".$username."'", "md5(password)='".$password."'"));
		
		if (count($users) > 0){
			$user = $users[0];
		} else {
			$user = new Usuario(Usuario::ID_USUARIO_ANONIMO);
		}
		
		$_SESSION["usuario"] = $user;
		return $user;
	}
	
}

?>
