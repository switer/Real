/**
 *  Global Build-in Directives
 */

'use strict';

var $ = require('../tools/dm')
var conf = require('../conf')
var util = require('../tools/util')
var consoler = require('../tools/consoler')
var detection = require('../tools/detection')
var Expression = require('../tools/expression')
var keypath = require('../tools/keypath')
var delegate = require('../tools/delegate')
var CLASS_KEY = 'CLASS'.toLowerCase()
var htmlExprCache = {}
var textExprCache = {}
function noop () {}
function _templateShouldUpdate(vm) {
    return util.some(vm._expressions, function(exp, index) {
        var pv = vm._caches[index]
        var nv = vm.$exec(exp)
        if (!nv[0]) {
            return !!vm.$diff(pv, nv[1])
        }
    })
}
function _eventUpdate(vm, handler, capture) {
    vm.unbind()
    var fn = handler
    if (util.type(fn) !== 'function')
        return consoler.warn('"' + conf.namespace + 'on" only accept function. {' + vm._expr + '}')

    var that = vm
    vm.fn = function (e) {
        e.$currentTarget = that.$el
        e.$preventDefault = preventDefault
        e.$stopPropagation = stopPropagation
        fn.call(that.$vm, e)
    }
    $(vm.$el).on(vm.type, vm.fn, !!capture)
}
function preventDefault(e) {
    e = e || window.event
    if (!e) return
    e.preventDefault 
        ? e.preventDefault() 
        : e.returnValue = false
}
function stopPropagation(e) {
    e = e || window.event
    if (!e) return
    if (e.stopPropagation) {
        e.stopPropagation() 
    } else {
        e.cancelBubble = true
        window.event && (window.event.cancelBubble = true)
    }
}
function _onConf (capture) {
    return {
        multi: true,
        bind: function(evtType, handler, expression) {
            this._expr = expression
            var tagName = this.$el.tagName
            // IE8 below do not support onchange event
            if (evtType == 'vchange') {
                if ((tagName == 'INPUT' || tagName == 'TEXTAREA') && !('onchange' in this.$el)) {
                    if ('onkeyup' in this.$el) {evtType = 'keyup'}
                    else evtType = 'input'
                } else {
                    evtType = 'change'
                }
            }
            this.type = evtType
        },
        update: function (handler) {
            return _eventUpdate(this, handler, capture)
        },
        unbind: function() {
            if (this.fn) {
                $(this.$el).off(this.type, this.fn, !!capture)
                this.fn = null
            }
        }
    }
}
var ds = {
    'attr': {
        multi: true,
        bind: function(attname) {
            this.attname = attname
            this._$el = $(this.$el)
        },
        update: function(next) {
            if (util.isUndef(next)) {
                this._$el.removeAttr(this.attname)
            } else {
                this._$el.attr(this.attname, next)
            }
        },
        unbind: function () {
            this._$el = null
        }
    },
    'html': {
        constant: true,
        bind: function (opt) {
            // if express is not empty will set innerHTML with expression result.
            // Otherwise render content template then set innerHTML.
            var isReplace = opt == 'replace' || opt != 'inner'
            var usingAttrExpr = opt != 'replace' && opt != 'inner' && !!opt
            var template = this.$el.innerHTML
            var expr = usingAttrExpr ? opt : template

            if (!expr) {
                expr = ''
                consoler.warn('Content template should not empty of "' + conf.namespace + 'html".', this.$el)
            }

            var htmlCache = htmlExprCache[expr]
            var parts, expressions
            if (!htmlCache) {
                var reg = Expression.exprRegexp
                var veilExpr = Expression.veil(expr)
                expressions = this._expressions = util.map(veilExpr.match(reg) || [], function (exp) {
                    return Expression.angleBrackets(Expression.strip(exp))
                }) || [expr]
                parts = util.split(veilExpr, reg)
                htmlCache = htmlExprCache[expr] = {
                    expressions: expressions,
                    parts: parts
                }
            }
            expressions = this._expressions = htmlCache.expressions
            parts = htmlCache.parts

            var caches = this._caches = new Array(expressions.length)
            var that = this


            /**
             * Computed all expression and get concated result
             */
            function compute () {
                // set value
                util.forEach(expressions, function(exp, index) {
                    var v = that.$exec(exp)
                    if (!v[0]) caches[index] = v[1]
                })
                // get content
                var str = ''
                util.forEach(parts, function(item, index) {
                    str += emptyStr(item)
                    if (index < expressions.length) {
                        str += emptyStr(caches[index])
                    }
                })
                return Expression.unveil(str)
            }

            if (!isReplace) {
                this._render = function () {
                    this.$el.innerHTML = compute()
                }
            } else {
                var parent = this.$el.parentNode
                var tmpCon = document.createElement('div')
                var fragCon = document.createDocumentFragment()
                var before = document.createComment('<' + conf.namespace + 'html>' + expr)
                var after = document.createComment('</' + conf.namespace + 'html>')

                fragCon.appendChild(before)
                fragCon.appendChild(after)
                parent.replaceChild(fragCon, this.$el)

                this._render = function () {
                    // parent may be a fragment node
                    parent = before.parentNode
                    
                    var result = compute()
                    var childRange = util.domRange(parent, before, after)

                    /**
                     * Convert html to nodes
                     */
                    tmpCon.innerHTML = result
                    util.forEach(util.slice(tmpCon.childNodes), function (node) {
                        fragCon.appendChild(node)
                    })
                    /**
                     * Remve last children
                     */
                    util.forEach(childRange, function (child) {
                        parent.removeChild(child)
                    })
                    parent.insertBefore(fragCon, after)
                }
            }
        },
        shouldUpdate: function () {
            return _templateShouldUpdate(this)
        },
        update: function() {
            this._render()
        },
        unbind: function () {
            this._render = noop
            this._expressions = this._caches = null
        }
    },
    'show': {
        update: function(next) {
            this.$el.style.display = next ? '' : 'none'
        }
    },
    'style': {
        multi: true,
        bind: function(sheet) {
            this.sheet = sheet
        },
        update: function(next) {
            if(this.$el.style) this.$el.style[this.sheet] = next
        }
    },
    'text': {
        constant: true,
        bind: function (opt) {
            var isReplace = opt == 'replace' || opt != 'inner'
            var usingAttrExpr = opt != 'replace' && opt != 'inner' && !!opt
            var expr = this.expr = usingAttrExpr ? opt : this.$el.innerHTML
            var textCache = textExprCache[expr]
            var parts, expressions
            if (!textCache) {
                var reg = Expression.exprRegexp
                var veilExpr = Expression.veil(expr)
                var expressions = this._expressions = util.map(veilExpr.match(reg) || [], function (exp) {
                    return Expression.angleBrackets(Expression.strip(exp))
                }) || [veilExpr]
                var parts = util.split(veilExpr, reg)
                textCache = textExprCache[expr] = {
                    expressions: expressions,
                    parts: parts
                }
            }
            expressions = this._expressions = textCache.expressions
            parts = textCache.parts

            var caches = this._caches = new Array(expressions.length)
            var that = this

            var $textNode
            var $el = this.$el
            this.render = function () {
                // set value
                util.forEach(expressions, function(exp, index) {
                    var v = that.$exec(exp)
                    if (!v[0]) caches[index] = v[1]
                })
                // get content
                var str = ''
                util.forEach(parts, function(item, index) {
                    str += emptyStr(item)
                    if (index < expressions.length) {
                        str += emptyStr(caches[index])
                    }
                })
                var result = Expression.unveil(str)
                if (isReplace) {
                    // TODO, Number Mobile bug, trying to using replaceChild
                    $textNode.nodeValue = util.entity(result)
                } else {
                    this.$el['innerText' in $el ? 'innerText' : 'textContent'] = util.entity(result)
                }
            }
            if (isReplace) {
                $textNode = this.textNode = document.createTextNode('')
                var pn = this.$el.parentNode
                if (pn) {
                    pn.replaceChild($textNode, this.$el)
                } else {
                    return consoler.error('"' + conf.namespace + 'text" \'s parentNode is not found. {' + this.$expr + '}')
                }
            }
            this.render()
        },
        shouldUpdate: function () {
            return _templateShouldUpdate(this)
        },
        update: function () {
            this.render()
        },
        unbind: function () {
            this.render = noop
            this._expressions = this._caches = this.textNode = null
        }
    },
    'model': bindModel(),
    'xmodel': bindModel(true),
    'capture': _onConf(true),
    'on': _onConf(false),
    'click': {
        bind: function(handler, expression) {
            this._expr = expression
            this.type = 'click'
        },
        update: function (handler) {
            return _eventUpdate(this, handler)
        },
        unbind: function() {
            if (this.fn) {
                $(this.$el).off(this.type, this.fn)
                this.fn = null
            }
        }
    },
    'dataset': {
        multi: true,
        bind: function(attname) {
            this.attname = 'data-' + attname
            this._$el = $(this.$el)
        },
        update: function(next) {
            if (util.isUndef(next)) {
                this._$el.removeAttr(this.attname)
            } else {
                this._$el.attr(this.attname, next)
            }
        },
        unbind: function () {
            this.attname = ''
            this._$el = null
        }
    },
    'src': {
        bind: function(src) {
            this.src = src || ''
            this._$el = $(this.$el)
        },
        update: function(src) {
            this._$el.attr('src', src || '')
        },
        unbind: function () {
            this._$el = null
        }
    },
    'href': {
        bind: function(href) {
            this.href = href || ''
            this._$el = $(this.$el)
        },
        update: function(href) {
            this._$el.attr('href', href || '')
        },
        unbind: function () {
            this._$el = null
        }
    },
    'classes': {
        bind: function() {
            this._$el = $(this.$el)
        },
        update: function (classes) {
            var that = this
            if (this._classes) {
                that._$el.removeClass(this._classes)
            }
            var type = util.type(classes)
            if (type == 'array') {
                classes = util.map(classes, function (clazz) {
                    return util.trim(clazz)
                })
            } else if (type == 'string') {
                classes = util.trim(classes).split(/\s+/m)
            }
            this._classes = classes
            that._$el.addClass(classes)
        },
        unbind: function () {
            this._$el = this._classes = null
        }
    },
    'delegate': {
        multi: true,
        bind: function (typeSel, handler) {
            var type
            var selector = typeSel.replace(/^\s*(\w+)\s+/, function (m, t) {
                type = t
                return ''
            })
            if (!type) {
                return consoler.error('"' + conf.namespace + 'delegate" need specify event type. ' + this.$rawExpr)
            }
            selector = util.trim(selector)
            if (!selector) {
                return consoler.error('"' + conf.namespace + 'delegate" need specify selector for element. ' + this.$rawExpr)
            }
            var that = this
            this._handler = handler
            this._unbind = delegate(this.$el, type, selector, function (e) {
                that._handler && that._handler(e)
            })
        },
        update: function (handler) {
            this._handler = handler
        },
        unbind: function () {
            this._unbind()
            this._handler = this._unbind = null
        }
    }
}

