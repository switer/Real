describe('Global API', function () {
    it('directive(name, def)', function () {
        var inited = false
        Reve.directive('d', {
            bind: function (v, expr) {
                inited = true
                assert.equal(v, 'directive')
                assert.equal(expr, 'name')
            },
            update: function (v) {
                assert.equal(v, 'directive')
            }
        })
        new Reve({
            data: {
                name: 'directive'
            },
            template: '<div r-d="{name}"></div>'
        })
        assert(inited)
    })
    it('directive(name, { multi: true })', function () {
        var inited = false
        Reve.directive('d', {
            multi: true,
            bind: function (p, v, expr) {
                inited = true
                assert.equal(p, 'user')
                assert.equal(v, 'switer')
                assert.equal(expr, 'name')
            },
            update: function (v) {
                assert.equal(v, 'switer')
            }
        })
        new Reve({
            data: {
                name: 'switer'
            },
            template: '<div r-d="{user: name}"></div>'
        })
        assert(inited)
    })
})