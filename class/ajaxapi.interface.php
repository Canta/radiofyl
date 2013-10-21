<?php 

interface IAjaxApi {
	//private $restricted_fields; //un array con los campos que no deberían enviarse vía ajax en condiciones normales.
	//private $encripted_fields; //campos que deben enviarse encriptados.
	
	public function get_restricted_fields();
	public function get_encripted_fields();
	
}

?>
