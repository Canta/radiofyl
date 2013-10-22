
/* Definición de sprites arbitrarios */

Background.prototype = new Sprite();
Estrella.prototype = new Sprite();
EqBarra.prototype = new Sprite();
EqBarraScroller.prototype = new Sprite();
RadioCEFyL_Loading_1.prototype = new Transicion();



function Estrella($data){
	
	this.load_image(app.template_path + "/img/estrella2.svg");
	this.id = "Estrella" + parseInt(Math.random() * 99999);
	
	this.estados = {
		en_reposo: 0,
		moviendose: 1,
		centrando: 2,
		creciendo: 3,
		decreciendo: 4
	};
	
	$data = ($data == undefined) ? {} : $data;
	
	this.escena = ($data["escena"] == undefined) ? new Escena() : $data["escena"];
	this.context = ($data["context"] == undefined) ? this.escena.get_context() : $data["context"];
	this.x = ($data["x"] == undefined) ? 0 : $data["x"];
	this.y = ($data["y"] == undefined) ? 0 : $data["y"];
	this.rotation = ($data["angle"] == undefined) ? null : $data["angle"];
	this.alpha = ($data["alpha"] == undefined) ? 1 : $data["alpha"];
	this.red = ($data["red"] == undefined) ? null : $data["red"];
	this.green = ($data["green"] == undefined) ? null : $data["green"];
	this.blue = ($data["blue"] == undefined) ? null : $data["blue"];
	this.scale = ($data["scale"] == undefined) ? 5 : $data["scale"];
	this.estado = ($data["estado"] == undefined) ? this.estados.moviendose : $data["estado"];
	
	
	this.lContext.canvas.setAttribute("width", this.context.canvas.width + "px");
	this.lContext.canvas.setAttribute("height", this.context.canvas.height + "px");
	
	
	this.girar = function(){
		this.rotation += 0.05;
		if (this.rotation > 359){
			this.rotation = 0;
		}
	}
	
	this.centrar = function($items){
		this.estado = this.estados.centrando;
		
		$arr = Array();
		if (typeof $items == "function"){
			$arr.push($items);
		} else if ($items instanceof Array){
			$arr = $items;
		} else if (typeof $items != "undefined"){
			throw "Clase Estrella, método centrar(): se esperaba una función o un array con funciones.";
		}
		
		for (var $i = 0; $i < $arr.length; $i++){
			$callback = $arr[$i];
			this.event_handlers["on_after_centrar"] = (typeof this.event_handlers["on_after_centrar"] == "undefined") ? Array() : this.event_handlers["on_after_centrar"];
			$callback.temporal = true; 
			this.event_handlers["on_after_centrar"].push($callback);
		}
	}
	
	this.mover = function($items){
		this.estado = this.estados.moviendose;
		
		$arr = Array();
		if (typeof $items == "function"){
			$arr.push($items);
		} else if ($items instanceof Array){
			$arr = $items;
		} else if (typeof $items != "undefined"){
			throw "Clase Estrella, método crecer(): se esperaba una función o un array con funciones.";
		}
		
		for (var $i = 0; $i < $arr.length; $i++){
			$callback = $arr[$i];
			this.event_handlers["on_after_crecer"] = (typeof this.event_handlers["on_after_crecer"] == "undefined") ? Array() : this.event_handlers["on_after_crecer"];
			$callback.temporal = true; 
			this.event_handlers["on_after_crecer"].push($callback);
		}
	}
	
	this.crecer = function($items){
		this.estado = this.estados.creciendo;
		
		$arr = Array();
		if (typeof $items == "function"){
			$arr.push($items);
		} else if ($items instanceof Array){
			$arr = $items;
		} else if (typeof $items != "undefined"){
			throw "Clase Estrella, método crecer(): se esperaba una función o un array con funciones.";
		}
		
		for (var $i = 0; $i < $arr.length; $i++){
			$callback = $arr[$i];
			this.event_handlers["on_after_crecer"] = (typeof this.event_handlers["on_after_crecer"] == "undefined") ? Array() : this.event_handlers["on_after_crecer"];
			$callback.temporal = true; 
			this.event_handlers["on_after_crecer"].push($callback);
		}
	}
	
	this.decrecer = function($items){
		this.estado = this.estados.decreciendo;
		
		$arr = Array();
		if (typeof $items == "function"){
			$arr.push($items);
		} else if ($items instanceof Array){
			$arr = $items;
		} else if (typeof $items != "undefined"){
			throw "Clase Estrella, método decrecer(): se esperaba una función o un array con funciones.";
		}
		
		for (var $i = 0; $i < $arr.length; $i++){
			$callback = $arr[$i];
			this.event_handlers["on_after_decrecer"] = (typeof this.event_handlers["on_after_decrecer"] == "undefined") ? Array() : this.event_handlers["on_after_decrecer"];
			$callback.temporal = true; 
			this.event_handlers["on_after_decrecer"].push($callback);
		}
	}
	
	this.ready = true;
	
}
Estrella.prototype.update = function() {
	
	this.girar();
	
	switch (this.estado){
		case this.estados.en_reposo:
			//sólo gira. 
			break;
		case this.estados.moviendose:
			
			/* Escala de ampliación */
			this.scale = (this.direccion_scale == 0) ? this.scale + 0.12 : this.scale - 0.12;
			if (this.scale <= 5){
				this.direccion_scale = 0;
			} else if (this.scale >=7){
				this.direccion_scale = 1;
			}
			
			/* Posición en la pantalla */
			//vertical
			this.x = (this.direccion_position_x == 0) ? this.x + 5 : this.x - 5;
			if (this.x <= 0){
				this.direccion_position_x = 0;
			} else if (this.x >= parseInt(this.context.canvas.width)){
				this.direccion_position_x = 1;
			}
			//horizontal
			this.y = (this.direccion_position_y == 0) ? this.y + 5 : this.y - 5;
			if (this.y <= 0){
				this.direccion_position_y = 0;
			} else if (this.y >= parseInt(this.context.canvas.height)){
				this.direccion_position_y = 1;
			}
			
			break;
		case this.estados.centrando:
			var $centro = this.escena.get_centro();
			
			if (this.frames[0] !== undefined){
				/* Posición en la pantalla */
				//vertical
				var $limite = parseInt($centro.x - parseInt(this.frames[0].width) /2);
				var $xOK = (this.x == $limite);
				if (!$xOK){
					var $mas_o_menos = (this.x > $limite) ? "-" : "+";
					this.x = ($mas_o_menos == "+") ? this.x + 10 : this.x - 10;
					//chequeo que no se pase
					this.x = ($mas_o_menos == "+" && (this.x > $limite)) ? $limite : this.x;
					this.x = ($mas_o_menos == "-" && (this.x < $limite)) ? $limite : this.x;
				}
				//horizontal
				$limite = parseInt($centro.y - parseInt(this.frames[0].height) /2);
				var $yOK = (this.y == $limite);
				if (!$yOK){
					var $mas_o_menos = (this.y > $limite) ? "-" : "+";
					this.y = ($mas_o_menos == "+") ? this.y + 10 : this.y - 10;
					//chequeo que no se pase
					this.y = ($mas_o_menos == "+" && (this.y > $limite)) ? $limite : this.y;
					this.y = ($mas_o_menos == "-" && (this.y < $limite)) ? $limite : this.y;
				}
				
				if ($xOK && $yOK ){
					//centrado. llamo a los event handlers que tenga asignados.
					this.estado = this.estados.en_reposo;
					this.handle_events("on_after_centrar");
				}
			}
			break;
		case this.estados.creciendo:
			//Animación de cuando va hacia el centro y se hace grandota.
			var $centro = this.escena.get_centro();
			var $limitex = parseInt($centro.x - parseInt(this.frames[0].width) /2);
			var $xOK = (this.x == $limitex);
			var $limitey = parseInt($centro.y - parseInt(this.frames[0].height) /2);
			var $yOK = (this.y == $limitey);
			
			if ($xOK && $yOK ){
				//Empieza a crecer.
				this.scale = parseInt(this.scale);
				this.scale += 1;
				
				if (this.scale >= 70){
					//ya creció suficiente. Ahora llamo a los event handlers.
					this.scale = 100;
					this.estado = this.estados.en_reposo;
					this.handle_events("on_after_crecer");
				}
			}
			
			break;
		case this.estados.decreciendo:
			//Animación de cuando vuelve de estar grandota a normal.
			this.scale = parseInt(this.scale);
			this.scale -= 1;
			
			if (this.scale <= 5){
				this.scale = 5;
				this.estado = this.estados.en_reposo;
				this.handle_events("on_after_decrecer");
			}
			break;
		default:
			break;
	}
};


