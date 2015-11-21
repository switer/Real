'use strict';

var co = console
module.exports = {
	log: function () {
		co.log && co.log.apply(co, arguments)
	},
	error: function () {
		(co.error || this.log).apply(co, arguments)
	},
	warn: function () {
		(co.warn || this.log).apply(co, arguments)
	},
	info: function () {
		(co.info || this.log).apply(co, arguments)
	}
}