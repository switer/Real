'use strict'

var $ = require('./dm')
var conf = require('./conf')
var util = require('./util')
var consoler = require('./consoler')
var Expression = require('./expression')
function noop () {}
module.exports = {
    if: {
        bind: function (cnd) {
            var that = this
            var $el = this.$el
            var $parent = $el.parentNode
            var _mounted = true

            // this._valid = true
            // var mtdirts = conf.mutable_dirtives
            // if (util.some(mtdirts, function(name) {
            //     return util.hasAttribute($el, conf.namespace + name)
            // })) {
            //     that._valid = false
            //     return consoler.error('Root node for if should not mutable directive: ' + mtdirts.join(','))
            // }

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
}