var util = require('./tools/util')
var _execute = require('./tools/execute')
function noop () {}
var wid = 0
function Watcher(vm, expr, handler) {
	var w = this
	w.$id = ++wid
	w.$vm = vm
	w.$expr = expr
	w.$destroyed = false

	var prev = w.$exec(expr)[1]
	w.$update = function () {
		var r = w.$exec(expr)
		if (!r[0] && util.diff(prev, r[1])) {
			var last = prev
			prev = r[1]
			handler.call(w, prev, last)

		}
	}
	handler.call(w, prev)

}
Watcher.prototype.$exec = function (expr) {
    return _execute(this.$vm, expr)
}
Watcher.prototype.$destroy = function () {
    if (this.$destroyed) return
    this.$update = this.$destroy = this.$exec = noop
    this.$expr = ''
    this.$destroyed = true
}

module.exports = Watcher