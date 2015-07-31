'use strict';

var util = require('./util')
var is = require('./is')
var conf = require('./conf')
var supportQuerySelector = document.querySelector && document.querySelectorAll
function _hasAttribute (el, an) {
    if (el.hasAttribute) return el.hasAttribute(an)
    return el.getAttribute(an) !== null
}
module.exports = function (el, scopedSel, sels) {
	if (!supportQuerySelector) {
		var _elements = {}
		util.walk(el, function (node) {
			if (!is.Element(node)) return false
			util.forEach(sels, function (sel) {
				if (_hasAttribute(node, sel)) {
					if (!_elements[sel]) _elements[sel] = []
					_elements[sel].push(node)
				}
			})
			if (_hasAttribute(node, scopedSel)) {
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