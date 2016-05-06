/**
 * Console shim for IE8 below
 */
'use strict';

var co = window.console
var isCompeletedSupport = co && co.log && co.error && co.warn && co.info
function log(type, args) {
	// IE8 below console could be not defined, if Devtool panel is not opened.
	if (!co) return

	var printer = co[type]
	if (printer && typeof printer.apply == 'function') {
		printer.apply(co, args)
	} else {
		var logs = []
		logs.push('[' + type.toUpperCase() + ']')
		for (var i = 0; i < args.length; i ++) {
			logs.push(args[i])
		}
		co.log(logs.join(' '))
	}
}
var logger = isCompeletedSupport ? co : {
	log: function () {
		log('log', arguments)
	},
	error: function () {
		log('error', arguments)
	},
	warn: function () {
		log('warn', arguments)
	},
	info: function () {
		log('info', arguments)
	}
}
// custom error trace methods
logger.errorTrace = function (error) {
	if (!co) return

	if (!co.groupCollapsed || !co.groupEnd) {
		logger.log(error)
	} else if (!error.stack) {
		logger.error(error.message || error)
	} else {
		co.groupCollapsed('%c' + error.message, 'color: white;background:red')
		var lines = error.stack.split('\n')
		lines.shift()
		for (var i =0; i < lines.length; i++) {
			co.log(lines[i])
		}
		co.groupEnd()
	}
}

module.exports = logger