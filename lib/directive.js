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
var keyParseCaches = {}
function Directive(vm, tar, def, name, expr, scope) {
    var d = this
    var bindParams = []
    var isExpr = !!_isExpr(expr)
    var rawExpr = expr

    isExpr && (expr = _strip(expr))

    if (def.multi) {
        // extract key and expr from "key: expression" format
        var key
        var cached = keyParseCaches[expr]
        if (cached) {
            key = cached.key
            expr = cached.expr
        } else {
            var keyMatched
            expr = expr.replace(/^\s*['"](.+?)['"]\s*:/m, function(m, k) {
                keyMatched = true
                key = k
                return ''
            })
            if (!keyMatched) {
                expr = expr.replace(/^([^:]+):/m, function(m, k) {
                    key = util.trim(k)
                    return ''
                })
            }
            expr = util.trim(expr)
            keyParseCaches[expr] = {
                key: key,
                expr: expr
            }
        }
        bindParams.push(key)
    }

    d.$el = tar
    d.$vm = vm
    d.$id = ++_did
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
    var mutable = !!def.mutable
    var needReady = def.needReady
    var prev

    // set properties
    util.objEach(def, function(k, v) {
        d[k] = v
    })
    // support custom diff method
    this.$diff = _diff
    var customDiff = def.diff
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
            var nexv = d.$exec(expr, mutable || !customDiff) // [error, result]
            var r = nexv[1]
            var payload = {}
            if (!nexv[0]) {
                if (customDiff) {
                    hasDiff = customDiff.call(d, r, prev)
                } else {
                    r = util.cloneAndDiff(r, prev, payload)
                    hasDiff = !!payload.diff
                }
                if (hasDiff && (!shouldUpdate || shouldUpdate.call(d, r, prev))) {
                    var p = prev
                    prev = r
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
        prev =  d.$exec(expr, mutable)
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
    var unwatch
    function run () {
        unwatch && unwatch()
        bind && bind.apply(d, bindParams)
        // error will stop update
        !hasError && upda && upda.call(d, prev)
    }
    if (needReady) {
        unwatch = vm.$on('ready', run)
    } else {
        run()
    }
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