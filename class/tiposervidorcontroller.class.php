<?php

require_once(dirname(__FILE__)."/tiposervidor.class.php");
require_once(dirname(__FILE__)."/servidor.class.php");
require_once(dirname(__FILE__)."/util/ShoutcastInfo.class.php");
require_once(dirname(__FILE__)."/util/IcecastInfo.class.php");
require_once(dirname(__FILE__)."/util/gissinfo.class.php");
require_once(dirname(__FILE__)."/util/listen2myradioinfo.class.php");

class TipoServidorController extends Tipo_Servidor {
	
	const ID_TIPO_ICECAST = 1;
	const ID_TIPO_SHOUTCAST = 2;
	const ID_TIPO_GISS = 3;
	const ID_TIPO_L2MRSC = 4; //Listen2MyRadio ShoutCast
	
	public function check_online($idServidor){
		//Dada una URL, se fija si el servidor está online.
		
		$online = false;
		$servidor = new Servidor($idServidor);
		
		/*
		if ((int)$idServidor == 1){
			echo "Chequeando servidor #$idServidor (actualmente online=".$servidor->get_online().").<br/>";
		}
		*/
		
		if ($this->get_idTipo() == TipoServidorController::ID_TIPO_ICECAST){
			$online = $this->check_online_icecast($servidor->get_url());
			
		}
		
		if ($this->get_idTipo() == TipoServidorController::ID_TIPO_SHOUTCAST){
			$online = $this->check_online_shoutcast($servidor->get_url());
			
		}
		
		if ($this->get_idTipo() == TipoServidorController::ID_TIPO_GISS){
			$online = $this->check_online_giss($servidor->get_url());
			
		}
		
		if ($this->get_idTipo() == TipoServidorController::ID_TIPO_L2MRSC){
			$online = $this->check_online_l2mr($servidor->get_url(), $servidor->getRadioId());
			
		}
		
		//no se encontró un servidor con ese id. Creo uno.
		/*
		if ((int)$idServidor == 1){
			echo "Después de los chequeos: online = '".$online."'.<br/>";
			echo "check_online (objeto servidor antes de grabar):<br/>";
			echo var_dump($servidor)."<br/>";
		}
		*/
		$servidor->set_online($online);
		$servidor->save();
		/*
		if ((int)$idServidor == 1){
			echo "check_online (objeto servidor después de grabar):<br/>";
			echo var_dump($servidor)."<br/>";
			echo "<br/>";
		}
		*/ 
		return $online;
	}
	
	private function check_online_icecast($url){
		$return = false;
		$sci = new IcecastInfo("",0,15,$url);
		if ($sci->connect()){
			$sci->close();
			$return = true;
		} 
		return $return;
	}
	
	private function check_online_giss($url){
		$return = false;
		$sci = new GISSInfo("",0,50,$url);
		if ($sci->connect()){
			$sci->close();
			$return = true;
		} 
		return $return;
	}
	
	private function check_online_shoutcast($url){
		$return = false;
		$sci = new ShoutcastInfo("",0,15,$url);
		if ($sci->connect()){
			//$sci->send();
			//echo(var_dump($sci->parse()));
			$sci->close();
			$return = true;
		} 
		return $return;
	}
	
	private function check_online_l2mr($url, $radioId = 0){
		$return = false;
		$sci = new Listen2MyRadioShoutCastInfo("",0,5,$url);
		$sci->radio_id = $radioId;
		if ($sci->connect()){
			//$sci->send();
			//echo(var_dump($sci->parse()));
			$sci->close();
			$return = true;
		} 
		//echo "check_online_l2mr:".var_dump($return)."<br/>";
		return $return;
	}
	
	public function get_listening_url($url){
		
		$url2 = str_replace("http://", "", $url);
		if(strpos($url2, "/")) {
			$url2 = explode("/", $url2, 2);
			$url2[1] = "/" . $url2[1];
		} else {
			$url2 = array($url2, "/");
		}
		
		$servidor = explode(":",$url2[0]);
		$host = $servidor[0];
		$port = $servidor[1];
		
		if ($this->get_idTipo() == TipoServidorController::ID_TIPO_ICECAST){
			//$url = "http://$host:$port";
		}
		
		if ($this->get_idTipo() == TipoServidorController::ID_TIPO_SHOUTCAST){
			$url = "http://$host:$port/;";
		}
		
		if ($this->get_idTipo() == TipoServidorController::ID_TIPO_GISS){
			//$url = "http://$host:$port/";
		}
		
		if ($this->get_idTipo() == TipoServidorController::ID_TIPO_L2MRSC){
			$url = "http://$host/listen.php?ip=$host&port=$port";
		}
	
	return $url;
  }
	
}

?>
