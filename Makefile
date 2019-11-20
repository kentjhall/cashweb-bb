firefox: cashlinkify.js
	cp manifest-ff.json manifest.json

chrome: cashlinkify.js
	cp manifest-chrome.json manifest.json

cashlinkify.js: cashlinkify_node.js
	browserify cashlinkify_node.js -o cashlinkify.js

.PHONY: clean
clean:
	rm -f cashlinkify.js manifest.json