Estrella.prototype.render = function(){
	if (this.is_visible()){
		this.lContext.canvas.width = this.lContext.canvas.width;
		this.lContext.save();
		this.lContext.translate(this.x, this.y);
		this.lContext.rotate(this.rotation);
		
		this.lContext.scale(this.scale, this.scale);
		for ($i = 0; $i < this.frames.length; $i++){
			try {
				this.lContext.drawImage(this.frames[$i], -this.frames[$i].width/2, -this.frames[$i].height/2, this.frames[$i].width, this.frames[$i].height);
			} catch($e){
				//nada
			}
		}
		this.lContext.restore();
		
		this.context.beginPath();
		this.context.drawImage(this.lContext.canvas, 0, 0, this.lContext.canvas.width, this.lContext.canvas.height);
		this.context.closePath();
		
		/*
		$id = this.lContext.getImageData(0,0,this.lContext.canvas.width,this.lContext.canvas.height);
		for ($i=0; $i < 10000 ; $i++){
		$id.setPixel(
			Math.random() * $id.width | 0,
			Math.random() * $id.height | 0,
			Math.random() * 255 | 0,
			Math.random() * 255 | 0,
			Math.random() * 255 | 0,
			Math.random()
		);
		}
		this.lContext.putImageData($id,0,0);
		this.context.drawImage(this.lContext.canvas, 0, 0, this.lContext.canvas.width, this.lContext.canvas.height);
		*/
	}
}

