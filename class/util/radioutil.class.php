<?php

class RadioUtil{
	
	public static function getRadiosOnline(){
		
		
		$registro = mysql_fetch_array($resultado); 
		$online = existe($registro["url"]);
		if ($online) {
			
		}
	}

}
