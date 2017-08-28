var tasks = []
var pending
var util = require('./util')
module.exports = function (fn) {
	if (pending) {
		tasks.push(fn)
		return
	}
	pending = true
	setTimeout(function () {
		var flushTask = tasks
		tasks = []
		try {
			fn && fn()
			util.forEach(flushTask, function (t) {
				t && t()				
			})
		} finally {
			pending = false
		}
	}, 0)
}