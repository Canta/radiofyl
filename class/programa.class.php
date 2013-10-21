<?php



require_once(dirname(__FILE__)."/orm.class.php");

class Programa Extends Model{
	
	public function __construct($id = 0){
		parent::__construct("programa");
		if (($id !== NULL) && ($id > 0)){
			$this->load($id);
		}
	}
	
}


?>
