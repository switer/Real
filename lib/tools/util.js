'use strict';

var detection = require('./detection')

function hasOwn (obj, prop) {
    return obj && obj.hasOwnProperty(prop)
}
var escapeCharMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
    '\'': '&#x27;',
    '/': '&#x2F;'
}
function _keys(o){
    var ks = []
    for (var k in o) {
        if (hasOwn(o, k)) ks.push(k)
    }
    return ks
}
var entCon = document.createElement('div')
var entities = {}
function _convertEntity(ent) {
    var r = entities[ent]
    if (r) return r
    entCon.innerHTML = ent
    var chNodes = entCon.childNodes
    r = chNodes && chNodes.length ? chNodes[0].nodeValue : ent
    entities[ent] = r
    return r
}
var undef = void(0)
var escapeRex = new RegExp(_keys(escapeCharMap).join('|'), 'g')
var DEFAULT_DIFF_LEVEL = 5
var util = {
    type: function(obj) {
        if (obj === null) return 'null'
        else if (obj === undef) return 'undefined'
        var m = /\[object (\w+)\]/.exec(Object.prototype.toString.call(obj))
        return m ? m[1].toLowerCase() : ''    
    },
    keys: function (obj) {
        var keys = []
        if (!obj) return keys
        if (Object.keys) return Object.keys(obj)
        this.objEach(obj, function (key) {
            keys.push(key)
        })
        return keys
    },
    bind: function (fn, ctx) {
        if (fn.bind) return fn.bind(ctx)
        return function () {
            return fn.apply(ctx, arguments)
        }
    },
    extend: function(obj) {
        if (this.type(obj) != 'object') return obj;
        var source, prop;
        for (var i = 1, length = arguments.length; i < length; i++) {
            source = arguments[i];
            for (prop in source) {
                obj[prop] = source[prop];
            }
        }
        return obj;
    },
    trim: function (str) {
        if (str.trim) return str.trim()
        else {
            return str.replace(/^\s+|\s+$/gm, '')
        }
    },
    indexOf: function (arr, tar) {
        if (arr.indexOf) return arr.indexOf(tar)
        else {
            var i = -1
            util.some(arr, function (item, index) {
                if (item === tar) {
                    i = index
                    return true
                }
            })
            return i
        }
    },
    forEach: function (arr, fn) {
        if (arr.forEach) return arr.forEach(fn)
        else {
            var len = arr.length
            for (var i = 0 ; i < len; i++) {
                fn(arr[i], i)
            }
        }
        return arr
    },
    some: function (arr, fn) {
        if (arr.some) return arr.some(fn)
        else {
            var len = arr.length
            var r = false
            for (var i = 0 ; i < len; i++) {
                if (fn(arr[i], i)) {
                    r = true
                    break
                }
            }
            return r
        }
    },
    map: function (arr, fn) {
        if (arr.map) return arr.map(fn)
        else {
            var len = arr.length
            var next = []
            for (var i = 0 ; i < len; i++) {
                next.push(fn(arr[i], i))
            }
            return next
        }
    },
    objEach: function (obj, fn) {
        if (!obj) return
        for(var key in obj) {
            if (hasOwn(obj, key)) {
                if(fn(key, obj[key]) === false) break
            }
        }
    },
    domRange: function (tar, before, after) {
        var children = []
        var nodes = tar.childNodes
        var start = false
        for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i]
            if (item === after) break
            else if (start) {
                children.push(item)
            } else if (item == before) {
                start = true
            }
        }
        return children
    },
    immutable: function (obj) {
        var that = this
        var _t = this.type(obj)
        var n

        if (_t == 'array') {
            n = util.map(obj, function (item) {
                return that.immutable(item)
            })
        } else if (_t == 'object') {
            n = {}
            this.objEach(obj, function (k, v) {
                n[k] = that.immutable(v)
            })
        } else {
            n = obj
        }
        return n
    },
    diff: function(next, pre, _t) {
        var that = this
        _t = _t === undefined ? DEFAULT_DIFF_LEVEL : _t

        if (_t <= 0) return next !== pre

        if (this.type(next) == 'array' && this.type(pre) == 'array') {
            if (next.length !== pre.length) return true
            return util.some(next, function(item, index) {
                return that.diff(item, pre[index], _t - 1)
            })
        } else if (this.type(next) == 'object' && this.type(pre) == 'object') {
            var nkeys = util.keys(next)
            var pkeys = util.keys(pre)
            if (nkeys.length != pkeys.length) return true

            var that = this
            return util.some(nkeys, function(k) {
                return (!~util.indexOf(pkeys, k)) || that.diff(next[k], pre[k], _t - 1)
            })
        }
        return next !== pre
    },
    slice: function (a) {
        if (!a || !a.length) return []
        if (a.slice) return a.slice(0)
        var len = a.length
        var next = []
        for (var i = 0; i < len; i ++) {
            next.push(a[i])
        }
        return next
    },
    walk: function(node, fn) {
        var into = fn(node) !== false
        var that = this
        if (into) {
            var children = util.slice(node.childNodes)
            util.forEach(children, function (i) {
                that.walk(i, fn)
            })
        }
    },
    isUndef: function (obj) {
        return obj === void(0)
    },
    escape: function (str) {
        if (this.type(str) !== 'string') return str
        return str.replace(escapeRex, function (m) {
            return escapeCharMap[m]
        })
    },
    hasOwn: hasOwn,
    hasAttribute: function(el, an) {
        if (el.hasAttribute) return el.hasAttribute(an)
        else if (!el.getAttribute) return false
        return el.getAttribute(an) !== null
    },
    getAttribute: function (el, an) {
        return el && el.getAttribute(an)
    },
    split: function (str, sep) {
        if (detection.ie && detection.ie <= 8) {
            // IE8 below, convert regexp sep to string sep
            // http://stackoverflow.com/questions/11144628/ie8-parses-this-simple-regex-differently-from-all-other-browsers
            var placeholder = '[\uFFF3|\uFFF4]'
            str = str.replace(sep, function () {
                return placeholder
            })
            return str.split(placeholder)
        } else {
            return str.split(sep)
        }
    },
    inherit: function (clazz, target) {
        function F () {}
        F.prototype = target.prototype
        clazz.prototype = new F()
        return clazz
    },
    /**
     * Covert HTML entities
     * @doc http://www.w3school.com.cn/tags/html_ref_entities.html
     */
    entity: function(text) {
        if (!text || !text.replace) return text
        return text.replace(/(&[#a-zA-Z0-9]+;)/g, function (m, s) {
            return _convertEntity(s)
        })
    }
}

module.exports = util