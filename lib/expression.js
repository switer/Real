'use strict';

var util = require('./util')

function _isExpr(c) {
    return c ? !!util.trim(c).match(/^\{[\s\S]*?\}$/m) : false
}
function _strip (expr) {
    return util.trim(expr)
            .match(/^\{([\s\S]*)\}$/m)[1]
            .replace(/^- /, '')
}
module.exports = {
	isExpr: _isExpr,
	strip: _strip,
    exprRegexp: /\{[\s\S]*?\}/g,
	veil: function (expr) {
        return expr.replace(/\\{/g, '\uFFF0')
                   .replace(/\\}/g, '\uFFF1')
    },
    unveil: function (expr) {
        return expr.replace(/\uFFF0/g, '\\{')
                   .replace(/\uFFF1/g, '\\}')
    }
}