<?php 



require_once(dirname(__FILE__)."/orm.class.php");

class Formato_Stream Extends Model{
	
	public function __construct($id = 0){
		parent::__construct("formato_stream");
		if (($id !== NULL) && ($id > 0)){
			$this->load($id);
		}
	}
	
}


?>
