<?php

require_once(dirname(__FILE__)."/orm.class.php");
require_once(dirname(__FILE__)."/tiposervidor.class.php");
require_once(dirname(__FILE__)."/formatostream.class.php");
require_once(dirname(__FILE__)."/util/config.class.php");
require_once(dirname(__FILE__)."/usuario.class.php");
require_once(dirname(__FILE__)."/propiedad.class.php");

class Servidor Extends Model{
	
	private $tipo_servidor;
	private $formato_stream;
	
	const PERMISO_AGREGAR_SERVIDOR = 6;
	const PERMISO_MODIFICAR_SERVIDOR = 10;
	
	public function __construct($id = 0){
		parent::__construct("servidor");
		$this->datos["restricted_fields"] = array("mail_para_gestion");
		if (($id !== NULL) && ($id > 0)){
			$this->load($id);
		}
	}
	
	public function load($idServidor = 0){
		parent::load($idServidor);
		$this->load_tipo_servidor();
		$this->load_formato_stream(); 
		$this->load_props();
	}
	
	public function load_formato_stream(){
		$this->formato_stream = new Formato_Stream($this->get("id_formato_stream")); 
	}
	
	public function load_tipo_servidor(){
		$this->tipo_servidor = new TipoServidor($this->get("id_tipo_servidor")); 
	}
	
	public function load_props(){
		$c = Conexion::get_instance();
		$r = $c->execute("select id, valor from propiedades P inner join props_x_servidor PxS on P.id = PxS.id_prop where PxS.id_servidor = ".((int)$this->get("id")).";");
		$this->datos["propiedades"] = Array();
		foreach ($r as $item){
			$p = new Propiedad($item["id"]);
			$this->datos["propiedades"][] = $p;
			$this->datos["fields"][$p->get("codename")] = new Field("text".$p->get("codename"), $p->get("nombre"), $item["valor"]);
		}
	}
	
	public function is_online($forceCheck = false){
		if ($forceCheck == NULL) {
			$forceCheck = false;
		}
		if ($forceCheck){
			$this->tipo_servidor->check_online($this->get("id"));
			$this->load($this->get("id"));
		}
		return $this->get_online();
	}
	
	public static function get_servidores_online($forceCheck = false){
		if ($forceCheck == NULL) {
			$forceCheck = false;
		}
		$c = Conexion::get_instance();
		$return = array();
		
		if (!$forceCheck){
			$r = $c->execute("select id from servidor where id in (select id_servidor from servidor_x_transmision where id_transmision in (select id from transmision where fin = 0));");
			foreach ($r as $item){
				$s = new Servidor($item["id"]);
				$return[] = $s;
			}
		} else {
			$r = $c->execute("select id from servidor where id in (select id_servidor from servidor_x_transmision where id_transmision in (select id from transmision where fin = 0));");
			foreach ($r as $item){
				$s = new Servidor($item["id"]);
				$s->is_online($forceCheck);
				if (($s->get_online() > 0) || ($s->get_online() != false)) {
					$return[] = $s;
				}
			}
		}
		
		return $return;
	}
	
	/*
	//Quito el método estático, debido a que muchos hostings no tienen PHP 5.3
	public static function get_servidores_offline(){
		$c = Conexion::get_instance();
		$return = array();
		
		$r = $c->execute("select id from servidor where id not in (select id_servidor from servidor_x_transmision where id_transmision in (select id from transmision where fin = 0));");
		foreach ($r as $item){
			$clase = get_called_class();
			$s = new $clase($item["id"]);
			$return[] = $s;
		}
		
		return $return;
	}
	*/
	
	public function get_servidores_offline(){
		$c = Conexion::get_instance();
		$return = array();
		
		$r = $c->execute("select id from servidor where id not in (select id_servidor from servidor_x_transmision where id_transmision in (select id from transmision where fin = 0));");
		foreach ($r as $item){
			$clase = get_class($this);
			$s = new $clase($item["id"]);
			$return[] = $s;
		}
		
		return $return;
	}
	
	public function get_fixed_url(){
			//
			$url = $this->get_url();
			if (strpos($url,"://") === FALSE){
				$url = "http://".$url;
			}
			return $url;
	}
	
	public function get_tipo_servidor(){
		return $this->tipo_servidor;
	}
	
	public function get_formato_stream(){
		return $this->formato_stream;
	}
	
	public function get_port(){
		//dada la URL del servidor, devuelve solamente el puerto.
		$url = str_replace("http://", "", $this->get_url());
		if(strstr($url, "/")) {
			$url = explode("/", $url, 2);
			$url[1] = "/" . $url[1];
		} else {
			$url = array($url, "/");
		}
					
		$servidor = explode(":",$url[0]);
		$host = $servidor[0];
		$port = $servidor[1];
		
		return $port;
	}
	
	public function get_hostname(){
		//dada la URL del servidor, devuelve solamente el puerto.
		$url = str_replace("http://", "", $this->get_url());
		if(strstr($url, "/")) {
			$url = explode("/", $url, 2);
			$url[1] = "/" . $url[1];
		} else {
			$url = array($url, "/");
		}
					
		$servidor = explode(":",$url[0]);
		$host = $servidor[0];
		$port = $servidor[1];
		
		return $host;
	}
	
	//public static function get_offline_by_id_usuario($idUsuario){
	//Quito el método estático porque muchos hostings no tiene php 5.3
	public function get_offline_by_id_usuario($idUsuario){
		// Devuelve todos los servidores offline vinculados a un usuario.
		// Si la opción "anon_sees_all_servers" en las configuraciones es 1, devuelve todos, no importa el usuario.
		// Si la opcion "user_sees_all_servers" en las configuraciones es 1, devuelve todos, pero solo para usuarios registrados (no anónimo).
		
		$usa = Config::get_field("user_sees_all_servers");
		
		if ((int)$idUsuario == Usuario::ID_USUARIO_ANONIMO){
			$asa = Config::get_field("anon_sees_all_servers");
			if ($asa["field_value"] == "1"){
				//return self::get_servidores_offline();
				return $this->get_servidores_offline();
			}
		} else {
			if ($usa["field_value"] == "1"){
				//return self::get_servidores_offline();
				return $this->get_servidores_offline();
			}
		}
		
		//si ejecuta de acá en adelante, no se dieron los casos de los chequeos anteriores.
		
		$c = Conexion::get_instance();
		$r = $c->execute("select id_servidor from servidor_usuario where id_usuario = $idUsuario and id_servidor not in (select id_servidor from servidor_x_transmision where id_transmision in (select id from transmision where fin = 0))");
		$return = array();
		foreach ($r as $item){
			$return[] = new Servidor((int)$item["id_servidor"]);
		}
		return $return;
	}
	
}

?>
