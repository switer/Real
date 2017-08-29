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
		pending = false
		var flushTask = tasks
		tasks = []
		try {
			fn && fn()
		} finally {
			util.forEach(flushTask, function (t) {
				t && t()				
			})
		}
	}, 0)
}