function EqBarra($data){
	
	this.id = "EqBarra" + parseInt(Math.random() * 99999);
	
	this.estados = {
		en_reposo: 0,
		activa: 1,
		apagada: 2
	};
	
	$data = ($data == undefined) ? {} : $data;
	
	this.escena = ($data["escena"] == undefined) ? new Escena() : $data["escena"];
	this.context = ($data["context"] == undefined) ? this.escena.get_context() : $data["context"];
	this.x = ($data["x"] == undefined) ? this.context.canvas.width : $data["x"];
	this.y = this.context.canvas.height - (this.context.canvas.height * this.porcentaje / 100);
	this.porcentaje = ($data["porcentaje"] == undefined) ? Math.round(Math.random() * 50) : $data["porcentaje"];
	this.alpha = ($data["alpha"] == undefined) ? null : $data["alpha"];
	this.estado = ($data["estado"] == undefined) ? this.estados.activa : $data["estado"];
	this.ancho = ($data["ancho"] == undefined) ? parseInt(this.context.canvas.width / 20) - 10 : $data["ancho"];
	//this.alto = ($data["alto"] == undefined) ? parseInt($(document).height() / 20) - 10 : $data["alto"];
	this.alto = this.ancho; //me aseguro de que sea una cuadradito y no un rectángulo
	this.speed = ($data["speed"] == undefined) ?  parseInt(this.context.canvas.width / 60) : $data["speed"];
	
	this.lContext.canvas.setAttribute("width", this.context.canvas.width + "px");
	this.lContext.canvas.setAttribute("height", this.context.canvas.height + "px");
	
	this.red = parseInt(Math.random() * 255);
	this.green = parseInt(Math.random() * 255);
	this.blue = parseInt(Math.random() * 255);
	
	this.cuadrados = [];
	
}
		
