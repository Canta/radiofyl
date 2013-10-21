<?php

require_once(dirname(__FILE__)."/usuario.class.php");
require_once(dirname(__FILE__)."/permiso.class.php");

class UsuarioController extends Usuario {
	
	private $permisos;
	
	public function __construct($id){
		parent::__construct($id);
		$this->permisos = Permiso::get_by_id_usuario($this->get("id")); 
	}
	
	public function load($id=0){
		parent::load($id);
		$this->permisos = Permiso::get_by_id_usuario($this->get("id")); 
	}
	
	public function load_permisos(){
		$this->permisos = Permiso::get_by_id_usuario($this->get("id"));
	}
	
	private static function null2empty($value){
		$return = ($value === NULL) ? "" : $value;
		
		return $return;
	}
	
	public function puede($codename){
		//dado un id de permiso, chequea si tiene acceso para esa funcionalidad
		$ret = false;
		foreach ($this->permisos as $permiso){
			if (strtoupper($codename) == strtoupper($permiso->get("codename")) ){
				$ret = true;
				break;
			}
		}
		return $ret;
	}
	
	public static function from_array($arr){
		//Carga un objeto UsuarioController desde un array.
		//Util para serialización
		$o = new UsuarioController($arr["id"]);
		$o->setUsername($arr["username"]);
		$o->setPassword($arr["password"]);
		$o->setMail($arr["mail"]);
		$o->setNombre($arr["nombre"]);
		
		$o->load_permisos(); 
		
		return $o;
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
			$user = new UsuarioController(Usuario::ID_USUARIO_ANONIMO);
		}
		
		$_SESSION["usuario"] = $user;
		return $user;
	}
	
}

?>
