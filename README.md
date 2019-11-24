# The CashWeb Browser Buddy

A browser extension implementing the cashgettools [Javascript build](https://github.com/kentjhall/cashweb#build-to-javascript-webassembly).<br>
Available on [Firefox](https://addons.mozilla.org/en-US/firefox/addon/cashweb-bb/?src=search) and Chrome (pending review).

File queries may be sourced from any BitDB node, REST endpoint (much slower), or trusted CashServer (faster). Also linkifies text of the form *web+cash://\<id\>* to make properly clickable. The *web+cash://* protocol should be used for making queries in the address bar (except in Chrome, where custom protocol handlers for extensions aren't yet supported; instead, query from within the extension popup).


## Caveats

REST is available as an option, but it's a very slow one, and perhaps less reliable, and also does not support Nametag queries; I recommend ignoring it.

Loading from BitDB/REST will not load an entire webpage (interpreting HTML); it just downloads the requested file. For example, if you have set to source from BitDB and query for web+cash://~cashweb/index.html , you will see a completely unstyled page (just the HTML); if you make the same query when sourcing from a CashServer, it will load all the page's assets as well. This is a consequence of how the browser handles/interprets files from a typical server versus a local extension; it doesn't know where to make additional requests for assets. I may look into finding a way around this.


## License

The source code is released under the terms of the MIT license.  Please, see
[LICENSE](./LICENSE) for more information.


*last updated: 2019-11-22*
