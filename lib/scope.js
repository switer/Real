/**
 *  Scope abstraction is a colletor when compiler child template with scope 
 */

'use strict';

var util = require('./util')

function Scope (data, parent) {
    this.$data = data
    this.$directives = []
    this.$components = []
    this.$parent = parent || null
}

Scope.prototype.$update = function () {
    var args = arguments
    util.forEach(this.$directives, function (d) {
        d.$update.apply(d, args)
    })
    util.forEach(this.$components, function (child) {
        child.$update.apply(child, args)
    })
}
Scope.prototype.$removeChild = function (scope) {
    var i = util.indexOf(this.$components, scope)
    if (~i) {
        scope.$parent = null
        this.$components.splice(i, 1)
    }
    return this
}
Scope.prototype.$addChild = function (scope) {
    if (!~util.indexOf(this.$components, scope)) this.$components.push(scope)
    return this
}
Scope.prototype.$destroy = function () {
    /**
     * Release ref from parent scope
     */
    this.$parent && this.$parent.$removeChild(this)
    /**
     * destroy binded directives
     */
    scope.$directives.forEach(function (d) {
        d.$destroy()
    })
    /**
     * destroy children scopes
     */
    scope.$components.forEach(function (c) {
        c.$destroy()
    })
    return this
}

module.exports = Scope