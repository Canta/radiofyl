/*
	ajax api library
	requires jQuery
*/

function apiCall($url, $data){
	
	if (typeof $data.async == "undefined"){
		$data.async = false;
	}
	
	if (typeof $dada.waitMessage == "undefined"){
		$data.waitMessage = "loading data...";
	}
	
	if (typeof $data.timeout == "undefined"){
		$data.timeout = 10000; //miliseconds
	}
	
	if ($data.async == false) {
		$response = $.ajax({
		  type: 'POST',
		  url: $url,
		  data: $data.data,
		  async: false,
		  cache: false,
		  timeout: $data.timeout
		}).responseText;
		$obj = eval("("+$response+")");
		return $obj;
	} else {
		$.ajax({
			type: 'POST',
			url: $url,
			data: $data.data,
			async: true,
			cache: false,
			timeout: $data.timeout,
			error: $data.apiCall_callbackError,
			success: $data.apiCall_callbackSuccess
		});
	}
	
}

function apiCall_callbackSuccess($data, $textStatus, $objXHR){
	
}

function apiCall_callbackError($objXHR, $testStatus, $errorThrown){
	
}

