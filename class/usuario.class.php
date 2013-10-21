<?php

require_once(dirname(__FILE__)."/orm.class.php");

class Usuario Extends Model{
	
	const ID_USUARIO_ANONIMO = 1; //id del user anónimo, que se usa de fallback para muchas operaciones.
	
	public function __construct($id_usuario = 1){
		parent::__construct("usuario");
		if (($id_usuario !== NULL) && ($id_usuario > 0)){
			$this->load($id_usuario);
		}
	}
	
}

?>
