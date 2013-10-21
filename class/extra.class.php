<?php
/*

20120813 - Daniel Cantarín 

extra.class.php
Este archivo guarda algunas clases pequeñas típicamente utilitarias, que
todavía no ascendieron a clases plenas como para tener su propio archivo.

Lo utilizo para mantener el código de otras clases limpio.

*/


//Clase Condicion.
//Se utiliza para la generación dinámica de cláusulas WHERE en sql.
class Condicion {
	//Constantes para los tipos de comparaciones
	const TIPO_IGUAL 		= 0;
	const TIPO_MAYOR_IGUAL 	= 1;
	const TIPO_MENOR_IGUAL 	= 2;
	const TIPO_LIKE 		= 3;
	const TIPO_IN 			= 4;
	const TIPO_NOT_IN 		= 5;
	const TIPO_DISTINTO		= 6;
	//Constantes para las variables involucradas
	const ENTRE_VALORES 			= 0;
	const ENTRE_CAMPO_Y_VALOR 		= 1;
	const ENTRE_CAMPO_Y_CAMPO 		= 2;
	const ENTRE_CAMPO_Y_DEFAULT 	= 3;
	
	private $datos;
	
	//Constructor.
	//Por defecto, asume una condición entre un campo y un valor.
	public function __construct($tipo = 0, $entre = 1){
		$this->datos = Array();
		$this->datos["comparando"] = null;
		$this->datos["comparador"] = null;
		$this->datos["tipo"] = $tipo;
		$this->datos["entre"] = $entre;
	}
	
	public function set_comparador($val = ""){
		$this->datos["comparador"] = $val;
	}
	
	public function set_comparando($val = ""){
		$this->datos["comparando"] = $val;
	}
	
	public function set_tipo($val = 0){
		$this->datos["tipo"] = $val;
	}
	
	public function set_entre($val = 1){
		$this->datos["entre"] = $val;
	}
	
	public function toString(){
		$ret  = " ";
		//comparando
		$ret .= ($this->datos["entre"] == self::ENTRE_VALORES) ? "'".$this->datos["comparando"]."'" : $this->datos["comparando"] ;
		//operador
		switch ($this->datos["tipo"]){
			case self::TIPO_IGUAL:
				$ret .= " = ";
				break;
			case self::TIPO_MAYOR_IGUAL:
				$ret .= " >= ";
				break;
			case self::TIPO_MENOR_IGUAL:
				$ret .= " <= ";
				break;
			case self::TIPO_LIKE:
				$ret .= " like ";
				break;
			case self::TIPO_IN:
				$ret .= " in ";
				break;
			case self::TIPO_NOT_IN:
				$ret .= " not in ";
				break;
			case self::TIPO_DISTINTO:
				$ret .= " != ";
				break;
			default:
				trigger_error("Clase Condicion: No se puede definir un operador de tipo '".$this->datos["tipo"]."'", E_USER_ERROR);
				die("");
		}
		//comparador
		
		switch ($this->datos["entre"]){
			case self::ENTRE_CAMPO_Y_CAMPO:
				$ret .= $this->datos["comparador"] ;
				break;
			case self::ENTRE_CAMPO_Y_DEFAULT:
				$ret .= 'default('.$this->datos["comparando"].')';
				break;
			default:
				$ret .= "'".$this->datos["comparador"]."'" ;
		}
		
		return $ret;
	}
}

//Clase MensajeOperacion
//Se utiliza para mostrar mensajes en los formularios.
class MensajeOperacion{
	private $mensaje;
	private $nro_error;
	
	public function __construct($texto, $error = 0){
		$this->mensaje = $texto;
		$this->nro_error = $error;
	}
	
	public function isError(){
		return ($this->nro_error != 0);
	}
	
	public function getNumeroError(){
		return $this->nro_error;
	}
	
	public function getMensaje(){
		return $this->mensaje;
	}
	
	public function render(){
		$ret  = "";
		$clase  = "mensaje";
		$clase .= ($this->isError()) ? "_error" : "_exito";
		$ret .= "<div class=\"".$clase."\">".$this->mensaje."</div>\n";
		return $ret;
	}
	
}


//Clase Lista.
//Se utiliza para gestionar resultados de una búsqueda.
//Es renderizable a HTML.
class Lista {
	
	protected $datos;
	
	public function __construct($data = null){
		if (is_null($data)){
			$data = Array();
		}
		
		$this->datos["campos"] = (isset($data["campos"])) ? $data["campos"] : Array();
		$this->datos["items"] = (isset($data["items"])) ? $data["items"] : Array();
		$this->datos["campo_id"] = (isset($data["campo_id"])) ? $data["campo_id"] : "rowid";
		$this->datos["opciones"] = (isset($data["opciones"])) ? $data["opciones"] : Array();
		$this->datos["acciones"] = (isset($data["acciones"])) ? $data["acciones"] : Array("activar","modificar");
		
	}
	
