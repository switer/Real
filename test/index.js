'use strict';

var assert = require('assert')
var equal = assert.equal
var util = require('../lib/util')

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