'use strict';

var E = window.HTMLElement ? HTMLElement : Element
module.exports = {
    Element: function(el) {
        return el instanceof E || el instanceof DocumentFragment
    },
    DOM: function (el) {
        return this.Element(el) || el instanceof Comment
    }
}