function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    bitdb: document.querySelector("#bitdb").value
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#bitdb").value = result.bitdb || "https://bitdb.bitcoin.com/q";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.sync.get("bitdb");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
