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
    it('directive-expression', function () {
        var inited = false
        Reve.directive('num', {
            bind: function (v, expr) {
                inited = true
                assert.equal(v, 30)
                assert.equal(expr, 'num + 20')
            },
            update: function (v) {
                assert.equal(v, 30)
            }
        })
        var c = new Reve({
            data: function () {
                return {
                    num: 10
                }
            },
            template: '<img r-num="{num + 20}" />'
        })
        c.$update()
        assert(inited)
    })
    it('directive-expression:function', function () {
        var inited = false
        Reve.directive('func', {
            bind: function (v, expr) {
                inited = true
                assert.equal(v, 20)
                assert.equal(expr, 'add(num, 10)')
            },
            update: function (v) {
                assert.equal(v, 20)
            }
        })
        var c = new Reve({
            data: function () {
                return {
                    num: 10
                }
            },
            template: '<img r-func="{add(num, 10)}" />',
            methods: {
                add: function (num, addNum) {
                    return num + addNum
                }
            }
        })
        c.$update()
        assert(inited)
    })
    it('directive-expression:string', function () {
        var inited = false
        var updateTimes = 0
        var img = 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png'
        Reve.directive('lazy', {
            bind: function (src, expr) {
                inited = true
                assert.equal(src, img)
            },
            update: function (src) {
                updateTimes ++
                assert.equal(src, img)
            }
        })
        var c = new Reve({
            template: '<img r-lazy="' + img + '" />'
        })
        c.$update()
        assert(inited)
        assert(updateTimes, 1)
    })
    it('directive-expression:empty', function () {
        var inited = false
        Reve.directive('empty', {
            bind: function (v, expr) {
                assert.equal(v, '')
                assert.equal(expr, '')
            },
            update: function (v) {
                inited = true
                assert.equal(v, '')
            }
        })
        var c = new Reve({
            template: '<img r-empty="" />'
        })
        c.$update()
        assert(inited)
    })
})