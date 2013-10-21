
<body>
	<div id="container" >
		<div id="cubre-cuerpo"></div>
		<div id="cuadro-espere">
			<div id="icono-espere"></div>
			<div id="texto-espere"></div>
		</div>
		<div id="infolayer" class="pantalla">
			<div class="titulo">CEFYl</div>
		</div>
		<div id="pantalla-menu" class="pantalla">
			<div style="position:absolute; top:25%; width:100%; height: 20%;">
				<div class="cuadrito cuadrito-menu" onclick="$escena.sprites[2].new_img.src=$APP.template_path+'/img/on-air.jpg';"></div>
				<div class="cuadrito cuadrito-menu" onclick="$escena.sprites[2].new_img.src=$APP.template_path+'/img/darth-building-1.jpg';"></div>
				<div class="cuadrito cuadrito-menu" onclick="$escena.sprites[2].new_img.src=$APP.template_path+'/img/senior-edificio-1.jpg';"></div>
			</div>
			<div style="position:absolute; bottom:25%; width:100%; height: 20%;">
				<div class="cuadrito cuadrito-menu"></div>
				<div class="cuadrito cuadrito-menu"></div>
				<div class="cuadrito cuadrito-menu"></div>
			</div>
		</div>
		
		<div id="player_container">
		
		</div>
		
	</div>
	<script type="text/javascript">
		
		$APP.escena = {};
		$APP.escena = new RadioCEFyL_Escena_1({container:$("#container")});
		$escena = $APP.escena;
		function update(){
			$escena.update();
		}
		
		var animator = new Animator();
		var id = animator.addCallback( update, null, false );
		animator.start();
		
		
	</script>
</body>
