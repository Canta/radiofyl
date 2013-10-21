// Librería de gestión de Sprites
// 2012 - Daniel Cantarín - omega_canta@yahoo.com

/* Definiciones de clases de uso general */


/*
	Clase Escena.
	Se utiliza para manipular diferentes escenas del sistema.
	Esta abstracción gestionaría sprites y otros componentes propios de
	cada diferente momento del sistema de manera autónoma.
	
	Por ejemplo, en un juego tipo arcade, una pantalla de menú 
	típicamente tiene poco qué ver con una pantalla de juego, ni tampoco
	pueden tener mucha relación entre sí diferentes pantallas de juego.
	De modo que para mantener esa autonomía se encapsulan en "escenas".
*/
var Escena = function($data){
	this.sprites = [];
	this.event_handlers = [];
	this.transiciones = [];
	this.objetos = [];
	
	this.ready = false;
	
	$data = (typeof $data == "undefined") ? {} : $data;
	
	this.container = (typeof $data.container == "undefined") ? $("body") : $data.container;
	
	var $c = new Canvas(this.container);
	$c.setAttribute("width",$(document).width());
	$c.setAttribute("height",$(document).height());
	this.context = $c.getContext('2d');
	
	var $c = new Canvas();
	$c.setAttribute("width",this.context.canvas.width);
	$c.setAttribute("height",this.context.canvas.height);
	this.background = $c.getContext("2d");
	this.background.rect(0, 0, this.background.canvas.width, this.background.canvas.height);
	this.background.fillStyle = 'black';
	this.background.fill();
	
	this.update = function(){
		this.context.drawImage(this.background.canvas, 0,0);
		for (var $i = 0; $i < this.sprites.length; $i++){
			$s = this.sprites[$i];
			$s.update();
			$s.render();
		}
	}
	
	this.get_context = function(){
		return this.context;
	}
	
	this.get_centro = function(){
		var $w = parseInt(this.context.canvas.width);
		var $h = parseInt(this.context.canvas.height);
		
		$ret = {x: $w / 2, y: $h / 2};
		return $ret;
	}
	
	this.is_ready = function(){
		$ret = this.ready;
		for (var $i = 0; $i < this.sprites.length && $ret != false; $i++){
			$ret = this.sprites[$i].is_ready();
		}
		
		return $ret;
	}
	
	this.event_handlers["on_ready"] = Array();
	this.event_handlers["on_ready"].push(
		function ($obj) {$obj.ready = true;}
	);
	
	this.timer_status = null;
	
	this.check_status_ready = function(){
		if (this.is_ready()){
			window.clearInterval(this.timer_status);
			this.handle_events("on_ready");
		}
	}
	
	//rutina de gestión de event handlers.
	this.handle_events = function($evt_name){
		var $tmp = Array();
		this.event_handlers[$evt_name] = (typeof this.event_handlers[$evt_name] != "undefined") ? this.event_handlers[$evt_name] : Array();
		for (var $i = 0; $i < this.event_handlers[$evt_name].length; $i++){
			if (this.event_handlers[$evt_name][$i].temporal === true){
				$tmp.push($i);
			}
			this.event_handlers[$evt_name][$i](this);
		}
		for (var $i = 0; $i < $tmp.length; $i++){
			this.event_handlers[$evt_name].remove($tmp[$i]);
		}
	}
	
}

/*
	Clase Transición.
	Se utiliza para abstraer animaciones de uso común vinculadas a la 
	escena y no tanto tal vez a los sprites (que gestionan sus propias 
	animaciones internamente).
	
	Por ejemplo, en el evento "loading", típicamente se muestra una 
	transición visual y un indicador de estado, tanto cuando se entra
	en el estado "loading" como cuando se sale (on_loading, on_after_loading).
	Abstrayendo esas animaciones de alguna manera genérica, se puede
	trabajar sobre animaciones independientemente de la escena.
	
*/
var Transicion = function($data){
	
	$data = ($data == undefined) ? {} : $data;
	
	this.estados = {
		en_reposo: 0,
		trabajando: 1,
		finalizada: 2
	};
	
	this.context = ($data.context == undefined) ? null : $data.context;
	this.estado = this.estados.en_reposo;
	
	
	this.execute = function($parms){
		//placeholder
	}
	
	this.undo = function($parms){
		//placeholder
	}
	
}

