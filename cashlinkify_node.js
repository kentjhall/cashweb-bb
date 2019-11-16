'use strict'
/* eslint-env browser, webextensions */

const browser = require('webextension-polyfill')
const { default: PQueue } = require('p-queue')

/*
 * Derived from https://github.com/ipfs-shipyard/ipfs-companion/blob/master/add-on/src/contentScripts/linkifyDOM.js
 */

;(function (alreadyLoaded) {
  if (alreadyLoaded) {
    return
  }
		
  browser.storage.sync.get(["linkify"]).then(function(item) {
    if (!item.linkify) {
      return
    }

    // Limit contentType to "text/plain" or "text/html"
    if (document.contentType !== undefined && document.contentType !== 'text/plain' && document.contentType !== 'text/html') {
      return
    }
  
    // linkify lock
    window.cashwebBBLinkifiedDOM = true
    window.cashwebBBLinkifyValidationCache = new Map()
  
    const urlRE = /(?:\s+|^)(web\+cash:\/\/)([^\s+"<>:]+)/g
  
    // tags we will scan looking for un-hyperlinked IPFS addresses
    const allowedParents = [
      'abbr', 'acronym', 'address', 'applet', 'b', 'bdo', 'big', 'blockquote', 'body',
      'caption', 'center', 'cite', 'code', 'dd', 'del', 'div', 'dfn', 'dt', 'em',
      'fieldset', 'font', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'iframe',
      'ins', 'kdb', 'li', 'object', 'pre', 'p', 'q', 'samp', 'small', 'span', 'strike',
      's', 'strong', 'sub', 'sup', 'td', 'th', 'tt', 'u', 'var'
    ]
  
    const textNodeXpath = './/text()[' +
      "contains(., 'web+cash:/') and " +
      'not(ancestor::a) and not(ancestor::script) and not(ancestor::style) and ' +
      '(parent::' + allowedParents.join(' or parent::') + ') ' +
      ']'
  
    function init () {
      // Linkify jobs are executed one by one
      // (fixes race-conditions in huge DOMs, does not lock UI)
      const linkifyJobs = new PQueue({ concurrency: 1 })
      linkifyContainer(document.body, linkifyJobs)
        .then(() => {
          new MutationObserver(function (mutations) {
            mutations.forEach(async (mutation) => linkifyMutation(mutation, linkifyJobs))
          }).observe(document.body, {
            characterData: true,
            childList: true,
            subtree: true
          })
        })
    }
  
    async function linkifyMutation (mutation, linkifyJobs) {
      linkifyJobs = linkifyJobs || new PQueue({ concurrency: 1 })
      if (mutation.type === 'childList') {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.TEXT_NODE) {
            linkifyJobs.add(async () => linkifyTextNode(addedNode))
          } else {
            linkifyJobs.add(async () => linkifyContainer(addedNode))
          }
        }
      }
      if (mutation.type === 'characterData') {
        linkifyJobs.add(async () => linkifyTextNode(mutation.target))
      }
      await linkifyJobs.onIdle()
    }
  
    async function linkifyContainer (container, linkifyJobs) {
      if (!container || !container.nodeType || container.isContentEditable) {
        return
      }
      if (container.className && container.className.match && container.className.match(/\blinkifiedCashwebAddress\b/)) {
        // prevent infinite recursion
        return
      }
      const xpathResult = document.evaluate(textNodeXpath, container, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      let i = 0
      let node = null
  
      linkifyJobs = linkifyJobs || new PQueue({ concurrency: 1 })
      while ((node = xpathResult.snapshotItem(i++))) {
        const parent = node.parentNode
        // Skip if no longer in visible DOM
        if (!parent || !container.contains(node)) continue
        const currentNode = node
        linkifyJobs.add(async () => linkifyTextNode(currentNode))
      }
      await linkifyJobs.onIdle()
    }
  
    function isParentTreeSafe (node) {
      let parent = node.parentNode
      // Skip if no longer in visible DOM
      if (!parent) return false
      // Walk back over parent tree and check each of them
      while (parent) {
        // Skip forms, textareas
        if (parent.isContentEditable) return false
        // Skip already linkified nodes
        if (parent.className && parent.className.match(/\blinkifiedCashwebAddress\b/)) return false
        // Skip styled <pre> -- often highlighted by scripts
        if (parent.tagName === 'PRE' && parent.className) return false
        // Skip if no longer in visible DOM
        if (!(parent instanceof HTMLDocument) && !parent.parentNode) return false
        parent = parent.parentNode
      }
      return true
    }
  
    async function linkifyTextNode (node) {
      // Skip if node belongs to a parent from unsafe tree
      if (!isParentTreeSafe(node)) return
  
      let match
      const txt = node.textContent
      let span = null
      let point = 0
  
      while ((match = urlRE.exec(txt))) {
        const textChunk = document.createTextNode(match[0])
        if (span == null) {
          // Create a span to hold the new text with links in it.
          span = document.createElement('span')
          span.className = 'linkifiedCashwebAddress'
        }
        // put in text up to the link
        span.appendChild(document.createTextNode(txt.substring(point, match.index)))
        // create a link and put it in the span
        const a = document.createElement('a')
        a.className = 'linkifiedCashwebAddress'
        a.setAttribute('href', match[0])
        a.setAttribute('target', "_blank");
        a.appendChild(textChunk)
        span.appendChild(a)
        // track insertion point
        const replaceLength = match[0].length
        point = match.index + replaceLength
      }
      if (span && node.parentNode) {
        try {
          // take the text after the last link
          span.appendChild(document.createTextNode(txt.substring(point, txt.length)))
          // replace the original text with the new span
          node.parentNode.replaceChild(span, node)
        } catch (e) {
          console.error(e)
        }
      }
    }

  init()
  });
  
}(window.cashwebBBLinkifiedDOM))
