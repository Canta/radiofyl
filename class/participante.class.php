<?php

require_once(dirname(__FILE__)."/orm.class.php");

class Participante_Programa Extends Model{
	
	public function __construct($id = 0){
		parent::__construct("participante_programa");
		if (($id !== NULL) && ($id > 0)){
			$this->load($id);
		}
	}
	
}

?>
