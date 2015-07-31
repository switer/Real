/**
 *  Global Build-in Directives
 */

'use strict';

var $ = require('./dm')
var conf = require('./conf')
var util = require('./util')

function warn () {
    (console.warn || console.log).apply(console, arguments)
}

module.exports = {
    'attr': {
        multi: true,
        bind: function(attname) {
            this.attname = attname
            this._$el = $(this.$el)
        },
        update: function(next) {
            if (!next && next !== '') {
                this._$el.removeAttr(this.attname)
            } else {
                this._$el.attr(this.attname, next)
            }
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
        }
    },
    'html': {
        update: function(nextHTML) {
            this.$el.innerHTML = nextHTML
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
                return warn('"' + conf.namespace + 'on" only accept function. {' + this._expr + '}')

            this.fn = util.bind(fn, this.$vm)
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
    }
}
