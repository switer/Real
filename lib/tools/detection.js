'use strict';

function detect() {
    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');

    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );

    return v > 4 ? v : undef;
}

var ie = detect()
var inp = document.createElement('input')
module.exports = {
	ie: ie,
	supportQuerySelector: document.querySelector && document.querySelectorAll,
    supportChangeEvent: 'onchange' in inp,
    supportKeyupEvent: 'onkeyup' in inp
}
