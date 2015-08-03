window._log = function () {
	var img = new Image()
	var msg = ''
	var len = arguments.length
	for (var i = 0; i < len; i ++) {
		msg += ' ' + arguments[i]
	}
	img.src = '/log?msg=' + msg + '&_t=' + (new Date).getTime()
	document.body.appendChild(img)
}
if (!window.console) window.console = {log: window._log, error: window._log, warn: window._log}
window.onerror = function (e, url, line) {
	_log(e, url, line)
}