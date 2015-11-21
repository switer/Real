describe('# Directive', function () {
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
        var results = [20, 30]
        var index = 0
        var updated = false
        Reve.directive('func', {
            bind: function (v, expr) {
                inited = true
                assert.equal(v, results[0])
                assert.equal(expr, 'add(num, 10)')
            },
            update: function (v) {
                updated = true
                assert.equal(v, results[index++])
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
        assert(inited)
        assert(updated)
        c.$data.num = 20
        c.$update()
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
    it('directive-methods:shoudUpdate', function () {
        var shouldUpdated = false
        var index = 0
        Reve.directive('delta', {
            shouldUpdate: function (next, pre) {
                assert.equal(pre, 1)
                assert.equal(next, 2)
                shouldUpdated = true
                return false
            },
            update: function (v) {
                index++ && assert(false, 'should not update.')
            }
        })
        var c = new Reve({
            data:  {
                num: 1
            },
            template: '<span r-delta="{num}"></span>'
        })
        c.$data.num ++
        c.$update()
        assert(shouldUpdated, 'shouldUpdated should be called.')
    })
    it('directive-methods:unbind', function (done) {
        var unbind = false
        Reve.directive('unbind', {
            bind: function () {
            },
            unbind: function () {
                assert(!!this.$el, 'Before destroyed, $el should be exist')
                setTimeout(function () {
                    unbind = true
                    assert(!this.$el, 'After destroyed, $el should not be exist')
                })
            }
        })
        var c = new Reve({
            data:  {
                num: 1
            },
            template: '<span r-unbind="{num}"></span>'
        })
        c.$destroy()
        setTimeout(function () {
            assert(unbind, '"unbind" of directive should be call when the ViewModel be destroyed.')
            done()
        })
    })
})

describe('# Directive build-in', function () {
    it('r-attr', function () {
        var c = new Reve({
            data: {
                attr: ''
            },
            template: '<div r-attr="{data-attr: attr}"></div>'
        })
        var tar = c.$el.querySelector('div')
        assert(tar.hasAttribute('data-attr'))
        assert.equal(tar.getAttribute('data-attr'), '')
        c.$data.attr = undefined
        c.$update()
        assert(!tar.hasAttribute('data-attr'), '"undefined" value will remove the attribute.')
        c.$data.attr = 'real'
        c.$update()
        assert.equal(tar.getAttribute('data-attr'), 'real')
    })
    it('r-class', function () {
        var c = new Reve({
            data: {
                clazz: ''
            },
            template: '<div r-class="{clazz: clazz}"></div>'
        })
        var tar = c.$el.querySelector('div')
        assert(!Reve.$(tar).hasClass('clazz'))
        c.$set('clazz', true)
        assert(Reve.$(tar).hasClass('clazz'))
    })
    it('r-html', function () {
        var c = new Reve({
            data: {
                html: ''
            },
            template: '<div r-html="{html}"></div>'
        })
        var tar = c.$el.querySelector('div')
        assert.equal(tar.innerHTML, '')
        c.$set('html', '<div class="name"></div>')
        assert(!!tar.querySelector('.name'))
        c.$set('html', undefined)
        assert.equal(tar.innerHTML, '', '"undefined" value should equal to empty string')
        c.$set('html', null)
        assert.equal(tar.innerHTML, '', 'Set innerHTML with "null" should be empty string')
        c.$set('html', 0)
        assert.equal(tar.innerHTML, '0')
        c.$set('html', false)
        assert.equal(tar.innerHTML, 'false')
    })
    it('r-on', function (done) {
        var c = new Reve({
            data: {},
            template: '<div r-on="{click: onClick}"></div>',
            methods: {
                onClick: function () {
                    done()
                }
            }
        })
        var tar = c.$el.querySelector('div')
        var event = document.createEvent('Event')
        event.initEvent('click', true, true);
        tar.dispatchEvent(event)
    })
    it('r-show', function () {
        var c = new Reve({
            data: {
                show: false
            },
            template: '<div r-show="{show}"></div>'
        })
        var tar = c.$el.querySelector('div')
        assert.equal(tar.style.display, 'none')
        c.$set('show', true)
        assert.equal(tar.style.display, '')
    })
    it('r-style', function () {
        var c = new Reve({
            data: {
                display: 'block',
                backgroundColor: 'blue'
            },
            template: '<div r-style="{display: display; backgroundColor: backgroundColor}"></div>'
        })
        var tar = c.$el.querySelector('div')
        assert.equal(tar.style.display, 'block')
        assert.equal(tar.style.backgroundColor, 'blue')
        c.$set('display', 'none')
        c.$set('backgroundColor', 'red')
        assert.equal(tar.style.display, 'none')
        assert.equal(tar.style.backgroundColor, 'red')
    })
    it('r-text', function () {
        var c = new Reve({
            data: {
                name: '',
                author: ''
            },
            template: '<span r-text>{name},author: {author}</span>'
        })
        assert.equal(c.$el.innerText, ',author: ')
        c.$set({
            name: 'real',
            author: 'switer'
        })
        assert.equal(c.$el.innerText, 'real,author: switer')
    })
})
