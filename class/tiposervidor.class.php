<?php


require_once(dirname(__FILE__)."/orm.class.php");

class Tipo_Servidor Extends Model{
	
	public function __construct($id = 0){
		parent::__construct("tipo_servidor");
		if (($id !== NULL) && ($id > 0)){
			$this->load($id);
		}
	}
	
}

?>
