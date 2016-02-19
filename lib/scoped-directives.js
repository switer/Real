'use strict'

var $ = require('./dm')
var conf = require('./conf')
var util = require('./util')
var consoler = require('./consoler')
var Expression = require('./expression')

module.exports = {
    'if': {
        bind: function () {
            var that = this
            this._tmpCon = document.createDocumentFragment()
            
            /**
             *  Initial unmount childNodes
             */
            util.forEach(util.slice(this.$el.childNodes), function () {
                that._tmpCon.appendChild(e)
            })

            /**
             *  Instance method
             */
            var mounted
            var floor.createComment('')
            this._mount = function () {
                if (mounted) return
                mounted = true

                // var $floor = this.$floor()
                // $floor.parentNode.insertBefore(this._tmpCon, $floor)

            }
            this._unmount = function () {
                if (!mounted) return
                mounted = false
                var $ceil = this.$ceil()
                var $floor = this.$floor()

                var that = this
                util.domRange($ceil.parentNode, $ceil, $floor)
                    .forEach(function(n) {
                        that._tmpCon.appendChild(n)
                    })
            }
        },
        unbind: function () {
            
        },
        update: function () {
            
        }
    }
}