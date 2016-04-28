'use strict';

module.exports = {
    Element: function(el) {
    	// 1: ELEMENT_NODE, 11: DOCUMENT_FRAGMENT_NODE
        return el && (el.nodeType == 1 || el.nodeType == 11)
    },
    Fragment: function(el) {
        // 11: DOCUMENT_FRAGMENT_NODE
        return el && el.nodeType == 11
    },
    DOM: function (el) {
    	// 8: COMMENT_NODE
        return el && (this.Element(el) || el.nodeType == 8)
    }
}