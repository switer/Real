var conf = {
	namespace: 'r-',
	directiveSep: ';',
    directiveSep_regexp: /;/g,
    directiveKey_regexp: /^\s*['"]?[^:]+['"]?\s*:/m,
    mutable_dirtives: ['html', 'text']
	// 'catch': false // catch error when component instance or not
}
// IE8 hack
conf['CATCH'.toLowerCase()] = false
module.exports = conf