DIST_EXCLUDE = .DS_Store \
	       Makefile \
	       cashlinkify_node.js \
	       manifest-ff.json \
	       manifest-chrome.json \
	       package-lock.json \
	       node_modules/\* \
	       .git/\*

firefox: cashlinkify.js
	cp manifest-ff.json manifest.json

firefox-dist: firefox
	zip -r cashweb-bb-ff.zip . -x ${DIST_EXCLUDE} cashbb-chrome.html

chrome: cashlinkify.js
	cp manifest-chrome.json manifest.json

chrome-dist: chrome
	zip -r cashweb-bb-chrome.zip . -x ${DIST_EXCLUDE} cashbb.html

cashlinkify.js: cashlinkify_node.js
	browserify cashlinkify_node.js -o cashlinkify.js

.PHONY: clean
clean:
	rm -f cashlinkify.js manifest.json cashweb-bb-ff.zip cashweb-bb-chrome.zip