EqBarra.prototype.update = function() {
	
	//this.porcentaje = Math.round(Math.random() * 50);
	var $h = this.context.canvas.height;
	var $w = this.context.canvas.width;
	this.y = $h - ($h * this.porcentaje / 100);
	
	if (this.x + this.ancho + 10 >= 0){
		this.cuadrados = [];
		for (var $i = this.context.canvas.height; $i > this.y; $i -= (this.alto +1) ){
			this.cuadrados.push({x: this.x, y: $i, ancho: this.ancho, alto: this.alto});
		}
	} 
};

EqBarra.prototype.render = function (){
	if (this.is_visible()){
		for (var $i = 0; $i < this.cuadrados.length; $i++){
			this.context.beginPath();
			this.context.rect(this.cuadrados[$i].x, this.cuadrados[$i].y, this.cuadrados[$i].ancho, this.cuadrados[$i].alto);
			this.context.closePath();
			this.context.fillStyle = 'rgba('+ this.red +', '+ this.green +', '+ this.blue +', 1)';
			this.context.strokeStyle = "rgba(0,255,0,0.5)";
			this.context.lineWidth = 5;
			this.context.fill();
		}
	}
}



function EqBarraScroller($data){
	
	this.id = "EqBarraScroller" + parseInt(Math.random() * 99999);
	
	this.estados = {
		en_reposo: 0,
		moviendose: 1,
		tapando: 2,
		ocultando: 3,
		oculto: 4
	};
	
	$data = ($data == undefined) ? {} : $data;
	
	this.escena = ($data["escena"] == undefined) ? new Escena() : $data["escena"];
	this.context = ($data["context"] == undefined) ? this.escena.get_context() : $data["context"];
	this.speed = ($data["speed"] == undefined) ?  parseInt(this.context.canvas.width / 60) : $data["speed"];
	this.estado =  ($data["estado"] == undefined) ? this.estados.moviendose : $data["estado"];
	
	this.lContext.canvas.setAttribute("width", this.context.canvas.width + "px");
	this.lContext.canvas.setAttribute("height", this.context.canvas.height + "px");
	
	this.barras = [];
	
	this.mover_barras = function(){
		for (var $i = 0; $i < this.barras.length; $i++){
			this.barras[$i].x -= this.speed;
			if (this.barras[$i].x + this.barras[$i].ancho <= 0){
				this.barras[$i].die();
				this.barras.remove($i);
			} else {
				this.barras[$i].update();
			}
		}
	}
	
	this.ready = true;
	
}

EqBarraScroller.prototype.update = function (){
	
	this.mover_barras();
	var $p = (this.barras.length > 0) ? this.barras[this.barras.length-1].porcentaje : 0;
	switch (this.estado) {
		case this.estados.en_reposo:
			break;
		case this.estados.moviendose:
			$p = Math.round(Math.random() * 50);
			break;
		case this.estados.tapando:
			$p = 110;
			break;
		case this.estados.ocultando:
			$p -= 1;
			if ($p <= 0){
				this.estado = this.estados.oculto;
				this.handle_events("on_after_ocultar");
			}
		case this.estados.oculto:
			$p = 0;
			break;
		default:
			break;
	}
	
	var $eq = new EqBarra({
		escena : this.escena,
		x: this.escena.get_context().canvas.width, 
		y: (screen.availHeight / 3),
		porcentaje: $p
	});
	this.barras.push($eq);
	this.speed = $eq.ancho;
}