/*
	Clase Sprite.
	Vendrían a ser los items básicos de cada escena.
	
	Hay muchos tipos de sprites, pero todos comparten algunas 
	propiedades y métodos.
	
	Básicamente son una colección de frames, que se dibujan mediante el
	método render(), y cuya lógica interna se maneja por el método update();
	De modo que manejan sus propios estados y comportamiento. 
*/
var Sprite = function($data){
	
	$data = ($data == undefined) ? {} : $data;
	
	this.frames = [];
	this.event_handlers = [];
	this.animator = new Animator();
	
	this.visible = (typeof $data.visible == "undefined") ? true : ($data.visible !== false);
	this.context = null;
	this.x = 0;
	this.y = 0;
	
	this.lContext = new Canvas();
	this.lContext.setAttribute("width","510px");
	this.lContext.setAttribute("height","510px");
	this.lContext = this.lContext.getContext('2d');
	
	this.ready = false;
	
	
	this.update = function(){
		console.debug("update_sprite");
	}
	
	
	this.render = function(){
		if (this.context && this.context.canvas && this.is_visible()){
			this.context.drawImage(this.lContext.canvas, 0, 0, this.context.canvas.width, this.context.canvas.height);
		}
	}
	
	this.load_frames_from_img = function($img, $data){
		//$img debería contener un string o un objeto Image
		//$data debería contener un objeto o array con coordenadas para distinguir los frames desde una imagen
	}
	
	this.load_image = function($url){
		$tmp = function(){
			//this.parent.lContext.drawImage(this, 0, 0, this.width, this.height);
			this.ready = true;
		}
		$img = new Image();
		$img.parent = this;
		$img.onload = $tmp;
		$img.ready = false;
		$img.src = $url;
		this.frames.push($img);
	}
	
	this.get_centro = function(){
		var $w = parseInt(this.lContext.canvas.width);
		var $h = parseInt(this.lContext.canvas.height);
		
		$ret = {x: $w / 2, y: $h / 2};
		return $ret;
	}
	
	this.toggle_visible = function(){
		this.visible = (this.visible === true) ? false : true;
	}
	
	this.is_visible = function(){
		var $ret = this.visible;
		
		if ($ret === true){
			//Chequeo que el sprite esté en alguna posición visible.
			//Es decir, dentro de los márgenes del contexto.
			var $lw = this.lContext.canvas.width;
			var $lh = this.lContext.canvas.height;
			var $w  = this.context.canvas.width;
			var $h  = this.context.canvas.height;
			var $xOKmin = (this.x + parseInt($lw) > parseInt($w) );
			var $yOKmin = (this.y + parseInt($lh) > parseInt($h) );
			var $xOKmax= (this.x - parseInt($lw) < parseInt($w) );
			var $yOKmax= (this.y - parseInt($lh) < parseInt($h) );
			return ( ($xOKmin || $yOKmin) && ($xOKmax || $yOKmax) );
		}
		
		return $ret;
	}
	
	this.die = function(){
		//Nada de momento.
		
	}
	
	
	//rutina de gestión de event handlers.
	this.handle_events = function($evt_name){
		var $tmp = Array();
		this.event_handlers[$evt_name] = (typeof this.event_handlers[$evt_name] != "undefined") ? this.event_handlers[$evt_name] : Array();
		for (var $i = 0; $i < this.event_handlers[$evt_name].length; $i++){
			if (this.event_handlers[$evt_name][$i].temporal === true){
				$tmp.push($i);
			}
			this.event_handlers[$evt_name][$i](this);
		}
		for (var $i = 0; $i < $tmp.length; $i++){
			this.event_handlers[$evt_name].remove($tmp[$i]);
		}
	}
	
	this.is_ready = function(){
		$ret = this.ready;
		for (var $i = 0; $i < this.frames.length && $ret != false; $i++){
			$ret = this.frames[$i].ready;
		}
		
		return $ret;
	}
	
	this.event_handlers["on_ready"] = Array();
	this.event_handlers["on_ready"].push(
		function ($obj) {$obj.ready = true;}
	);
	
	return this;
}

