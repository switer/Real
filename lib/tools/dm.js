/**
 *  DOM manipulations
 */

'use strict';
var util = require('./util')
var is = require('./is')

function Selector(sel) {
    if (util.type(sel) == 'string') {
        return Shell(util.copyArray(document.querySelectorAll(sel)))
    }
    else if (util.type(sel) == 'array') {
        return Shell(sel)
    }
    else if (sel instanceof Shell) return sel
    else if (is.DOM(sel)) {
        return Shell(new ElementArray(sel))
    }
    else {
        throw new Error('Unexpect selector !')
    }
}

function Shell(nodes) {
    if (nodes instanceof Shell) return nodes
    var $items = new ElementArray()
    util.forEach(nodes, function (item) {
        $items.push(item)
    })
    return $items
}

function ElementArray () {
    var _arr = util.slice(arguments)
    var that = this
    this.push = function (el) {
        _arr.push(el)
        that[_arr.length - 1] = el
        that.length = _arr.length
    }
    this.forEach = function (fn) {
        util.forEach(_arr, fn)
    }
    this.forEach(function (item, i) {
        that[i] = item
    })
    this.length = _arr.length
}

ElementArray.prototype = Shell.prototype

var proto = Shell.prototype
proto.find = function(sel) {
    var subs = []
    this.forEach(function(n) {
        subs = subs.concat(util.copyArray(n.querySelectorAll(sel)))
    })
    return Shell(subs)
}
proto.attr = function(attname, attvalue) {
    var len = arguments.length
    var el = this[0]

    if (len > 1) {
        el.setAttribute(attname, attvalue)
    } else if (len == 1) {
        return (el.getAttribute(attname) || '').toString()
    }
    return this
}
proto.removeAttr = function(attname) {
    this.forEach(function(el) {
        el.removeAttribute(attname)
    })
    return this
}
proto.addClass = function(clazz) {
    this.forEach(function(el) {

        // IE9 below not support classList
        // el.classList.add(clazz)

        var classList = el.className.split(/\s+/)
        if (!~util.indexOf(classList, clazz)) classList.push(clazz)
        el.className = classList.join(' ')
    })
    return this
}
proto.removeClass = function(clazz) {
    this.forEach(function(el) {
        
        // IE9 below not support classList
        // el.classList.remove(clazz)

        var classList = el.className.split(' ')
        var index = util.indexOf(classList, clazz)
        if (~index) classList.splice(index, 1)
        el.className = classList.join(' ')
    })
    return this
}
proto.hasClass = function(clazz) {
    if (!this[0]) return false
    var classList = this[0].className.split(' ')
    return !!~util.indexOf(classList, clazz)
}
proto.each = function(fn) {
    this.forEach(fn)
    return this
}
var ieEvent = !document.addEventListener
proto.on = function(type, listener, capture) {
    this.forEach(function(el) {
        if (ieEvent) {
            el.attachEvent('on' + type, listener)
        } else {
            el.addEventListener(type, listener, capture)
        }
    })
    return this
}
proto.off = function(type, listener, capture) {
    this.forEach(function(el) {
        if (ieEvent) {
            el.detachEvent('on' + type, listener)
        } else {
            el.removeEventListener(type, listener, capture)
        }
    })
    return this
}
proto.html = function(html) {
    var len = arguments.length
    if (len >= 1) {
        this.forEach(function(el) {
            el.innerHTML = html
        })
    } else if (this.length) {
        return this[0].innerHTML
    }
    return this
}
proto.parent = function() {
    if (!this.length) return null
    return Shell([_parentNode(this[0])])
}
proto.remove = function() {
    this.forEach(function(el) {
        var parent = _parentNode(el)
        parent && parent.removeChild(el)
    })
    return this
}
proto.insertBefore = function (pos) {
    var tar
    if (!this.length) return this
    else if (this.length == 1) {
        tar = this[0]
    } else {
        tar = _createDocumentFragment()
        this.forEach(function (el) {
            _appendChild(tar, el)
        })
    }
    _parentNode(pos).insertBefore(tar, pos)
    return this
}
proto.insertAfter = function (pos) {
    var tar
    if (!this.length) return this
    else if (this.length == 1) {
        tar = this[0]
    } else {
        tar = _createDocumentFragment()
        this.forEach(function (el) {
            _appendChild(tar, el)
        })
    }
    _parentNode(pos).insertBefore(tar, pos.nextSibling)
    return this
}
// return element by index
proto.get = function(i) {
    return this[i]
}
proto.append = function(n) {
    if (this.length) _appendChild(this[0], n)
    return this
}
proto.appendTo = function (p) {
    if (this.length == 1) _appendChild(p, this[0])
    else if (this.length > 1) {
        var f = _createDocumentFragment()
        this.forEach(function (n) {
            _appendChild(f, n)
        })
        _appendChild(p, f)
    }
}
proto.replace = function(n) {
    var tar = this[0]
    _parentNode(tar).replaceChild(n, tar)
    return this
}

function _parentNode (e) {
    return e && e.parentNode
}

function _createDocumentFragment () {
    return document.createDocumentFragment()
}

function _appendChild (p, c) {
    return p.appendChild(c)
}
module.exports = Selector
