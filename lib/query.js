'use strict';

var util = require('./util')
var is = require('./is')
var conf = require('./conf')
// var supportQuerySelector = document.querySelector && document.querySelectorAll
var supportQuerySelector = false

module.exports = function (el, scopedSel, sels) {
	if (!supportQuerySelector) {
		var _elements = {}
		util.walk(el, function (node) {
			if (!is.Element(node)) return false
			util.forEach(sels, function (sel) {
				if (node.hasAttribute(sel)) {
					if (!_elements[sel]) _elements[sel] = []
					_elements[sel].push(node)
				}
			})
			if (node.hasAttribute(scopedSel)) {
				if (!_elements[scopedSel]) _elements[scopedSel] = []
				_elements[scopedSel].push(node)
				return false
			}
			return true
		})
	}


	return function (selector) {
		if (supportQuerySelector) return el.querySelectorAll(selector)
		selector = selector.match(/^\[(.+?)\]$/)[1]
		return _elements[selector] || []
	}
}