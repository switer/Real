'use strict';

var util = require('./util')
/**
 *  normalize all access ways into dot access
 *  @example "person.books[1].title" --> "person.books.1.title"
 */
function _keyPathNormalize(kp) {
    return String(kp).replace(/\[([^\[\]]+)\]/g, function(m, k) {
        return '.' + k.replace(/^["']|["']$/g, '')
    })
}
function _isNon (o) {
    return util.isUndef(o) || o === null
}
/**
 *  set value to object by keypath
 */
function _set(obj, keypath, value) {
    var parts = _keyPathNormalize(keypath).split('.')
    var last = parts.pop()
    var dest = obj
    var hasError
    var errorInfo
    util.some(parts, function(key) {
        var t = util.type(dest)
        if (t != 'object' && t != 'array') {
            hasError = true
            errorInfo = [key, dest]
            return true
        }
        dest = dest[key]
    })
    // set value
    if (!hasError) {
        if (util.type(dest) != 'object' && util.type(dest) != 'array') {
            hasError = true
            errorInfo = [last, dest]
        } else {
            dest[last] = value
            return obj
        }
    }
    throw new Error('Can\' not access "' + errorInfo[0] + '" of "'+ errorInfo[1] + '" when set value of "' + keypath + '"')
}
function _get(obj, keypath) {
    var parts = _keyPathNormalize(keypath).split('.')
    var dest = obj

    util.some(parts, function(key) {
        if (_isNon(dest)) {
            dest = void(0)
            return true
        }
        dest = dest[key]
    })
    return dest
}
module.exports = {
    normalize: _keyPathNormalize,
    set: _set,
    get: _get
}