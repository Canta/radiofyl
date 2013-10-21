<?php

require_once(dirname(__FILE__)."/orm.class.php");
require_once(dirname(__FILE__)."/servidorcontroller.class.php");


class Transmision Extends Model{
	
	public function __construct($id = 0){
		parent::__construct("transmision");
		if (($id !== NULL) && ($id > 0)){
			$this->load($id);
		}
	}
	
	public function load($id = 0){
		parent::load($id);
		$this->load_servidores();
		$this->load_formato_stream();
	}
	
	public function load_servidores(){
		$this->datos["servidores"] = Array();
		
		$r = ClassGetter::get("servidor_x_transmision",Array("id_transmision = ".$this->datos["fields"]["ID"]->get_valor()));
		
		foreach ($r as $item){
			$this->datos["servidores"][] = new ServidorController($item->datos["fields"]["ID_SERVIDOR"]->get_valor());
		}
		
	}
	
	public function load_formato_stream(){
		$this->datos["formato_stream"] = new Formato_Stream($this->get("id_formato_stream")); 
	}
	
	public function is_online($forceCheck = false){
		if ($forceCheck == NULL) {
			$forceCheck = false;
		}
		
		if ($forceCheck){
			//Ahora abro una conexión y establezco los parámetros.
			$GLOBALS["transmision_curl_data_handler"] = "";
			$GLOBALS["transmision_curl_headers_handler"] = "";
			
			$c = curl_init();
			curl_setopt($c, CURLOPT_URL, $this->get("url"));
			curl_setopt($c, CURLOPT_RETURNTRANSFER, True);
			curl_setopt($c, CURLOPT_HTTPGET, TRUE);
			curl_setopt($c, CURLOPT_CONNECTTIMEOUT,10);
			//curl_setopt($c, CURLOPT_CUSTOMREQUEST, 'HEAD' );
			//curl_setopt($c, CURLOPT_BINARYTRANSFER, 1); 
			//curl_setopt($c, CURLOPT_HEADERFUNCTION, 'Transmision::curl_header_handler'); 
			//curl_setopt($c, CURLOPT_FAILONERROR, 1); 
			curl_setopt($c, CURLOPT_HEADER, True );
			//curl_setopt($c, CURLOPT_NOBODY, true );
			curl_setopt($c, CURLOPT_WRITEFUNCTION, 'Transmision::curl_data_handler');
			
			//Envío, cierro la conexión, y devuelvo el resultado
			$res = curl_exec($c);
			//$ret = ($res !== false);
			$ret = Transmision::analizar_fin_curl($c,$GLOBALS["transmision_curl_data_handler"]);
			curl_close($c);
		} else {
			$ret = ($this->get("fin") == "0000-00-00 00:00:00" || $this->get("fin") == "0" || $this->get("fin") == "");
		}
		
		return $ret;
	}
	
	public static function curl_data_handler($handler, $data) {
		$GLOBALS["transmision_curl_data_handler"] .= $data;
		if (strlen($GLOBALS["transmision_curl_data_handler"]) > 200) {
			return false;
		} else {
			return strlen($data);
		}
	}
	
	private static function analizar_fin_curl($handler, $data){
		if (preg_match('/^HTTP\/\d\.\d\s+(200|301|302)/', $data)){
			//echo("HTTP OK");
			return true; 
		} else if (strpos(strtolower($data),"icy 200") !== false){
			//echo("<b>ICY OK</b>");
			return true;
		} else {
			return false;
		}
	}
	
	public function finalize(){
		$id = (int)$this->get("id");
		if ($id > 0){
			$c = Conexion::get_instance();
			$qs = "update transmision set fin = now() where id = ".$id.";";
			$c->execute($qs);
		}
	}
	
}

?>
