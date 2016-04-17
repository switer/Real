'use strict';

var util = require('./util')
var is = require('./is')
var supportQuerySelector = require('./detection').supportQuerySelector

/**
 * Query all elements that inde "sels", and which element match scoped selector will be skipped.
 * All selector is attribute selector
 * @param {Element} el container element
 * @param {Array} scopedSels scope element's selector
 * @param {Array} seles selectors
 */
module.exports = function (el, scopedSels, sels) {
	if (!supportQuerySelector) {
		var _elements = {}
		util.walk(el, function (node) {
			if (!is.Element(node)) return false
			util.forEach(sels, function (sel) {
				if (util.hasAttribute(node, sel)) {
					if (!_elements[sel]) _elements[sel] = []
					_elements[sel].push(node)
				}
			})
			// checking for scoped attributes
			var isScoped
			util.forEach(scopedSels, function (scopedSel) {
				if (util.hasAttribute(node, scopedSel)) {
					isScoped = true
					if (!_elements[scopedSel]) _elements[scopedSel] = []
					_elements[scopedSel].push(node)
				}
			})
			if (isScoped) return false
			return true
		})
	}

	return function (sels) {
		if (supportQuerySelector) {
			return el.querySelectorAll(sels.join(','))
		} else {
			var nodeList = []
			var reduplicative = {}
			util.forEach(sels, function (selector) {
				var propName = selector.match(/^\[(.+?)\]$/)[1]
				if (reduplicative[propName]) return
				reduplicative[propName] = true

				var targets = _elements[propName] || []
				if (!nodeList.length) nodeList = nodeList.concat(targets)
				else {
					// reduce: remove reduplications
					util.forEach(targets, function (el) {
						if (!~util.indexOf(nodeList, el)) nodeList.push(el)
					})
				}
			})
			return nodeList
		}
	}
}