EqBarraScroller.prototype.render = function (){
	for (var $i = 0; $i < this.barras.length; $i++){
		this.barras[$i].render();
	}
}


function RadioCEFyL_Loading_1($data){
	//Esta transición baja todas las barras EQ, centra la estrella, y la agranda.
	
	this.estados = {
		en_reposo: 0,
		trabajando : 1,
		finalizada: 2
	}
	
	$data = ($data == undefined) ? {} : $data;
	this.escena = ($data["escena"] == undefined) ? new Escena() : $data["escena"];
	this.context = ($data["context"] == undefined) ? this.escena.get_context() : $data["context"];
	this.estado = ($data["estado"] == undefined) ? this.estados.en_reposo : $data["estado"];
	
}


RadioCEFyL_Loading_1.prototype.execute = function($parms) {
	switch (this.estado){
		case this.estados.en_reposo:
			this.estado = this.estados.trabajando;
		case this.estados.trabajando:
			var $tmp = function ($obj) {
				var $tmp2 = function ($obj){
					//cosas que hace cuando terminó de agrandarse
					
				}
				$tmp3 = Array($tmp2);
				if ($parms != undefined && $parms.on_finish != undefined){
					$tmp3.push($parms.on_finish);
				}
				$obj.crecer($tmp3);
			}
			this.escena.sprites[0].centrar($tmp);
			this.escena.sprites[1].estado = this.escena.sprites[1].estados.ocultando;
			this.estado = this.estados.finalizada;
			break;
		case this.estados.finalizada:
			break;
		default:
			break;
	}
}

RadioCEFyL_Loading_1.prototype.undo = function($parms) {
	switch (this.estado){
		case this.estados.en_reposo:
			this.estado = this.estados.finalizada;
		case this.estados.finalizada:
			
			if ($parms != undefined && $parms.on_finish != undefined){
				var $tmp = function ($obj){
					//cosas que hace cuando termina
					$obj.estado = $obj.estados.centrandose;
					$parms.on_finish();
				}
			} else {
				var $tmp = function ($obj){
					//cosas que hace cuando termina
					$obj.estado = $obj.estados.moviendose;
				}
			}
			
			this.escena.sprites[0].decrecer($tmp);
			//this.escena.sprites[1].estado = this.escena.sprites[1].estados.moviendose;
			
			break;
		case this.estados.trabajando:
			break;
		default:
			break;
	}
}

