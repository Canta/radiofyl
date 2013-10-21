<?php 

	require_once(dirname(__FILE__)."/servidorcontroller.class.php");

class ServidorAjax extends ServidorController {
	
	public function __construct($idServidor){
		parent::__construct($idServidor);
		$this->datos["restricted_fields"] = array("mail_para_gestión");
		$this->datos["encrypted_fields"] = array();
	}
	
	//public static function get_offline_by_id_usuario($idUsuario){
	//Quito el método estático porque muchos hostings no tiene php 5.3
	public function get_offline_by_id_usuario($idUsuario){
		// Devuelve todos los servidores offline vinculados a un usuario.
		// Si la opción "anon_sees_all_servers" en las configuraciones es 1, devuelve todos, no importa el usuario.
		// Si la opcion "user_sees_all_servers" en las configuraciones es 1, devuelve todos, pero solo para usuarios registrados (no anónimo).
		
		$usa = Config::get_field("user_sees_all_servers");
		
		if ((int)$idUsuario == UsuarioController::ID_USUARIO_ANONIMO){
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
			$return[] = new ServidorController((int)$item["id_servidor"]);
		}
		return $return;
	}
	
}

?>
