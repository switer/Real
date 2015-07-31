'use strict';

module.exports = {
    Element: function(el) {
        return el.nodeType == 1 || el instanceof DocumentFragment
    },
    DOM: function (el) {
        return this.Element(el) || el instanceof Comment
    }
}