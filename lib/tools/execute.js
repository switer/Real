/**
 *  execute expression from template with specified Scope and ViewModel
 */

var __$util__ = require('./util')
/**
 *  Calc expression value
 */
function _execute($vm/*, expression, [label], [target]*/) {
    /**
     *  $scope is passed when call instance method $compile, 
     *  Each "scope" object maybe include "$parent, data, method" properties
     */
    var $scope = __$util__.extend({}, $vm.$methods, $vm.$data)
    var __$args__ = __$util__.slice(arguments)
    try {
        return [null, __$util__.immutable(eval('with($scope){(%s)}'.replace('%s', __$args__[1])))]
    } catch (e) {
        __$args__[1] =  '. '+ __$args__[2] + '=' + (/^\{/.test(__$args__[1]) 
            ? __$args__[1]
            : '{' + __$args__[1] + '}') // expr
        
        var $consoler = require('./consoler')
        // __$args__[2] // label
        // __$args__[3] // target
        switch (e.name) {
            case 'ReferenceError':
                $consoler.warn(e.message + __$args__[1])
                break
            default:
                $consoler.error(
                    (__$args__[2] ? '\'' + __$args__[2] + '\': ' : ''),
                    e.message + __$args__[1],
                    __$args__[3] || ''
                )
        }
        return [e]
    }
}
module.exports = _execute