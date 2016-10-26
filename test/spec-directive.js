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
    it('directive(name, { scoped: true })', function () {
        var Follow = Reve.component('c-follow', {
            data: function () {
                return {
                    follow: 'Default'
                }
            },
            template: '<div>Follow</div>'
        })
        Reve.directive('follow', {
            scoped: true,
            bind: function () {
                new Follow({
                    el: this.$el,
                    data: {
                        follow: 'From directive'
                    },
                    notemplate: true
                })
            }
        })
        var c = new Reve({
            template: '<div r-follow class="follow" r-attr="{title: follow}"><span r-text>{follow}</span></div>'
        })
        assert.equal(c.$el.querySelector('.follow').getAttribute('title'), 'From directive')
        assert.equal(c.$el.querySelector('.follow').innerText, 'From directive')
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
    it('directive-methods:afterUpdate', function () {
        var afterUpdated = false
        var index = 0
        Reve.directive('afterupdate', {
            afterUpdate: function (diff) {
                afterUpdated = true
                assert(diff)
            },
            update: function (v) {
                index++ && assert.equal(v, 2)
            }
        })
        var c = new Reve({
            data:  {
                num: 1
            },
            template: '<span r-afterupdate="{num}"></span>'
        })
        c.$data.num ++
        c.$update()
        assert(afterUpdated, 'afterUpdate should be called.')
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

describe('# Build-in Directives', function () {
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
            template: '<div r-html>{html}</div>'
        })
        var EMPTY = '<!--<r-html>{html}--><!--</r-html>-->'
        var tar = c.$el
        assert.equal(tar.innerHTML, EMPTY)
        c.$set('html', '<div class="name"></div>')
        assert(!!tar.querySelector('.name'))
        c.$set('html', undefined)
        assert.equal(tar.innerHTML, EMPTY, '"undefined" value should equal to empty string')
        c.$set('html', null)
        assert.equal(tar.innerHTML, EMPTY, 'Set innerHTML with "null" should be empty string')
        c.$set('html', 0)
        assert.equal(tar.innerHTML, '<!--<r-html>{html}-->0<!--</r-html>-->')
        c.$set('html', false)
        assert.equal(tar.innerHTML, '<!--<r-html>{html}-->false<!--</r-html>-->')
    })
    it('r-html:multiple', function () {
        var c = new Reve({
            data: {
                name: '<span>real</span>',
                sex: '<div>male</div>'
            },
            template: '<div r-html>{name}</div><div r-html>{sex}</div>'
        })
        var tar = c.$el
        assert.equal(tar.innerHTML, '<!--<r-html>{name}--><span>real</span><!--</r-html>--><!--<r-html>{sex}--><div>male</div><!--</r-html>-->')
        c.$set({
            name: 'real',
            sex: 'male'
        })
        assert.equal(tar.innerHTML, '<!--<r-html>{name}-->real<!--</r-html>--><!--<r-html>{sex}-->male<!--</r-html>-->')
    })
    it('r-html:inner', function () {
        var c = new Reve({
            data: {
                html: ''
            },
            template: '<div r-html="inner">Render to:<span>{html}</span></div>'
        })
        var tar = c.$el.querySelector('div')
        assert.equal(tar.innerHTML, 'Render to:<span></span>')
        c.$set('html', '<div class="name"></div>')
        assert(!!tar.querySelector('span .name'))
        c.$set('html', undefined)
        assert.equal(tar.innerHTML, 'Render to:<span></span>')
        c.$set('html', null)
        assert.equal(tar.innerHTML, 'Render to:<span></span>')
        c.$set('html', 0)
        assert.equal(tar.innerHTML, 'Render to:<span>0</span>')
        c.$set('html', false)
        assert.equal(tar.innerHTML, 'Render to:<span>false</span>')
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
    it('r-on:vchange', function (done) {
        var c = new Reve({
            data: {},
            template: '<input type="text" r-on="{vchange: onChange}"/>',
            methods: {
                onChange: function () {
                    done()
                }
            }
        })
        var inp = c.$el.querySelector('input')
        dispatchEvent(inp, 'change')
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
    it('r-show:true', function () {
        var c = new Reve({
            data: {
                show: true
            },
            template: '<div r-show="{show}"></div>'
        })
        var tar = c.$el.querySelector('div')
        assert.equal(tar.style.display, '')
        c.$set('show', false)
        assert.equal(tar.style.display, 'none')
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
                author: '',
                num: 0
            },
            template: '<span r-text>{name},author: {author}</span><span r-text>{num}</span>'
        })
        assert.equal(c.$el.innerHTML, ',author: 0')
        c.$set({
            name: 'real',
            author: 'switer',
            num: 1
        })
        assert.equal(c.$el.innerHTML, 'real,author: switer1')
    })
    it('r-text:inner', function () {
        var c = new Reve({
            data: {
                name: '',
                author: '',
                num: 0
            },
            template: '<span r-text="inner">{name},author: {author}</span><span r-text>{num}</span>'
        })
        assert.equal(c.$el.innerHTML, '<span>,author: </span>0')
        c.$set({
            name: 'real',
            author: 'switer',
            num: 1
        })
        assert.equal(c.$el.innerHTML, '<span>real,author: switer</span>1')
    })
    it('r-text:html-entities', function () {
        var c = new Reve({
            data: {
                text: '&lt;Hello World&gt;',
            },
            template: '<span r-text>{"&lt;Hello World&gt;"}</span><span r-text>{text}</span>'
        })
        assert.equal(c.$el.childNodes[0].nodeValue.toString(), '<Hello World>')
        assert.equal(c.$el.childNodes[1].nodeValue.toString(), '<Hello World>')
    })

    function dispatchEvent(element, type) {
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(type, false, true);
            element.dispatchEvent(evt);
        }
        else
            element.fireEvent("on" + type);
    }
    it('r-model', function (){
        var c = new Reve({
            data: {
                val: ''
            },
            template: '<input type="text" r-model="val"/>'
        })
        var inp = c.$el.querySelector('input')
        inp.value = 'real'
        dispatchEvent(inp, 'change')
        assert.equal(c.$data.val, 'real')

        c.$set('val', 'real2')
        assert.equal(inp.value, 'real2')
    })
    it('r-if:default unmount', function (){
        var c = new Reve({
            template: '<div><div r-if="{show}" class="if-class"><span r-text>{title}</span></div></div>',
            data: function() {
                return {
                    show: false,
                    title: ''
                }
            }
        })
        assert(!c.$el.querySelector('.if-class'))
        c.$set('show', true)
        var target = c.$el.querySelector('.if-class')
        assert(!!target)
        assert.equal(target.innerText, '')
        c.$set('title', 'real')
        assert.equal(target.innerText, 'real')

        // update child directive when unmount
        c.$set('show', false)
        assert(!c.$el.querySelector('.if-class'))
    })
    it('r-if:default mounted', function (){
        var c = new Reve({
            template: '<div><div r-if="{show}" class="if-class"><span r-text>{title}</span></div></div>',
            data: function() {
                return {
                    show: true,
                    title: 'real'
                }
            }
        })
        var target = c.$el.querySelector('.if-class')
        assert(!!target)
        assert.equal(target.innerText, 'real')
    })
    it('r-if:default mounted & root', function (){
        var c = new Reve({
            template: '<div r-if="{show}" class="if-class"><span r-text>{title}</span></div>',
            data: function() {
                return {
                    show: true,
                    title: 'real'
                }
            }
        })
        var target = c.$el.querySelector('.if-class')
        assert(!!target)
        assert.equal(target.innerText, 'real')
    })
    it('r-props', function (){
        var el = document.createElement('div')
        el.setAttribute('r-props', '{name: "abc"}')
        el.innerHTML = 
        '<div r-component="c-props"\
            r-data="{ key1: \'interface\'; }" \
            r-props="{ key1: \'prop1frominerface\';key4: \'propfromInterface\'}" \
            r-replace="true"> </div>'

        Reve.component('c-props', {
            data: {
                key1: 'data',
                key2: 'data',
                key3: 'data'
            },
            ready: function () {
                assert.equal(this.$data.key1, 'interface')
                assert.equal(this.$data.key2, 'props')
                assert.equal(this.$data.key3, 'data')
                assert.equal(this.$data.key4, 'propfromInterface')
            },
            template: '<div r-props="{key1: \'props\';key2: \'props\'}"></div>'
        })
        var c = new Reve({
            el: el
        })
        assert.equal(c.$data.name, 'abc')
    })
    it('r-notemplate', function (){
        Reve.component('c-notemplate', {
            template: '<span r-component="c-notemplate" r-notemplate="true"><div class="chil-inner"></div></span>'
        })
        var c = new Reve({
            template: '<div><span r-component="c-notemplate"  r-notemplate="true"><div class="parent-inner"></div></span></div>'
        })
        assert(!!c.$el.querySelector('.parent-inner'))
    })
})
