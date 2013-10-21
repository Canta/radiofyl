<?php

class IcecastInfo
{

  protected $sock = FALSE;
  protected $error = array(NULL, NULL);
  protected $hostname = NULL;
  protected $port = NULL;
  protected $timeout = NULL;
  protected $url = NULL;
  protected $parsed = FALSE;
  protected $datas = NULL;
  protected $pdatas = NULL;
  
  function IcecastInfo($hostname, $port=8000, $timeout=7, $url="")
  {
    $this->hostname = $hostname;
    $this->port = $port;
    $this->timeout = $timeout;
    $this->url = $url;
  } // IcecastInfo()
  
  //
  // Begin of socket and connection functions
  //
  
  
  function connect()
  {
    if( !$this->sock )
    {
      //Connect
		if ($this->url == ""){
			$this->url = "http://".$this->hostname."/".$this->port."/";
		}
		
		$return = false;
		
		//if (@fopen($this->url, "r")){
		//	$return = true; //confirmado que ya está online.
			$url = str_replace("http://", "", $this->url);
			if(strpos($url, "/")) {
				$url = explode("/", $url, 2);
				$url[1] = "/" . $url[1];
			} else {
				$url = array($url, "/");
			}
			
			$servidor = explode(":",$url[0]);
			$this->sock = @fsockopen($servidor[0], ($servidor[1]) ? $servidor[1] : 80, $this->error[0] , $this->error[1], $this->timeout);
		//}
    }
    
    if ($this->sock !== FALSE){
		fputs($this->sock, "GET ".$url[1]." HTTP/1.0\r\n"
			."Host: 127.0.0.1\r\n"
			."User-Agent: Mozilla/4.0 (compatible; IceCastInfoClass/0.0.2; ".PHP_OS.")\r\n"
			."\r\n"
		);
		$this->datas .= fgets($this->sock, 128);
	}
    
    //$tmp = var_dump($this->sock);
    $return = ($this->sock !== FALSE);
    //echo $this->url." ---> ".$tmp."<br/>".$this->datas."[fin]<br/>";
    if ($return){
		$return = (strpos($this->datas, "200 OK") > 0);
	}
	//echo $this->url." ---> ".$return."<br/>";
    return $return;
  } // connect()
  
  /*****
  * bool close( void )
  * closes current connection
  */
  function close()
  {
    if( $this->sock )
    {
      fclose($this->sock);
    }
  } // close()
  
  /*****
  * bool refresh( void )
  * closes connection and opens it again to get new datas.
  * parsed datas will not replaced, but parsing will be
  * able again.
  */
  function refresh()
  {
    $this->close();
    $this->sock = NULL;
    if( !$this->connect() )
    {
      return FALSE;
    }
    $this->parsed = FALSE;
    $this->send();
    return TRUE;
  } // refresh()
  
  /*****
  * void send( void )
  * Sends http header and recives datas from server
  */
  function send()
  {
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
  } // send()
  
  /*****
  * mixed error( [bool return])
  * if return is true it will return a error message,
  * else it will print it out (HTML Formatted!).
  */
  function error($return=FALSE)
  {
    if( $return == FALSE )
    {
      print "<br><b>Error:</b> {$this->error[1]} (<i>{$this->error[0]}</i>)<br>";
      return;
    }
    return "{$this->error[1]} ({$this->error[0]})";
  }
  
  //
  // Begin of public functions
  //
  
  /*****
  * bool get_stat( void )
  * Checks that stream will be up and private/public. 
  */
  function get_stat()
  {
    if( strpos($this->datas, 'Server is currently up and') )
    {
      $this->pdatas['status'] = 1;
      return TRUE;
    }
    else
    {
      $this->pdatas['status'] = 0;
      return FALSE;
    }
  } // get_stat()
  
  /*****
  * integer get_listener( void )
  * returns and resets the number of accutal listener.
  */
  function get_listener()
  {
    //Is stream up?
    if( $this->pdatas['status'] == 0 )
    {
      $this->pdatas['listener'] = 0;
      return 0;
    }
    
    $this->pdatas['listener_max'] = explode('kbps with <B>', $this->datas);
    $this->pdatas['listener'] = explode(' of ', $this->pdatas['listener_max'][1]);
    $this->pdatas['listener_max'] = $this->pdatas['listener'][1];
    $this->pdatas['listener'] = $this->pdatas['listener'][0];
    $this->pdatas['listener_max'] = explode(' l', $this->pdatas['listener_max']);
    $this->pdatas['listener_max'] = $this->pdatas['listener_max'][0];
    
    return $this->pdatas['listener'];
  } // get_listener()
  
