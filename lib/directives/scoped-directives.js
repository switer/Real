'use strict'

var $ = require('../tools/dm')
var util = require('../tools/util')
var keypath = require('../tools/keypath')
var consoler = require('../tools/consoler')
var conf = require('../conf')
var ds = {
    'for': {
        bind: function () {
            var $el = this._$el  = $(this.$el)
            this._key = $el.attr('key')
            if (!this._key) {
                consoler.error('Directive "' + conf.namespace + 'for" need specify "key" attribute.', this.$el)
            }
        },
        update: function (v) {
            if (!this._key) return
            
            if (util.type(v) == 'object') {

            } else if (util.type(v) == 'array') {

            }
        },
        unbind: function () {

        }
    }
}
var IF_KEY = 'IF'.toLowerCase()
ds[IF_KEY] = {
    bind: function () {
        var $el = this.$el
        var $parent = $el.parentNode
        var _mounted = true

        this._mount = function () {
            if (_mounted) return
            _mounted = true
            $parent.appendChild($el)
        }
        this._unmount = function () {
            if (!_mounted) return
            _mounted = false
            $parent.removeChild($el)
        }
    },
    unbind: function () {
        this._mount = this._unmount = noop
    },
    update: function (cnd) {
        if (!cnd) return this._unmount()
        else if (this._compiled) return this._mount()
        else {
            this._compiled = true
            this.$vm.$compile(this.$el)
            this._mount()
        }
    }
}
function noop () {}
module.exports = ds