<?php



require_once(dirname(__FILE__)."/orm.class.php");

class Servidor Extends Model{
	
	public function __construct($id = 0){
		parent::__construct("servidor");
		if (($id !== NULL) && ($id > 0)){
			$this->load($id);
		}
	}
	
}

?>
