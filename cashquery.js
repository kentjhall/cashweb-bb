var vars = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	vars[key] = value;
});

const id = decodeURIComponent(vars["cwid"]).replace("web+cash://", "");
var bitdb = "";
var rest = "";
var cashserver = "";

Module.onRuntimeInitialized = function() {

	browser.storage.sync.get(["source", "bitdb", "rest", "cashserver"]).then(function(item) {
		switch (item.source) {
			case 0:
				bitdb = item.bitdb;
				break;
			case 1:
				rest = item.rest;
				break;
			case 2:
				cashserver = item.cashserver;
				break;
		}
	}, function(error) {
		console.log("failed to load preferences from storage, error: " + error + "; using defaults");
	}).then(async _ => {
		if (cashserver.length) { window.location = cashserver + "/" + id; }

		var getFunc = rest.length ? 'CWG_WA_get_by_id_rest' : 'CWG_WA_get_by_id_bitdb';
		var endpoint = rest.length ? rest : bitdb;

		const CWG = {
			get_by_id: Module.cwrap(getFunc, 'number', ['number', 'number', 'number', 'number'], {async: true}),
			errno_print_msg: Module.cwrap('CWG_WA_errno_print_msg', 'number', ['number', 'number'])
		};

		const idPtr = _malloc(id.length+1); stringToUTF8(id, idPtr, id.length+1);
		const endpointPtr = _malloc(endpoint.length+1); stringToUTF8(endpoint, endpointPtr, endpoint.length+1);

		const mimeStrPtr = _malloc(256);
		const fName = id.replace(/\//g, "-");
		var stream = FS.open(fName, 'w');
		var errno = await CWG.get_by_id(idPtr, endpointPtr, mimeStrPtr, stream.fd);	
		FS.close(stream);
		const mimeStr = UTF8ToString(mimeStrPtr);
		_free(mimeStrPtr);

		_free(endpointPtr);
		_free(idPtr);

		if (errno != 0) {
			FS.unlink(fName);
			const msg = UTF8ToString(CWG.errno_print_msg(errno)) + ".\n";
			document.getElementById("load-wheel").style.display = "none";
			document.getElementById("err-header").innerHTML = msg;
		} else {
			const file = new File([FS.readFile(fName)], {type: mimeStr});	
			FS.unlink(fName);
			document.getElementById("load-wheel").style.display = "none";

			const url = URL.createObjectURL(file);
			if (mimeStr == "application/pdf") {
				window.location = "/pdfjs/web/viewer.html?file=" + url;
			} else {
				window.location = url;
			}
		}				
	})

}
