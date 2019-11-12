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
    cashserver: document.querySelector("#cashserver").value
  });

  window.close();
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
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.sync.get(["source", "bitdb", "rest", "cashserver"], setCurrentChoice);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
