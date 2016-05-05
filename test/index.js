'use strict';

global.document = {
    createElement: function () {
        return {
            getElementsByTagName: function () {
                return []
            }
        }
    }
}
var assert = require('assert')
var equal = assert.equal
var util = require('../lib/tools/util')
var keypath = require('../lib/tools/keypath')

describe('#lib/util', function() {
    it('immutable', function () {
        var a = {name: 'real'}
        var b = util.immutable(a)

        a.name = 'real2'
        equal(a.name, 'real2')
        equal(b.name, 'real')
    })
    it('diff', function () {
        var a = {items: [{v: 1}, {v: 2}, {v: 3}]}
        var b = util.immutable(a)
        var c = util.immutable(a)
        assert(!util.diff(a, b))
        b.items.pop()
        assert(util.diff(a, b))
        c.items[2].v = 0
        assert(util.diff(a, c))
    })
})
describe('#lib/keypath', function () {
    it('normalize', function () {
        equal(keypath.normalize('person.info[name][0].first'), 'person.info.name.0.first')
    })
    it('set', function () {
        var a = {
            items: [{
                name: 'real'
            }]
        }
        keypath.set(a, 'items[0].name', 'real2')
        equal(a.items[0].name, 'real2')
        try {
            keypath.set(a, 'items[0].name.first', 'real')
        } catch(e) {
            return assert(true, 'Can not set value to non-object')
        }
        assert(false)
    })
})