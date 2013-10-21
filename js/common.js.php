<?php
	require_once("../class/template.class.php");
	session_start();
?>

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

//Canta's
function Canvas($container){
	$tmp = $("<canvas id=\"canvas"+Math.random()+"\"></canvas>");
	if  (typeof $container != "undefined") {
		$container.append($tmp);
	} 
	return $tmp[0];
}

//Canta's
//Extiendo el objeto ImageData para manipular pixels de manera sencilla
ImageData.prototype.setPixel = function (x, y, r, g, b, a) {
    index = (x + y * this.width) * 4;
    this.data[index+0] = r;
    this.data[index+1] = g;
    this.data[index+2] = b;
    this.data[index+3] = a;
}


//Canta's
//Función multibrowser para cargar un player

function AudioPlayerFallback($parms){
	$container = ($parms.container instanceof jQuery) ? $parms.container : $($parms.container);
	return $container.flash(
		{
			// test_flashvars.swf is the flash document
			swf: 'minicaster/minicaster.swf',
			width:"180px",
			height:"70px",
			// these arguments will be passed into the flash document
			flashvars: {
				config: "http://"+window.location.hostname+"/"+$APP.app_path+"minicaster/minicasterconfig.php?url="+$parms.url+"&r="+(Math.floor(Math.random() * 9999999)).toString()
			}
		});
}

function AudioPlayer($parms){
	
	if (typeof $parms == "undefined"){
		$parms = {};
	}
	
	$parms.mime_type = ($parms.mime_type != undefined) ? $parms.mime_type : "audio/ogg";
	$parms.container = ($parms.container != undefined) ? $parms.container : "#player_container";
	$parms.url = ($parms.url != undefined) ? $parms.url : "http://annuna.dmsp.de:8888/annuna.ogg";
	$parms.on_playing = ($parms.on_playing != undefined) ? $parms.on_playing : function(){};
	$parms.on_stop = ($parms.on_stop != undefined) ? $parms.on_stop : function(){};
	
	var $a = (typeof Audio != "undefined") ? new Audio() : document.createElement('audio');
	var $puede = ($a.canPlayType) ? $a.canPlayType($parms.mime_type) != "" : false;
	
	if (!$puede) {
		$a = AudioPlayerFallback($parms);
	} else {
		if ($parms.container instanceof jQuery){
			$parms.container.html($a);
		}else{
			$($parms.container).html($a);
		}
		$a.controls = true;
		$a.autoplay = true;
		$a.addEventListener("playing", $parms.on_playing);
		$a.addEventListener("waiting", $parms.on_stop);
		$a.addEventListener("stop", $parms.on_stop);
		$a.addEventListener("pause", $parms.on_stop);
		$a.src = $parms.url;
		$a.play();
	}
	
	return $a;
}

function get_transmisiones_online($data){
	
	if ($data == undefined){
		$data = {};
	}
	
	if ($data.on_success == undefined){
		$data.on_success = function(){};
	}
	
	$.ajax({
		method: "post",
		url: $APP.app_path + "aapi/get_transmisiones_online.php",
		async: false,
		cache: false,
		dataType: "json",
		params: $data,
		success: function($datos, $status, $xhr){
			$APP.transmisiones_online = $datos;
			this.params.on_success();
		}
	});
}


function play_transmision($obj){
	
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
	
	
	$to = $APP.transmisiones_online[$obj.indice];
	
	$a = AudioPlayer({
		url : $to.datos.fields.URL.data.valor.join(),
		mime_type : $to.datos.formato_stream.datos.fields.MIME_TYPE.data.valor.join(),
		on_playing: $obj.on_playing,
		on_stop: $obj.on_stop
	});
	
	$a.indice = $obj.indice;
	
	$APP.current_player = $a;
	
	return $a;
}

function play_transmision_random($obj){
	
	if ($obj == undefined){
		$obj = {};
	}
	
	if ($APP.transmisiones_online == undefined){
		$APP.transmisiones_online = [];
	}
	$i = Math.round(Math.random() * $APP.transmisiones_online.length -1);
	$i = ($i > $APP.transmisiones_online.length -1) ? $APP.transmisiones_online.length -1 : $i;
	$i = ($i < 0) ? 0 : $i;
	
	$obj.indice = $i;
	
	return play_transmision($obj);
}

var $APP = {}; //Variable global para gestión de componentes de aplicación
$APP.app_path = "<?php echo($_SESSION["app_path"]["field_value"]); ?>";
$APP.template_path = "<?php echo("templates/".$_SESSION["template"]->get("folder")); ?>";
$APP.current_player = {};
