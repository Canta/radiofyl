<?php
	@session_start();
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
				config: "http://"+window.location.hostname+"/"+app.app_path+"minicaster/minicasterconfig.php?url="+$parms.url+"&r="+(Math.floor(Math.random() * 9999999))
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

app.app_path = "<?php echo($_SESSION["app_path"]["field_value"]); ?>";
app.template_path = "<?php echo("templates/".$_SESSION["template"]); ?>";
app.current_player = {};
