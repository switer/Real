'use strict';

var co = console
function log(type, args) {
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
module.exports = {
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