  /*****
  * integer get_peak( void )
  * returns the listener peak from stream and resets it.
  */
  function get_peak()
  {
    $this->pdatas['peak'] = $this->_extract_datas('Listener Peak: </font></td><td><font class=default><b>');
    return $this->pdatas['peak'];
  } // get_peak()
  
  /*****
  * string get_title( void )
  * returns and resetts the actual moderator/dj/stream_title at stream.
  */
  function get_title()
  {
    //Is stream up?
    if( $this->pdatas['status'] == 0 )
    {
      $this->pdatas['title'] = FALSE;
      return FALSE;
    }
    
    $this->pdatas['title'] = $this->_extract_datas('Stream Title: </font></td><td><font class=default><b>');
    return $this->pdatas['title'];
  } // get_title()
  
  /*****
  * string get_content_type( void )
  * returns and resetts the actual ContentType at stream.
  */
  function get_content_type()
  {
    //Is stream up?
    if( $this->pdatas['status'] == 0 )
    {
      $this->pdatas['content_type'] = FALSE;
      return FALSE;
    }
  
    $this->pdatas['content_type'] = $this->_extract_datas('Content Type: </font></td><td><font class=default><b>');
    return $this->pdatas['content_type'];
  } // get_content_type()
  
  /*****
  * string get_genre( void )
  * returns and resetts the actual Stream Genre.
  */
  function get_genre()
  {
    //Is stream up?
    if( $this->pdatas['status'] == 0 )
    {
      $this->pdatas['genre'] = FALSE;
      return FALSE;
    }
  
    $this->pdatas['genre'] = $this->_extract_datas('Stream Genre: </font></td><td><font class=default><b>');
    return $this->pdatas['genre'];
  } // get_genre()
  
  /*****
  * string get_url( void )
  * returns and resetts the actual Stream URL.
  */
  function get_url()
  {
    //Is stream up?
    if( $this->pdatas['status'] == 0 )
    {
      $this->pdatas['url'] = 'none';
      return 'none';
    }
  
    $this->pdatas['url'] = $this->_extract_datas('Stream URL: </font></td><td><font class=default><b><a href="', '"');
    return $this->pdatas['url'];
  } // get_url()
  
  /*****
  * string get_icq( void )
  * returns and resetts the actual Stream ICQ.
  */
  function get_icq()
  {
    //Is stream up?
    if( $this->pdatas['status'] == 0 )
    {
      $this->pdatas['icq'] = FALSE;
      return FALSE;
    }
  
    $this->pdatas['icq'] = $this->_extract_datas('ICQ: </font></td><td><font class=default><b><a href="http://wwp.icq.com/scripts/contact.dll?msgto=', '"');
    //ICQ is aviable?
    $this->pdatas['icq'] = ( $this->pdatas['icq'] == 'NA' ) ? FALSE : $this->pdatas['icq'];
    return $this->pdatas['icq'];
  } // get_icq()
  
  /*****
  * string get_aim( void )
  * returns and resetts the actual Stream AIM.
  */
  function get_aim()
  {
    //Is stream up?
    if( $this->pdatas['status'] == 0 )
    {
      $this->pdatas['aim'] = FALSE;
      return FALSE;
    }
  
    $this->pdatas['aim'] = $this->_extract_datas('AIM: </font></td><td><font class=default><b><a href="aim:goim?screenname=', '"');
    //AIM is aviable?
    $this->pdatas['aim'] = ( $this->pdatas['aim'] == 'NA' ) ? FALSE : $this->pdatas['aim'];
    return $this->pdatas['aim'];
  } // get_aim()
  
  /*****
  * string get_irc( void )
  * returns and resetts the actual Stream IRC.
  * Note: This often is not a valid form of URL!
  */
  function get_irc()
  {
    //Is stream up?
    if( $this->pdatas['status'] == 0 )
    {
      $this->pdatas['irc'] = FALSE;
      return FALSE;
    }
  
    $this->pdatas['irc'] = $this->_extract_datas('Stream IRC: </font></td><td><font class=default><b><a href="');
    $this->pdatas['irc'] = strstr($this->pdatas['irc'], '">');
    $this->pdatas['irc'] = substr($this->pdatas['irc'], 2);
    return $this->pdatas['irc'];
    
  } // get_irc()
  
