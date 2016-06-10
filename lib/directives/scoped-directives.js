'use strict'

function noop () {}
module.exports = {
    'if': {
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
}