'use strict'
var conf = require('./conf')
var Expression = require('./tools/expression')
var consoler = require('./tools/consoler')
var util = require('./tools/util')
var _execute = require('./tools/execute')
var _isExpr = Expression.isExpr
var _strip = Expression.strip
var _did = 0
var _diff = function () {
    return util.diff.apply(util, arguments)
}
function noop() {}
/**
 * Abstract direcitve
 * @param {Reve}    vm      Reve instance
 * @param {Element} tar     Target DOM of the direcitve
 * @param {Object}  def     Directive definition
 * @param {String}  name    Attribute name of the directive
 * @param {String}  expr    Attribute value of the directive
 */
function Directive(vm, tar, def, name, expr, scope) {
    var d = this
    var bindParams = []
    var isExpr = !!_isExpr(expr)
    var rawExpr = expr

    isExpr && (expr = _strip(expr))

    if (def.multi) {
        // extract key and expr from "key: expression" format
        var key
        var keyRE = /^[^:]+:/
        if (!keyRE.test(expr)) {
            return consoler.error('Invalid expression of "{' + expr + '}", it should be in this format: ' + name + '="{ key: expression }".')
        }
        expr = expr.replace(keyRE, function(m) {
            key = util.trim(m.replace(/:$/, ''))
            return ''
        })
        expr = util.trim(expr)

        bindParams.push(key)
    }

    d.$el = tar
    d.$vm = vm
    d.$id = _did++
    d.$expr = expr
    d.$rawExpr = rawExpr
    d.$name = name
    d.$destroyed = false
    d.$scoped = !!def.scoped
    d.$scope = scope
    // updateId is used to update directive/component which DOM match the "updateid"
    d.$updateId = util.getAttribute(tar, conf.namespace + 'updateid') || ''
    this._$unbind = def.unbind

    var bind = def.bind
    var upda = def.update
    var shouldUpdate = def.shouldUpdate
    var afterUpdate = def.afterUpdate
    var isConst = def.constant
    var prev

    // set properties
    util.objEach(def, function(k, v) {
        d[k] = v
    })

    this.$diff = _diff
    /**
     *  update handler
     */
    function _update() {
        if (d.$destroyed) return consoler.warn('Directive "' + name + '" already destroyed.')

        var hasDiff = false
        // empty expression also can trigger update, such `r-text` directive
        if (!isExpr || isConst) {
            if (shouldUpdate && shouldUpdate.call(d)) {
                upda && upda.call(d)
            }
        } else {
            var nexv = d.$exec(expr) // [error, result]
            var r = nexv[1]

            if (!nexv[0] && util.diff(r, prev)) {
                hasDiff = true

                // shouldUpdate(nextValue, preValue)
                if (!shouldUpdate || shouldUpdate.call(d, r, prev)) {
                    var p = prev
                    prev = r
                    // update(nextValue, preValue)
                    upda && upda.call(d, r, p)
                }
            }
        }
        afterUpdate && afterUpdate.call(d, hasDiff)
    }

    /**
     *  If expression is a string iteral, use it as value
     */
    var hasError
    if (isExpr && !isConst) {
        prev =  d.$exec(expr)
        hasError = prev[0]
        prev = prev[1]
    } else {
        prev = rawExpr
    }
    bindParams.push(prev)
    bindParams.push(expr)
    d.$update = _update
    /**
     * bind([propertyName, ]expression-value, expression)
     * propertyName will be passed if and only if "multi:true"
     */
    bind && bind.apply(d, bindParams)
    // error will stop update
    !hasError && upda && upda.call(d, prev)
}
/**
 *  execute wrap with directive name and current ViewModel
 */
Directive.prototype.$exec = function (expr) {
    return _execute(this.$vm, expr, this.$name)
}
Directive.prototype.$destroy = function () {
    if (this.$destroyed) return

    this._$unbind && this._$unbind.call(this)
    this.$update = this.$destroy = this.$exec = noop
    this.$el = null
    this.$destroyed = true
}

module.exports = Directive