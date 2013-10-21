<?php

require_once(dirname(__FILE__)."/orm.class.php");

class Propiedad Extends Model{
	
	public function __construct($id = 1){
		parent::__construct("propiedades");
		if (($id !== NULL) && ($id > 0)){
			$this->load($id);
		}
	}
	
}

?>
