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

function noop () {}
function _templateShouldUpdate() {
    return util.some(this._expressions, util.bind(function(exp, index) {
        var pv = this._caches[index]
        var nv = this.$exec(exp)
        if (!nv[0]) {
            return !!this.$diff(pv, nv[1])
        }
    }, this))
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
module.exports = {
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
    'class': {
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
    },
    'html': {
        constant: true,
        bind: function (opt) {
            // if express is not empty will set innerHTML with expression result.
            // Otherwise render content template then set innerHTML.
            var reg = Expression.exprRegexp
            var isReplace = opt == 'replace' || opt != 'inner'
            var usingAttrExpr = opt != 'replace' && opt != 'inner' && !!opt
            var template = this.$el.innerHTML
            var expr = usingAttrExpr ? opt : template

            if (!expr) {
                expr = ''
                consoler.warn('Content template should not empty of "' + conf.namespace + 'html".', this.$el)
            }
            var veilExpr = Expression.veil(expr)
            var expressions = this._expressions = util.map(veilExpr.match(reg) || [], function (exp) {
                return Expression.angleBrackets(Expression.strip(exp))
            }) || [expr]

            var parts = util.split(veilExpr, reg)
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
                var frags = []
                util.forEach(parts, function(item, index) {
                    frags.push(item)
                    if (index < expressions.length) {
                        frags.push(caches[index])
                    }
                })
                return Expression.unveil(frags.join(''))
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
            return _templateShouldUpdate.apply(this, arguments)
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
            var reg = Expression.exprRegexp
            var expr = this.expr = usingAttrExpr ? opt : this.$el.innerHTML
            var veilExpr = Expression.veil(expr)
            var expressions = this._expressions = util.map(veilExpr.match(reg) || [], function (exp) {
                return Expression.angleBrackets(Expression.strip(exp))
            }) || [veilExpr]
            var parts = util.split(veilExpr, reg)
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
                var frags = []
                util.forEach(parts, function(item, index) {
                    frags.push(item)
                    if (index < expressions.length) {
                        frags.push(caches[index])
                    }
                })
                var result = Expression.unveil(frags.join(''))
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
        shouldUpdate: _templateShouldUpdate,
        update: function () {
            this.render()
        },
        unbind: function () {
            this.render = noop
            this._expressions = this._caches = this.textNode = null
        }
    },
    'model': {
        bind: function (prop) {
            var tagName = this.$el.tagName
            var type = tagName.toLowerCase()
            var $el = this._$el = $(this.$el)
            
            type = type == 'input' ? $el.attr('type') || 'text' : type

            switch (type) {
                case 'tel':
                case 'url':
                case 'text':
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
            if (!prop) consoler.error('Invalid property key "' + prop + '"')
            else {
                this._prop = prop
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
    },
    'on': {
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
        update: function(handler) {
            this.unbind()

            var fn = handler
            if (util.type(fn) !== 'function')
                return consoler.warn('"' + conf.namespace + 'on" only accept function. {' + this._expr + '}')

            var that = this
            this.fn = function (e) {
                e.$currentTarget = that.$el
                e.$preventDefault = preventDefault
                e.$stopPropagation = stopPropagation
                fn.call(that.$vm, e)
            }
            $(this.$el).on(this.type, this.fn, false)

        },
        unbind: function() {
            if (this.fn) {
                $(this.$el).off(this.type, this.fn)
                this.fn = null
            }
        }
    }
}