function Background($data){
	
	this.id = "Background" + parseInt(Math.random() * 99999);
	
	this.estados = {
		en_reposo: 0,
		preparando: 1,
		morpheando: 2,
		oculto: 3
	};
	
	
	this.morphs = Array();
	this.morphs.push({name:"cuadros_fade", val:0});
	this.current_morph = 0;
	
	$data = ($data == undefined) ? {} : $data;
	
	this.escena = ($data["escena"] == undefined) ? new Escena() : $data["escena"];
	this.context = ($data["context"] == undefined) ? this.escena.get_context() : $data["context"];
	this.estado =  ($data["estado"] == undefined) ? this.estados.en_reposo : $data["estado"];
	
	this.lContext.canvas.setAttribute("width", this.context.canvas.width + "px");
	this.lContext.canvas.setAttribute("height", this.context.canvas.height + "px");
	
	
	this.img = new Canvas();
	this.new_img = new Image();
	this.new_img.parent = this;
	this.new_img.onload = function(){
		$i = Math.ceil(Math.random() * this.parent.morphs.length) - 1;
		if ($i < 0) {
			$i = 0;
		}
		this.parent.current_morph = $i;
		
		this.parent.estado = this.parent.estados.preparando;
	}
	
	
	this.setup_morph = function(){
		switch (this.morphs[this.current_morph].name) {
			case "cuadros_fade":
				if (this.morphs[this.current_morph].started != true){
					//separo en cuadros la imagen vieja.
					
					this.morphs[this.current_morph].cuadros = Array();
					this.old_img = this.escena.background;
					this.morphs[this.current_morph].vars = {};
					this.morphs[this.current_morph].vars.w = this.context.canvas.width;
					this.morphs[this.current_morph].vars.h = this.context.canvas.height;
					this.morphs[this.current_morph].vars.y = 0;
					this.morphs[this.current_morph].vars.x = 0;
					this.morphs[this.current_morph].vars.i = 0;
					this.morphs[this.current_morph].vars.tmp_canvas = new Canvas();
					this.morphs[this.current_morph].vars.tmp_canvas.setAttribute("width", this.context.canvas.width);
					this.morphs[this.current_morph].vars.tmp_canvas.setAttribute("height", this.context.canvas.height);
					this.morphs[this.current_morph].vars.tmp_canvas = this.morphs[this.current_morph].vars.tmp_canvas.getContext("2d");
					this.morphs[this.current_morph].vars.tmp_canvas.drawImage(this.new_img, 0, 0, this.morphs[this.current_morph].vars.tmp_canvas.canvas.width, this.morphs[this.current_morph].vars.tmp_canvas.canvas.height);
					this.morphs[this.current_morph].started = true;
				}
				
				var $sum = Math.ceil(this.old_img.canvas.width / 8);
				
				if (this.morphs[this.current_morph].vars.i < 8){
					this.morphs[this.current_morph].vars.x = $sum * this.morphs[this.current_morph].vars.i;
					if (this.morphs[this.current_morph].vars.y < this.morphs[this.current_morph].vars.h){
						var $c = {};
						$c.coords = {x: this.morphs[this.current_morph].vars.x, y: this.morphs[this.current_morph].vars.y};
						$c.alpha = 0;
						this.morphs[this.current_morph].cuadros.push($c);
						this.morphs[this.current_morph].vars.y = this.morphs[this.current_morph].vars.y + $sum;
					} else {
						this.morphs[this.current_morph].vars.y = 0;
						this.morphs[this.current_morph].vars.i++;
					}
				} else {
					this.lContext.drawImage(this.old_img.canvas, 0, 0, this.context.canvas.width, this.context.canvas.height);
					this.estado = this.estados.morpheando;
					this.morphs[this.current_morph].started = false;
				}
				
				
				break;
			default:
				break;
		}
	}
	
	this.morphing = function (){
		switch (this.morphs[this.current_morph].name) {
			case "cuadros_fade":
				this.update_cuadros_fade();
				break;
			default:
				break;
		}
	}
	
	this.update_cuadros_fade = function(){
		//pongo la imagen nueva de background
		
		this.lContext.save();
		
		this.morphs[this.current_morph].current_cuadrito = Math.floor(Math.random() * this.morphs[this.current_morph].cuadros.length);
		
		var $cc = this.morphs[this.current_morph].current_cuadrito;
		this.morphs[this.current_morph].cuadros[$cc].alpha += 0.5;
		
		$c = this.morphs[this.current_morph].cuadros[$cc];
		$tmp = new Canvas();
		$tmp.setAttribute("width",this.context.canvas.width / 8);
		$tmp.setAttribute("height",this.context.canvas.width / 8);
		$tmp = $tmp.getContext("2d");
		$tmp.globalAlpha = $c.alpha;
		$tmp.drawImage(this.morphs[this.current_morph].vars.tmp_canvas.canvas,-$c.coords.x, -$c.coords.y);
		
		this.lContext.drawImage($tmp.canvas, $c.coords.x, $c.coords.y, $tmp.canvas.width, $tmp.canvas.height);
		
		if ($c.alpha >= 1){
			this.morphs[this.current_morph].cuadros.remove($cc);
		} else if ($c.alpha > 0.5){
			this.morphs[this.current_morph].cuadros[$cc].alpha = 1;
		}
		$c = null;
		$tmp = null;
		
		
		this.lContext.restore();
		this.escena.background.drawImage(this.lContext.canvas, 0,0, this.escena.context.canvas.width, this.escena.context.canvas.height);
		
		if (this.morphs[this.current_morph].cuadros.length == 0){
			this.estado = this.estados.en_reposo;
		}
	}
	
	
	this.ready = true;
	
}