	public function set_campos($arr){
		if (!is_array($arr)){
			throw new Exception("Clase Lista, método set_campos: se esperaba un array; se utilizó \"".gettype($arr)."\".<br/>\n");
		}
		$this->datos["campos"] = $arr;
	}
	
	public function set_items($arr){
		if (!is_array($arr)){
			throw new Exception("Clase Lista, método set_items: se esperaba un array; se utilizó \"".gettype($arr)."\".<br/>\n");
		}
		$this->datos["items"] = $arr;
	}
	
	public function render(){
		
		$ret = "<table class=\"Lista";
		foreach($this->datos["opciones"] as $opcion){
			$ret .= " ".$opcion;
		}
		$ret .= "\">\n<thead><tr>";
		foreach($this->datos["campos"] as $nombre => $item){
			if ($item instanceOf FormField){
				if (trim(strtolower($this->datos["campo_id"])) != trim(strtolower($nombre)) ){
					$ret .= "<td>".$item->get_rotulo()."</td>";
				}
			} else {
				//Si no es un FormField, se asume String
				if (trim(strtolower($this->datos["campo_id"])) != trim(strtolower($item)) ){
					$ret .= "<td>".$item."</td>";
				}
			}
		}
		foreach($this->datos["acciones"] as $nombre){
			$renderizar = true;
			//La acción "activar" tiene un comportamiento especial,
			//determinado por el campo "activo".
			if ($nombre == "activar"){
				$renderizar = (isset($row["activo"])) ? true : false;
			}
			if ($renderizar === true){
				$ret .= "<td class=\"lista_accion\">".$nombre."</td>";
			}
		}
		//Agrego un td para el campo ID
		$ret .= "<td class=\"lista_item_id\"></td>";
		
		$ret .= "</tr>\n</thead>\n<tbody>\n";
		
		$i = 0;
		
		$campos = $this->datos["campos"];
		foreach($this->datos["items"] as $row){
			if (count($row) > 0){
				$tmp = ($i % 2 === 0) ? "par" : "impar";
				$ret .= "<tr class=\"".$tmp."\">\n";
				
				foreach ($row as $nombre=>$valor){
					if (trim(strtolower($this->datos["campo_id"])) != trim(strtolower($nombre)) ){
						if (isset($campos[$nombre]) && $campos[$nombre] instanceOf EnumField){
							$ret .= "<td>".$campos[$nombre]->get_descripcion_valor($valor)."</td>\n";
						} else {
							$ret .= "<td>".$valor."</td>\n";
						}
					}
				}
				foreach($this->datos["acciones"] as $nombre){
					$tmp_item_id = isset($row[strtoupper($this->datos["campo_id"])]) ? $row[strtoupper($this->datos["campo_id"])] : $row[strtolower($this->datos["campo_id"])];
					$renderizar = true;
					//La acción "activar" tiene un comportamiento especial, determinado por el campo "activo".
					if ($nombre == "activar"){
						$nombre = (isset($row["activo"]) && $row["activo"] == "0") ? "activar" : "desactivar";
						$renderizar = (isset($row["activo"])) ? true : false;
					}
					
					//La acción "modificar" tiene un comportamiento especial, determinado por el perfil de usuario.
					if ($nombre == "modificar"){
						$nombre = (isset($_SESSION["perfil"]) && $_SESSION["perfil"] == "Consulta") ? "ver" : "modificar";
					}
					
					if ($renderizar === true){
						$ret .= "<td class=\"lista_accion\"><input type=\"submit\" value=\"".$nombre."\" name=\"boton_".$nombre."\" item_id=\"".$tmp_item_id."\" onclick=\"accion_".$nombre."(this);\" /></td>";
					}
				}
				//Agrego un td para el campo ID
				$ret .= "<td class=\"lista_item_id\"><input type=\"checkbox\" id=\"campo_id_".$row[$this->datos["campo_id"]]."\" name=\"".$this->datos["campo_id"]."[]\" value=\"".$row[$this->datos["campo_id"]]."\" /></td>";
				
				$ret .= "</tr>\n";
				$i++;
			}
		}
		
		$ret .= "</tbody>\n";
		$ret .= "</table>";
		
		
		return $ret;
	}
	
	public function get_items(){
		return $this->datos["items"];
	}
	
	public function get_campos(){
		return $this->datos["campos"];
	}
	
}

?>
