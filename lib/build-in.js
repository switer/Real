/**
 *  Global Build-in Directives
 */

'use strict';

var $ = require('./dm')
var conf = require('./conf')
var util = require('./util')
var consoler = require('./consoler')
var Expression = require('./expression')
var keypath = require('./keypath')

function noop () {}
function _templateShouldUpdate() {
    var that = this
    return util.some(this._expressions, function(exp, index) {
        var pv = that.cache[index]
        var nv = that.$exec(exp)
        if (!nv[0]) {
            return !!that.$diff(pv, nv[1])
        }
    })
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
        bind: function (opt) {
            // if express is not empty will set innerHTML with expression result.
            // Otherwise render content template then set innerHTML.
            var reg = Expression.exprRegexp
            var template = this.$el.innerHTML

            if (!template) {
                template = ''
                consoler.warn('Content template should not empty of "' + conf.namespace + 'html".', this.$el)
            }

            var veilExpr = Expression.veil(template)

            var expressions = this._expressions = util.map(veilExpr.match(reg), function (exp) {
                return Expression.strip(exp)
            })
            var parts = util.split(veilExpr, reg)
            var cache = this.cache = new Array(expressions.length)
            var that = this
            var parent = this.$el.parentNode

            var before = this._before = document.createComment('<r-html>' + template)
            var after = this._after = document.createComment('</r-html>')
            this._tmpCon = document.createElement('div')
            this._container = document.createDocumentFragment()

            this._container.appendChild(before)
            this._container.appendChild(after)
            parent.replaceChild(this._container, this.$el)

            this.render = function () {
                // set value
                util.forEach(expressions, function(exp, index) {
                    var v = that.$exec(exp)
                    if (!v[0]) cache[index] = v[1]
                })
                // get content
                var frags = []
                util.forEach(parts, function(item, index) {
                    frags.push(item)
                    if (index < expressions.length) {
                        frags.push(cache[index])
                    }
                })
                var result = Expression.unveil(frags.join(''))
                that._tmpCon.innerHTML = result

                util.forEach(that._tmpCon.childNodes, function (node) {
                    that._container.appendChild(node)
                })
                var childRange = util.domRange(parent, before, after)

                util.forEach(childRange, function (child) {
                    parent.removeChild(child)
                })
                parent.insertBefore(that._container, after)
            }

        },
        shouldUpdate: function () {
            return _templateShouldUpdate.apply(this, arguments)
        },
        update: function() {
            this.render()
        },
        unbind: function () {
            this.render = noop
            this._expressions = this.cache = null
        }
    },
    'on': {
        multi: true,
        bind: function(evtType, handler, expression) {
            this._expr = expression
            this.type = evtType
        },
        update: function(handler) {
            this.unbind()

            var fn = handler
            if (util.type(fn) !== 'function')
                return consoler.warn('"' + conf.namespace + 'on" only accept function. {' + this._expr + '}')

            // this.fn = util.bind(fn, this.$vm)
            var that = this
            this.fn = function (e) {
                e.$currentTarget = that.$el
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
            this.$el.style && (this.$el.style[this.sheet] = next)
        }
    },
    'text': {
        bind: function (opt) {
            var replace = opt != 'inner'
            var reg = Expression.exprRegexp
            var expr = this.expr = this.$el.innerHTML
            var veilExpr = Expression.veil(expr)
            var expressions = this._expressions = util.map(veilExpr.match(reg), function (exp) {
                return Expression.strip(exp)
            })
            var parts = util.split(veilExpr, reg)
            var cache = this.cache = new Array(expressions.length)
            var that = this

            var $textNode 
            this.render = function () {
                // set value
                util.forEach(expressions, function(exp, index) {
                    var v = that.$exec(exp)
                    if (!v[0]) cache[index] = v[1]
                })
                // get content
                var frags = []
                util.forEach(parts, function(item, index) {
                    frags.push(item)
                    if (index < expressions.length) {
                        frags.push(cache[index])
                    }
                })
                var result = Expression.unveil(frags.join(''))
                if (replace) {
                    // TODO, Number Mobile bug, trying to using replaceChild
                    $textNode.nodeValue = result
                } else {
                    that.$el.innerText = result
                }
            }
            if (replace) {
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
            this._expressions = this.cache = this.textNode = null
        }
    },
    model: {
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
                    this.evtType = 'input'
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
                vm.$set(that._prop, that.$el[vType])
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
            $(this.$el).on(this.evtType, this._requestChange)

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
            this._requestChange = this._update = noop
        }
    }
}