Background.prototype.update = function(){
	switch (this.estado) {
		case this.estados.en_reposo:
			break;
		case this.estados.preparando:
			this.setup_morph();
			break;
		case this.estados.morpheando:
			break;
		case this.estados.oculto:
			break;
		default:
			break;
	}
}

Background.prototype.render = function(){
	switch (this.estado) {
		case this.estados.en_reposo:
			break;
		case this.estados.morpheando:
			this.morphing();
			break;
		case this.estados.oculto:
			this.lContext.globalAlpha = 0;
			break;
		default:
			break;
	}
}

function RadioCEFyL_Escena_1($data){
	Escena.call(this,$data);
	
	this.esperando = [];
	
	var $e = new Estrella({
		escena : this,
		x: this.get_centro().x, 
		y: this.get_centro().y,
		rotation: 2,
		scale: 100
	});
	
	this.sprites.push($e);
		
	this.sprites.push(
		new EqBarraScroller({escena : this, estado: 4})
	);
	
	this.sprites.push(
		new Background({escena : this})
	);
	
	this.transiciones.push(
		new RadioCEFyL_Loading_1({escena : this})
	);
	
	this.mostrar_espere = function(){
		if ($("#cuadro-espere").css("display") == "none" || $("#cuadro-espere").css("display") == ""){
			var $tmp = function(){
				$("#cubre-cuerpo").fadeIn(500);
				$("#cuadro-espere").fadeIn(750);
			}
			this.transiciones[0].execute({on_finish: $tmp});
			$("#infolayer").fadeOut(1000);
		} 
	}
	
	this.ocultar_espere = function(){
		if ($("#cuadro-espere").css("display") != "none"){
			var $tmp = function(){
				$("#cubre-cuerpo").fadeOut(750);
				$("#cuadro-espere").fadeOut(500);
				$("#texto-espere").html("");
			}
			this.transiciones[0].undo({on_finish: $tmp});
			$("#infolayer").animate({left:0, duration:10}).fadeIn(1000);
		}
	}
	
	this.espere = function($msg){
		this.esperando.push(true);
		$id = this.esperando.length - 1;
		$("#texto-espere").html($("#texto-espere").html() + "<p>" + $msg + "</p>\n");
		this.mostrar_espere();
		return $id;
	}
	
	this.desespere = function($id){
		this.esperando.remove($id);
		if (this.esperando.length == 0) {
			this.ocultar_espere();
		}
	}
	
	
	/* Gestión del evento READY */
	
	$tmp = function($obj){
		$obj.desespere(0);
		$obj.transiciones[0].undo(
			{
				on_finish: function($obj){
					window.setTimeout( function(){
							$("#pantalla-menu").animate({duration:500, left: 0});
							$a = play_transmision_random(
								{
									on_playing: function(){
										$escena.sprites[0].mover();
										$escena.sprites[1].estado = $escena.sprites[1].estados.moviendose;
									},
									on_stop: function(){
										$escena.sprites[0].centrar();
										$escena.sprites[1].estado = $escena.sprites[1].estados.oculto;
									}
								}
							)
						}, 1000
					);
				}
			}
		);
	}
	$tmp.temporal = true;
	
	this.event_handlers["on_ready"].push($tmp);
	
	get_transmisiones_online(
		{on_success: function(){window.setTimeout(function(){app.escena.ready=true},100);}}
	);
	
	window.setTimeout(function(){
		$escena.espere("Cargando sprites...");
	}, 10);
	
	
	this.timer_status = window.setInterval(function() {$escena.check_status_ready();}, 500);
	this.current_pantalla = "pantalla-menu";
	
	
}

