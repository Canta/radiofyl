<?php 

require_once(dirname(__FILE__)."/usuariocontroller.class.php");


class UsuarioAjax extends UsuarioController{
	
	public function __construct($id){
		parent::__construct($id);
		$this->datos["restricted_fields"] = array();
		$this->datos["encrypted_fields"] = array("password");
	}
	
}

?>
