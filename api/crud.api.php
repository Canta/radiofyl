<?php
require_once("../class/api.class.php");

/** 
 * crud
 * Verbo del API para gestionar entidades del sistema.
 *
 * @author Daniel Cantarín <omega_canta@yahoo.com>
 */
class crud extends API{
	
	public function do_your_stuff($arr){
		require_once("../class/util/conexion.class.php");
		require_once("../class/orm.class.php");
		require_once("../class/usuario.class.php");
		
		if (!isset($_SESSION)){
			session_start();
		}
		
		$opcion = (isset($_REQUEST["opcion"])) ? strtolower($_REQUEST["opcion"]) : null;
		$form = "";
		$usuario = (isset($_SESSION["user"])) ? $_SESSION["user"] : new Usuario(Usuario::ID_USER_ANON);
		
		if (!is_null($opcion)){
			//La primer validación es: que la opción seleccionada esté entre las posibles.
			//De dónde salen las opciones posibles no corresponde a este script, y
			//deberá ser abstraido y/o encapsulado en alguna clase al caso.
			//if (array_search($opcion,$opciones_posibles) !== false){
			if ($usuario->puede("ALTA_".strtoupper($opcion)) || $usuario->puede("MODIFICAR_".strtoupper($opcion))){
				
				try{
					//Luego, busco la clase para el ABM de esa opción.
					//Si no existe, instancio una clase ABM genérica.
					//LINEAMIENTO:
					//Se pretende que las clases de ABM se llamen ABM[tabla] o [tabla]ABM.
					$clase_abm = (class_exists("ABM".$opcion)) ?  "ABM".$opcion : null;
					$clase_abm = (class_exists($opcion."ABM")) ?  $opcion."ABM" : $clase_abm;
					$abm = (!is_null($clase_abm)) ?  new $clase_abm() : new ABMAdif($opcion);
				} catch(Exception $e){
					$me = new MensajeOperacion("\"".$opcion."\" no existe o el usuario no tiene permiso para verlo. Pruebe desloguearse y vuelva a intentar.",1000);
					$form = $me->render();
					//$form = "<div class=\"mensaje_error\">".$e->getMessage()."</div>";
				}
				
				//Ahora, con el ABM ya instanciado, trabajo sobre los campos y el listado.
				if (isset($abm) && $abm instanceOf ABM){
					$campos = $abm->get_fields();
					$abm->analizar_operacion($_REQUEST);
					if ($abm->get_operacion() == "lista"){
						$abm->search(Array($abm->get_campo_id() . " != 0"),$campos,null,true);
					}
					
					$form = $abm->render_form(Array("solo_con_rotulo"=>(!is_null($clase_abm))));
				}
			} else {
				$me = new MensajeOperacion("El usuario no tiene permiso para acceder a \"".$opcion."\". Pruebe reloguearse y vuelva a intentar.",1000);
				$form = $me->render();
				//$form = "<div class=\"mensaje_error\">\"".$opcion."\" no existe o el usuario no tiene permiso para verlo.</div>";
			}
		} else {
			return APIResponse::fail("No se seleccionó ninguna entidad del sistema.");
		}
		
		$this->data["response"]->data["resultado"] = $form;
		
		return $this->data["response"];
	}
	
}

?>
