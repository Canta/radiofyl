
app.transmision = {};
app.transmisiones_online = [];


app.transmision.get_transmisiones_online = function($data){
	
	if ($data == undefined){
		$data = {};
	}
	
	if ($data.on_success == undefined){
		$data.on_success = function(){};
	}
	
	app.api({
		data:{
			verb:"get_transmisiones_online"
		}
	}).then([
			function($datos, $status, $xhr){
				app.transmisiones_online = JSON.parse($datos.transmisiones);
			},
			$data.on_success
		]
	);
	
}


app.transmision.play_transmision = function($obj){
	
	if ($obj == undefined){
		$obj = {};
	}
	if ($obj.indice == undefined){
		$obj.indice = 0;
	}
	if ($obj.on_playing == undefined){
		$obj.on_playing = function(){};
	}
	if($obj.on_stop == undefined){
		$obj.on_stop = function(){};
	}
	
	
	$to = app.transmisiones_online[$obj.indice];
	
	$a = AudioPlayer({
		url : $to.datos.fields.URL.data.valor.join(),
		mime_type : $to.datos.formato_stream.datos.fields.MIME_TYPE.data.valor.join(),
		on_playing: $obj.on_playing,
		on_stop: $obj.on_stop
	});
	
	$a.indice = $obj.indice;
	
	app.current_player = $a;
	
	return $a;
}

app.transmision.play_transmision_random = function($obj){
	
	if ($obj == undefined){
		$obj = {};
	}
	
	$i = Math.round(Math.random() * app.transmisiones_online.length -1);
	$i = ($i > app.transmisiones_online.length -1) ? app.transmisiones_online.length -1 : $i;
	$i = ($i < 0) ? 0 : $i;
	
	$obj.indice = $i;
	
	return app.transmision.play_transmision($obj);
}
