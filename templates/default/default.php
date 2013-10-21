<?php
	
	include_once(dirname(__FILE__)."/../../class/transmision.class.php");
?>

<body>
<canvas id="fondo"></canvas>
<div style="text-align:center; position:relative;">
	
	<p id="titulo">RadioFyL</p>
	<p>¡Página en construcción!</p><br/>

</div>

<div class="seccion" id="seccion_transmisiones">
	
	<div id="transmisiones_online"></div>
	
	<div id="transmision">
		<p>&nbsp;</p>
		<div id="data"></div>
		<div id="player_container"></div>
		<div id="data2"></div>
		<div>
			<p>
				<input type="button" value=" Cambiar fondo " onclick="$APP.bg.load_random_shader();" />
				<input type="button" value=" Activar/Desactivar fondo " onclick="$APP.bg.toggle_visible();" />
			</p>
		</div>
	</div>
</div>

<div class="seccion" id="seccion_chat">
	<iframe src="http://webchat.freenode.net/?channels=radiofyl" id="chat_frame"></iframe>
</div>

<div id="selector_izquierda" class="selector" onclick="$APP.cambiar_seccion(-1);" ><div>&lt;</div></div>

<div id="selector_derecha" class="selector" onclick="$APP.cambiar_seccion(1);" ><div>&gt;</div></div>

</body>


