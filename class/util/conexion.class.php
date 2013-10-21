<?php

require_once("adodb5/adodb-exceptions.inc.php");
require_once('adodb5/adodb.inc.php');

define('ADODB_ASSOC_CASE', 1);

class Conexion
{
	private static $instance;
	private $con;
	private $user = "admin";
	private $pass = "";
	private $db = "radiofyl";
	private $server = "localhost";
	private $tipo_base = "mysql";
	const DATABASE_PREFIX = "radiofyl_";
	
	private function __construct()
	{
		$this->con = ADONewConnection($this->tipo_base);
		$this->user = Conexion::DATABASE_PREFIX.$this->user;
		$this->db = Conexion::DATABASE_PREFIX.$this->db;
		$this->con->Connect($this->server,$this->user, $this->pass, $this->db);
	}
	
	private function __clone(){
	
	}
	
	public static function get_instance() {
		if(Conexion::$instance === null) {
			Conexion::$instance = new Conexion();
		}
		return Conexion::$instance;
	}
	
	public function execute($query){
		$rs = $this->con->Execute($query);
		$ret = Array();
		while ($array = $rs->FetchRow()) {
			$ret[] = $array;
		}
		return $ret;
	}
	
	public function get_database_name(){
		return $this->db;
	}
	
}
?>
