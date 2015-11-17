/**
 *  execute expression from template with specified Scope and ViewModel
 */

var util = require('./util')
/**
 *  Calc expression value
 */
function _execute($vm/*, expression, [label], [target]*/) {
    /**
     *  $scope is passed when call instance method $compile, 
     *  Each "scope" object maybe include "$parent, data, method" properties
     */
    var $scope = util.extend({}, $vm.$methods, $vm.$data)
    var __$args__ = util.slice(arguments)
    try {
        return [null, util.immutable(eval('with($scope){(%s)}'.replace('%s', __$args__[1])))]
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