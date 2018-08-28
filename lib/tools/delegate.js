'use strict'

var $ = require('./dm')
function getMatchMethod() {
    var body = document.body
    // if script run in head
    if (!body) return null
    var matchesSelector = body.matches || body.webkitMatchesSelector ||
        body.mozMatchesSelector || body.oMatchesSelector ||
        body.matchesSelector
    var supportQS = body.querySelectorAll
    /**
     * IE8 Support
     */
    var wrap = document.createElement('div')
    if (!matchesSelector && supportQS) {
        matchesSelector = function(el, selector) {    
            // http://tanalin.com/en/blog/2012/12/matches-selector-ie8/
            if (!el || !selector) return false
            var elems
            if (el.parentNode) {
                elems = el.parentNode.querySelectorAll(selector)
            } else {
                wrap.appendChild(el)
                elems = el.parentNode.querySelectorAll(selector)
                wrap.removeChild(el)
            }
            var count = elems.length
            for (var i = 0; i < count; i++) {
                if (elems[i] === el) { return true }
            }
            return false
        }
    } else if (!matchesSelector) {
        matchesSelector = function (selector) {
            var el = this
            var v
            if (v = isIdSel(selector)) {
                return el.id === v
            } else if (v = isClassSel(selector)) {
                return el.className.split(/\s+/).indexOf(v) === -1 ? false : true
            } else if (v = isNameSel(selector)) {
                return el.tagName.toLowerCase() === v.toLowerCase()
            } else if (v = isAttrSel(selector)) {
                if (v.length > 1) {
                    var av = el.getAttribute(v[0])
                    return av + '' === v[1]
                } else {
                    return el.hasAttribute(v[0])
                }
            } else {
                // not support selector
                return false
            }
        }
    }
    return matchesSelector
}

var matchesSelector = getMatchMethod()
module.exports = function delegate(con, type, selector, handler) {
    var fn = function(e) {
        var currentTarget = findMatch(e.target, selector, con)
        if (!currentTarget) return
        e.$currentTarget = currentTarget
        handler.call(currentTarget, e)
    }
    var $con = $(con)
    $con.on(type, fn)
    if (!matchesSelector) {
        matchesSelector = getMatchMethod()
    }
    return function() {
        $con.off(type, fn)
    }
}

function findMatch(el, selector, con) {
    if (!el || el === con.parentNode || el === document.body.parentNode) return null
    matchesSelector = matchesSelector || getMatchMethod()
    if (!matchesSelector) return null
    return matchesSelector.call(el, selector, con) ? el : findMatch(el.parentNode, selector, con)

}
function isIdSel(sel) {
    var m = sel.match(/^\#([\w\-]+)$/)
    if (!m) return false
    return m[1]
}
function isAttrSel(sel) {
    var m = sel.match(/^\[(.+)\]$/)
    if (!m) return false
    //[r-attr]
    var m1 = m[1].match(/^[\w\-]+$/)
    if (m1) {
        return [m1[0]]
    }
    //[r-attr="value"]
    var m2 = m[1].match(/^([\w\-]+)\="([^\"]*)"$/)
    if (!m2) return false
    return [m2[1],m2[2]]
}
function isNameSel(sel) {
    var m = sel.match(/^[\w\-]+$/)
    if (!m) return false
    return m[0]
}
function isClassSel(sel) {
    var m = sel.match(/^\.([\w\-]+)$/)
    if (!m) return false
    return m[1]
}