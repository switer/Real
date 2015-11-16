'use strict';

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
var escapeRex = new RegExp(_keys(escapeCharMap).join('|'), 'g')
var DEFAULT_DIFF_LEVEL = 5
var util = {
    type: function(obj) {
        return /\[object (\w+)\]/.exec(Object.prototype.toString.call(obj))[1].toLowerCase()
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
        function bfn () {
            fn.apply(ctx, arguments)
        }
        bfn.toString = function () {
            return fn.toString()
        }
        return bfn
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
        }
        return r
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
    immutable: function (obj) {
        var that = this
        var _t = this.type(obj)
        var n

        if (_t == 'array') {
            n = obj.map(function (item) {
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
        _t = _t == undefined ? DEFAULT_DIFF_LEVEL : _t

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
        if (!this.type(str) == 'string') return str
        return str.replace(escapeRex, function (m) {
            return escapeCharMap[m]
        })
    },
    hasOwn: hasOwn
}

module.exports = util