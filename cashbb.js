var browser = browser || chrome;

function saveOptions(e) {
  e.preventDefault();

  var radios = document.getElementsByName('source-select'); 
  var i = 0;
  for (var length = radios.length; i<length; i++) {
  	if (radios[i].checked) { break; }
  }

  browser.storage.sync.set({
    source: i,
    bitdb: document.querySelector("#bitdb").value,
    rest: document.querySelector("#rest").value,
    cashserver: document.querySelector("#cashserver").value,
    linkify: document.querySelector("#switch-linkify").checked == true ? "true" : "false"
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    var radios = document.getElementsByName('source-select'); 
    var length = radios.length;
    var si = (result.source && result.source < radios.length) ? result.source : 0;
    for (var i = 0; i<length; i++) {
    	if (i == si) { radios[i].checked = true; break; }
    }

    document.querySelector("#bitdb").value = result.bitdb || "https://bitdb.bitcoin.com/q";
    document.querySelector("#rest").value = result.rest || "https://rest.bitcoin.com/v2";
    document.querySelector("#cashserver").value = result.cashserver || "http://cashweb.cash/q";
    document.querySelector("#switch-linkify").checked = result.linkify ? result.linkify == "true" : true;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.sync.get(["source", "bitdb", "rest", "cashserver", "linkify"], setCurrentChoice);
}

function saveHandler(e) {
	saveOptions(e);
	var query = document.getElementById("query");
	if (query && query.value.length) {
		browser.tabs.create({'url': browser.extension.getURL("cashload.html")+"?cwid="+query.value});
	}
	window.close();
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveHandler);
