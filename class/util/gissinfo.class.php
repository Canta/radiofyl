<?php

require_once("IcecastInfo.class.php");

class GISSInfo extends IcecastInfo
{

  function GISSInfo ($hostname, $port=8000, $timeout=7, $url="")
  {
    $this->hostname = $hostname;
    $this->port = $port;
    $this->timeout = $timeout;
    $this->url = $url;
  } // GISSInfo()
  
  
  /*
   * 
   * Los servidores de GISS usan una versión modificada de IceCast.
   * Es básicamente lo mismo, pero se consulta la información de otra manera.
   * Además, por cada consulta que le hago, devuelve un output > 1MB.
   * Esa tasa de transmisión es inaceptable para un servidor barato.
   * Por lo tanto, hasta no encontrar algún método más eficiente de consulta,
   * sobrecargo el método que consulta al servidor, y lo mantengo anulado.
   * 
   */ 
  
  function send()
  {
	/*  
    if( $this->sock )
    {
      //Send HTTP Header
      fputs($this->sock, "GET / HTTP/1.0\r\n"
                        ."Host: 127.0.0.1\r\n"
                        ."User-Agent: Mozilla/4.0 (compatible; IceCastInfoClass/0.0.2; ".PHP_OS.")\r\n"
                        ."\r\n"
           );
           
      //Get datas
      $this->datas = NULL;
      while( !feof($this->sock) )
      {
          $this->datas .= fgets($this->sock, 128);
      }
    }
    */
  } // send()
}  
?>
