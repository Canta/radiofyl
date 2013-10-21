<?php

require_once("../class/transmision.class.php");

$c = new Condicion(Condicion::TIPO_IGUAL, Condicion::ENTRE_CAMPO_Y_DEFAULT);
$c->set_comparando("fin");
$c2 = new Condicion(Condicion::TIPO_IGUAL, Condicion::ENTRE_CAMPO_Y_VALOR);
$c2->set_comparando("estable");
$c2->set_comparador("0");

$transmisiones = ClassGetter::get("transmision", Array($c,$c2));
//echo(count($transmisiones));
foreach ($transmisiones as $t){
	$nombre = ($t->get("nombre") != "") ? $t->get("nombre") : "Transmision #".$t->get("id");
	
	if (!$t->is_online(True)){
		//No está online. La doy de baja.
		$t->finalize();
	} else {
		//echo("online.");
	}
	//echo("<br/>\n");
}

?>
