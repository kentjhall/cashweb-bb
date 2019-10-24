var vars = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	vars[key] = value;
});

const id = decodeURIComponent(vars["cwid"]).replace("web+cash://", "");
var bitdb = "https://bitdb.bitcoin.com/q";

var getting = browser.storage.sync.get("bitdb");
getting.then(function(item) {
	console.log(item.bitdb);
	bitdb = item.bitdb;
}, function(error) {
	console.log("failed to load preferences from storage, error: " + error + "; using defaults");
});



Module.onRuntimeInitialized = async _ => {
	const CWG = {
		get_by_id: Module.cwrap('CWG_WA_get_by_id', 'number', ['number', 'number', 'number', 'number'], {async: true}),
		errno_print_msg: Module.cwrap('CWG_WA_errno_print_msg', 'number', ['number', 'number'])
	};

	const idPtr = _malloc(id.length+1); stringToUTF8(id, idPtr, id.length+1);
	const bitdbPtr = _malloc(bitdb.length+1); stringToUTF8(bitdb, bitdbPtr, bitdb.length+1);

	const mimeStrPtr = _malloc(256);
	const fName = id.replace(/\//g, "-");
	var stream = FS.open(fName, 'w');
	var errno = await CWG.get_by_id(idPtr, bitdbPtr, mimeStrPtr, stream.fd);	
	FS.close(stream);
	const mimeStr = UTF8ToString(mimeStrPtr);
	_free(mimeStrPtr);

	_free(bitdbPtr);
	_free(idPtr);

	if (errno != 0) {
		FS.unlink(fName);
		const msgPtr = CWG.errno_print_msg(errno);
		const msg = UTF8ToString(msgPtr) + ".\n";
		document.getElementById("load-wheel").style.display = "none";
		document.getElementById("err-header").innerHTML = msg;
	} else {
		const file = new File([FS.readFile(fName)], {type: mimeStr});	
		FS.unlink(fName);
		document.getElementById("load-wheel").style.display = "none";
		window.location.href = URL.createObjectURL(file);
	}				
}
