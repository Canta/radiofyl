<?php 

require_once(dirname(__FILE__)."/transmision.class.php");

class TransmisionAjax extends Transmision{
	
	public function __construct($id = 0){
		parent::__construct($id);
		$this->datos["restricted_fields"] = array("hash");
		$this->datos["encrypted_fields"] = array();
	}
	
}

?>
