'use strict';

function detect() {
    var undef
    var v = 3
    var div = document.createElement('div')
    var all = div.getElementsByTagName('i')

    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    )
    return v > 4 ? v : undef;
}

var ie = detect()
module.exports = {
	ie: support,
	supportQuerySelector: document.querySelector && document.querySelectorAll
}
