/**
 *  execute expression from template with specified Scope and ViewModel
 */

var __$util__ = require('./util')
var __$compile__ = require('./compile')
var __$compiledExprs___ = {}
/**
 *  Calc expression value
 */
function _execute($vm/*, expression, [label], [target]*/) {
    /**
     *  $scope is passed when call instance method $compile, 
     *  Each "scope" object maybe include "$parent, data, method" properties
     */
    var __$args__ = __$util__.slice(arguments)
    var __$expr__ = __$args__[1]
    var __$fn__ = __$compiledExprs___[__$expr__]
    try {
        if (!__$fn__) {
            __$fn__ = __$compiledExprs___[__$expr__] = __$compile__(__$expr__)
        }
        return [null, __$util__.immutable(__$fn__(
            __$util__.extend({}, $vm.$methods, $vm.$data
        )))]
    } catch (e) {
        __$args__[1] =  '. '+ __$args__[2] + '=' + (/^\{/.test(__$args__[1]) 
            ? __$args__[1]
            : '{' + __$args__[1] + '}') // expr
        
        var $consoler = require('./consoler')
        // __$args__[2] // label
        // __$args__[3] // target
        switch (e.name) {
            case 'ReferenceError':
                $consoler.warn(e.message + __$args__[1], '@VM: ', $vm)
                break
            default:
                $consoler.error(
                    (__$args__[2] ? '\'' + __$args__[2] + '\': ' : ''),
                    e.message + __$args__[1],
                    __$args__[3] || '',
                    '@VM: ',
                    $vm
                )
        }
        return [e]
    }
}
module.exports = _execute