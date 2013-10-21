<?php

require_once("../class/util/conexion.class.php");
require_once("../class/servidorcontroller.class.php");

if ((!isset($_REQUEST["url"])) || (trim($_REQUEST["url"]) == "") ){
	die("thou shall not pass!!1!");
}
$url = $_REQUEST["url"];
echo '<?xml version="1.0" encoding="utf-8" ?>';
?>
<config version="1T" xmlns="http://www.draftlight.net/dnex/config/ns/1T/">
<mp3cast>
  <mount><?=$url?></mount>
  <title>RadioCEFyL Radio!</title>
</mp3cast>
<init autoplay="1" volume="100" reload="10" xfade="0" />
</config>