  /*****
  * string get_track( void )
  * returns and resetts the current track informations.
  */
  function get_track()
  {
    //Is stream up?
    if( $this->pdatas['status'] == 0 )
    {
      $this->pdatas['track'] = FALSE;
      return FALSE;
    }
  
    $this->pdatas['track'] = $this->_extract_datas('Current Song: </font></td><td><font class=default><b>');
    return $this->pdatas['track'];
    
  } // get_track()
  
  /*****
  * array parse( void )
  * get all the items aviable and return an assoc array.
  * Note: Use this only if you need ALL the informations!
  */
  function parse()
  {
    if( $this->parsed != TRUE )
    {
      //get all single infos
      $this->get_stat();
      $this->get_listener();
      $this->get_peak();
      $this->get_title();
      $this->get_content_type();
      $this->get_genre();
      $this->get_url();
      $this->get_icq();
      $this->get_aim();
      $this->get_irc();
      $this->get_track();
      //set parsed stat
      $this->parsed = TRUE;
    }
    return $this->pdatas;
    
  } // parse()
  
  /*****
  * mixed get_parsed_value( string key )
  * Sucht aus dem geparsten array einen wert herraus und gibt ihn zurück
  * wenn er noch nicht gesetzt ist wird NULL zurückgegeben.
  */
  function get_parsed_value($key)
  {
    return ( isset($this->pdatas[$key]) ) ? $this->pdatas[$key] : FALSE;
    
  } // get_parsed_value()
  
  //
  // Begin private functions
  //
  
  /*****
  * private mixed _extract_datas(string match_str [, string ending])
  * extracts and returns datas after an match_string and before net html tag or ending.
  */
  function _extract_datas($match_str, $ending='<')
  {
    $datas = strstr($this->datas, $match_str);
    //remove match_str because strstr starts before..
    $datas = str_replace($match_str, '', $datas);
    //split text after ending mark and throw all away isnt needed.
    $datas = explode($ending, $datas);
    return $datas[0];
    
  } // _extract_datas()
  
  public function get_listening_url(){
	  return "http://".$this->hostname.":".$this->port;
  }
  
} // ShoutcastInfo class

//
// Thats it folks!
//

/*
class parse_icecast_info{

	// connect to icecast and get the xml info.
	function iceinfo($ip,$port,$user,$pass) {
		$this->infila = array();
		$this->temp=null;
		$this->objcomp=null;

		$this->ch = curl_init();
		
		curl_setopt($this->ch,CURLOPT_URL,"http://".$ip.":".$port."/admin/stats");
		curl_setopt($this->ch,CURLOPT_HEADER,false);
		curl_setopt($this->ch,CURLOPT_HTTPAUTH,CURLAUTH_BASIC);
		curl_setopt($this->ch,CURLOPT_USERPWD,$user.":".$pass);
		curl_setopt($this->ch,CURLOPT_FOLLOWLOCATION,true);
		curl_setopt($this->ch,CURLOPT_RETURNTRANSFER, true);
		
		$this->output=curl_exec($this->ch);
		
		if (curl_errno($this->ch))
			return curl_error($this->ch);
		
		
		curl_close($this->ch);
		
		$this->parser = xml_parser_create();

		xml_set_object($this->parser,$this);
		xml_set_element_handler($this->parser,"inizio","fine");
		xml_set_character_data_handler($this->parser,"componi");
		xml_parse($this->parser,$this->output);
		xml_parser_free($this->parser);

		return $this->infila;
	}
	
	//functions to parse the icecast xml (inizio,componi,fine)
	function inizio($parser,$name,$attr) {
		if ($name == "SOURCE") {
			// create nuovatemp empty
			$this->temp->mount=$attr["MOUNT"];
		}
		else  $this->objcomp = $name;
	}
	
	function componi($parser,$dato) {
		if (is_null($this->objcomp) || is_null($this->temp)) 
			return;

		if ($this->objcomp == "AUDIO_INFO")
	 		$this->temp == "audio_info";
		elseif ($this->objcomp == "BITRATE")
			$this->temp->bitrate=$dato;
		elseif ($this->objcomp == "CHANNELS")
			$this->temp->channels=$dato;
		elseif ($this->objcomp == "LISTENERS")
			$this->temp->listeners=$dato;
		elseif ($this->objcomp == "LISTENURL")
			$this->temp->listenurl=$dato;
		elseif ($this->objcomp == "PUBLIC")
			$this->temp->public=$dato;
		elseif ($this->objcomp == "SAMPLERATE")
			$this->temp->samplerate=$dato;
	}
	
	function fine($parser,$name) {
		if ($name == "SOURCE") {
			array_push($this->infila,$this->temp);
			$this->temp=null;
		}
		else $this->objcomp=null;
	}

}
*/
?>
