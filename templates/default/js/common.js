
//sobrecarga
app.transmision.play_transmision = function($i){
	
	$indice = !isNaN($i) ? $i : 0;
	$indice = ($i.indice !== undefined) ? $i.indice : $indice;  
	
	$to = app.transmisiones_online[$indice];
	
	$a = AudioPlayer({
		url : $to.datos.fields.URL.data.valor.join(),
		mime_type : $to.datos.formato_stream.datos.fields.MIME_TYPE.data.valor.join()
	});
	
	app.current_player = $a;
	
	$nombre = $to.datos.fields.NOMBRE.data.valor.join();
	if ($.trim($nombre) == ""){
		$nombre = ($to.datos.servidores != undefined && $to.datos.servidores.length > 0) ? 
		$to.datos.servidores[0].datos.fields.NOMBRE.data.valor.join() :
		"Transmision #"+$to.datos.fields.ID.data.valor.join();
	}
	
	$("#data").html($nombre+"<br/>"+$to.datos.fields.DESCRIPCION.data.valor.join()+"<br/>");
	$("#data2").html("<br/>Escuchá la transmisión con tu reproductor favorito:<br/><a href=\""+$to.datos.fields.URL.data.valor.join()+"\" >"+$to.datos.fields.URL.data.valor.join()+"</a><br/>");
	
}


app.ui.UI_load_transmisiones_online = function(){
	$container = $("#transmisiones_online");
	$container.html("<p>Tranmisiones online:</p>");
	
	for (var $i = 0; $i < app.transmisiones_online.length; $i++){
		$to = app.transmisiones_online[$i];
		
		$nombre = $to.datos.fields.NOMBRE.data.valor.join();
		if ($.trim($nombre) == ""){
			$nombre = ($to.datos.servidores != undefined && $to.datos.servidores.length > 0) ? 
			$to.datos.servidores[0].datos.fields.NOMBRE.data.valor.join() :
			"Transmision #"+$to.datos.fields.ID.data.valor.join();
		}
		
		$tmp = "<div id=\"transmision_online_"+$to.datos.fields.ID.data.valor.join()+"\" onclick=\"play_transmision("+$i+")\">";
		$tmp += $nombre + "<br/>";
		$tmp += $to.datos.formato_stream.datos.fields.MIME_TYPE.data.valor.join();
		$tmp += "</div>"
		$container.html($container.html() + $tmp);
	}
	
}

app.seccion_actual = 0;
app.cambiar_seccion = function($i){
	$nuevo = app.seccion_actual + $i;
	
	if ($nuevo < 0){
		$nuevo = app.secciones.length - 1;
	}
	if ($nuevo > app.secciones.length - 1){
		$nuevo = 0;
	}
	
	$out = ($i > 0) ? "-115%" : "115%";
	$(app.secciones[app.seccion_actual]).animate({left:$out},500);
	
	if ($i > 0){
		$(app.secciones[$nuevo]).css("left", "115%");
	} else {
		$(app.secciones[$nuevo]).css("left", "-115%");
	}
	
	$(app.secciones[$nuevo]).animate({left: "15%"},500);
	app.seccion_actual = $nuevo;
	
}

$(document).ready(
	function(){
		app.secciones = $("[class='seccion']");
		app.transmision.get_transmisiones_online({on_success: app.ui.UI_load_transmisiones_online});
		
		//animación inicial
		window.setTimeout(
		function(){
			$($("[class='seccion']")[0]).animate({left:"15%"},500);
			window.setTimeout("app.transmision.play_transmision_random();",800);
		}
		,1000);
		
		//timer para actualizar la lista de transmisiones
		app.timer_transmisiones = window.setInterval(function(){
			app.transmision.get_transmisiones_online({on_success: app.ui.UI_load_transmisiones_online});
		}, 120000);
		
		app.bg = new BackgroundGL({context:$("#fondo")[0].getContext("2d")});
		app.bg.init();
	}
);

