<body style="background-color:#000000; color:#ffffff; margin:0 auto; text-align:center; vertical-align: center;">

<style>
	#selector{
		position:absolute;
		width: 50%;
		height:50%;
		background-color: #ffffff;
		color: #000000;
		top: 25%;
		left:25%;
		-moz-border-radius:25px;
		border-radius:25px;
		-webkit-border-radius:25px;
		-moz-box-shadow: 0 0 50px #ccc;
		-webkit-box-shadow: 0 0 50px #ccc;
		margin: 0 auto;
		text-align:center;
		-moz-box-shadow: 0 0 50px #ccc;
		-webkit-box-shadow: 0 0 50px #ccc;
		box-shadow: 0 0 50px #ccc;
		margin: 0 auto;
	}
</style>
<div id="selector">
	Seleccione un template:<br/>
	<?php
		$templates = ClassGetter::get_all("template");
		die(var_dump($templates[0]));
	?>
	
	<form method="post" name="form_template">
		<select name="template">
		<?php
			$templates = new ORM("template");
			die(var_dump($templates));
			$template = null;
			
			foreach($templates as $template){
				echo "<option value=\"".$template->get_idTemplate()."\">".$template->getName()."</option>\n";
			}
			
		?>
		</select>
		<input type="submit" value=" seleccionar " name="boton_selector_template" />
	</form>
	
</div>

</body>
