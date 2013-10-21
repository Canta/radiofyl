<?php


// El servicio de ShoutCast de Listen2MyRadio parece no ser idéntico al genérico.
// Es decir, la clase ShoutCastInfo funciona bien para otros servidores, pero falla con este.
// De modo que le agrego un chequeo alternativo, propio de Listen2MyRadio

class Listen2MyRadioShoutCastInfo extends ShoutcastInfo 
{
	
	var $radio_id = 0; //id de la radio en el servidor listen2myradio
	
	
	
  function connect()
  {
    if( !$this->sock )
    {
		//L2MY usa un puerto 80 y un /onoff.php para chequear el status. Voy ahí.
		$return = false;
		
		if (($this->url != "") && ($this->url !== NULL)){
			$url = str_replace("http://", "", $this->url);
			if(strstr($url, "/")) {
				$url = explode("/", $url, 2);
				$url[1] = "/" . $url[1];
			} else {
				$url = array($url, "/");
			}
			
			$servidor = explode(":",$url[0]);
			
			$this->hostname = $servidor[0];
			$this->port = $servidor[1];
		}
		
		$fp = fsockopen($this->hostname, 80, $errno, $errstr, 30);
		if (!$fp) {
			echo "$errstr ($errno)<br />\n";
		} else {
			$out = "GET /onoff.php?radio_id=".$this->radio_id." HTTP/1.1\r\n";
			$out .= "Host: ".$this->hostname."\r\n";
			$out .= "Connection: Close\r\n\r\n";
			fwrite($fp, $out);
			$data='';
			while (!feof($fp)) {
				$data=fgets($fp, 128);
				//if ($data[1]=='o' && $data[2]=='n' && $data[3]==' ') {
				if (trim($data) == "on"){
					$return = true;
					session_write_close();
				}
			}
			//echo $data;
			if (trim($data) == "on"){
				$return = true;
			}
			//echo var_dump($return);
			fclose($fp);
		}
		
		if ($return) {
			if ($this->url == ""){
				$this->sock = @fsockopen($this->hostname, $this->port, $this->error[0] , $this->error[1], 5);
			} else {
				$url = str_replace("http://", "", $this->url);
				if(strstr($url, "/")) {
					$url = explode("/", $url, 2);
					$url[1] = "/" . $url[1];
				} else {
					$url = array($url, "/");
				}
				
				$servidor = explode(":",$url[0]);
				$this->sock = @fsockopen($servidor[0], ($servidor[1]) ? $servidor[1] : 80, $this->error[0] , $this->error[1], 5);
			}
		}
    }
    
    //Check connection
    /*if( $this->sock )
    {
      return TRUE;
    }
    else
    {
      return FALSE;
    }*/
    
    return $return;
    
  } // connect()
  
  public function get_listening_url(){
	  // Listen2MyRadio tiene su propia URL para reproducción
	  
	$url = str_replace("http://", "", $this->url);
	if(strstr($url, "/")) {
		$url = explode("/", $url, 2);
		$url[1] = "/" . $url[1];
	} else {
		$url = array($url, "/");
	}
				
	$servidor = explode(":",$url[0]);
	$host = $servidor[0];
	$port = $servidor[1];
	return "http://$host/listen.php?ip=$host&port=$port";
  }
  
 } //clase
?>