function bindModel(isMulti) {
    return {
        multi: !!isMulti,
        bind: function (prop, request) {
            var tagName = this.$el.tagName
            var type = tagName.toLowerCase()
            var $el = this._$el = $(this.$el)
            this._request = isMulti ? request : null
            
            type = type == 'input' ? $el.attr('type') || 'text' : type

            switch (type) {
                case 'tel':
                case 'url':
                case 'text':
                case 'email':
                case 'search':
                case 'password':
                case 'textarea':
                    // todo: support composite events
                    if (detection.supportChangeEvent) {
                        // sometime, input doesn't fire change event
                        this.evtType = 'change,input'
                    } else if (detection.supportKeyupEvent) {
                        // IE9 doesn't fire input event on backspace/del/cut , inspired by vue
                        this.evtType = 'keyup,input'
                    } else {
                        this.evtType = 'input'
                    }
                    break
                
                case 'date':
                case 'week':
                case 'time':
                case 'month':
                case 'datetime':
                case 'datetime-local':
                case 'color':
                case 'range':
                case 'number':
                case 'select':
                case 'checkbox':
                    this.evtType = 'change'
                    break
                default:
                    consoler.warn('"' + conf.namespace + 'model" only support input,textarea,select')
                    return
            }
            var that = this
            var vm = this.$vm
            var vType = this.vType = type == 'checkbox' ? 'checked':'value'
            this._prop = prop
            /**
             *  DOM input 2 state
             */
            this._requestChange = function () {
                if (!that._prop) return
                var value = that.$el[vType]
                var state = vm.$data[that._prop]

                if (util.diff(value, state)) {
                    if (that._request) {
                        value = that._request(value, false)
                    }
                    vm.$set(that._prop, value)
                }
            }
            /**
             *  State 2 DOM input
             */
            this._update = function () {
                if (!that._prop) return

                var pv = that.$el[vType]
                var nv = keypath.get(vm.$data, that._prop)
                if (pv !== nv) {
                    if (that._request) {
                        nv = that._request(nv, true)
                    }
                    that.$el[vType] = nv
                }
            }
            util.forEach(this.evtType.split(','), function (t) {
                $el.on(t, that._requestChange)
            })

            // Initial state 2 DOM update
            this._update()
        },
        update: function (prop) {
            if (isMulti) {
                this._request = prop
            } else {
                if (!prop) consoler.error('Invalid property key "' + prop + '"')
                else {
                    this._prop = prop
                }
            }
        },
        afterUpdate: function () {
            // to compare state value and DOM value, update DOM value if not equal 
            this._update()
        },
        unbind: function () {
            var that = this
            var $el = $(this.$el)
            util.forEach(this.evtType.split(','), function (t) {
                $el.off(t, that._requestChange)
            })
            this._requestChange = this._update = noop
        }
    }
}

// class directive
ds[CLASS_KEY] = {
    multi: true,
    bind: function(className) {
        this.className = className
        this._$el = $(this.$el)
    },
    update: function(next) {
        if (next) this._$el.addClass(this.className)
        else this._$el.removeClass(this.className)
    },
    unbind: function () {
        this._$el = null
    }
}
function emptyStr(v) {
    if (v === undefined || v == null) return ''
    else return v
}
module.exports = ds