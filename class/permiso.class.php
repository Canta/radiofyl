<?php



require_once(dirname(__FILE__)."/orm.class.php");

class Permiso Extends Model{
	
	public function __construct($id = 0){
		parent::__construct("permiso");
		if (($id !== NULL) && ($id > 0)){
			$this->load($id);
		}
	}
	
	public static function get_by_id_usuario($id_usuario){
		$return = array();
		$c = Conexion::get_instance();
		$r = $c->execute("select id_permiso as id from permiso_usuario where id_usuario = '".$id_usuario."' order by id_permiso desc;");
		foreach ($r as $tmp){
			$return[] = new Permiso((int)$tmp["id"]);
		}
		return $return;
	}
	
}

?>
