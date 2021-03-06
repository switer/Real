describe('# Directive', function () {
    it('directive(name, def)', function () {
        var inited = false
        Real.directive('d', {
            bind: function (v, expr) {
                inited = true
                assert.equal(v, 'directive')
                assert.equal(expr, 'name')
            },
            update: function (v) {
                assert.equal(v, 'directive')
            }
        })
        new Real({
            data: {
                name: 'directive'
            },
            template: '<div r-d="{name}"></div>'
        })
        assert(inited)
    })
    it('directive(name, { multi: true })', function () {
        var inited = false
        Real.directive('d', {
            multi: true,
            bind: function (key, v, expr) {
                inited = true
                assert.equal(key, 'user')
                assert.equal(v, 'switer')
                assert.equal(expr, 'name')
            },
            update: function (v) {
                assert.equal(v, 'switer')
            }
        })
        Real.directive('e', {
            multi: true,
            bind: function (key, v, expr) {
                inited = true
                assert.equal(key, 'xlink:href')
                assert.equal(v, 'switer')
                assert.equal(expr, 'name')
            },
            update: function (v) {
                assert.equal(v, 'switer')
            }
        })
        new Real({
            data: {
                name: 'switer'
            },
            template: '<div r-d="{user: name}" r-e="{\'xlink:href\': name}"></div>'
        })
        assert(inited)
    })

    it('directive(name, { scoped: true })', function () {
        var Follow = Real.component('c-follow', {
            data: function () {
                return {
                    follow: 'Default'
                }
            },
            template: '<div>Follow</div>'
        })
        Real.directive('follow', {
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
        var c = new Real({
            template: '<div r-follow class="follow" r-attr="{title: follow}"><span r-text>{follow}</span></div>'
        })
        assert.equal(c.$el.querySelector('.follow').getAttribute('title'), 'From directive')
        assert.equal(c.$el.querySelector('.follow').innerText, 'From directive')
    })
    it('directive(name, { needReady: true })', function () {
        var ready = false
        Real.directive('d1', {
            needReady: true,
            bind: function () {
                assert.equal(ready, true, 'directive should call after ready')
            }
        })
        Real.directive('d2', {
            bind: function () {
                assert.equal(ready, false, 'directive should call before ready')
            }
        })
        new Real({
            data: {},
            template: '<div r-d1="{0}" r-d2="{0}"></div>',
            ready: function () {
                ready = true
            }
        })
    })
    it('directive-expression', function () {
        var inited = false
        Real.directive('num', {
            bind: function (v, expr) {
                inited = true
                assert.equal(v, 30)
                assert.equal(expr, 'num + 20')
            },
            update: function (v) {
                assert.equal(v, 30)
            }
        })
        var c = new Real({
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
        Real.directive('func', {
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
        var c = new Real({
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
        Real.directive('lazy', {
            bind: function (src) {
                inited = true
                assert.equal(src, img)
            },
            update: function (src) {
                updateTimes ++
                assert.equal(src, img)
            }
        })
        var c = new Real({
            template: '<img r-lazy="' + img + '" />'
        })
        c.$update()
        assert(inited)
        assert(updateTimes, 1)
    })
    it('directive-expression:empty', function () {
        var inited = false
        Real.directive('empty', {
            bind: function (v, expr) {
                assert.equal(v, '')
                assert.equal(expr, '')
            },
            update: function (v) {
                inited = true
                assert.equal(v, '')
            }
        })
        var c = new Real({
            template: '<img r-empty="" />'
        })
        c.$update()
        assert(inited)
    })
    it('directive-methods:shoudUpdate', function () {
        var shouldUpdated = false
        var index = 0
        Real.directive('delta', {
            shouldUpdate: function (next, pre) {
                assert.equal(pre, 1)
                assert.equal(next, 2)
                shouldUpdated = true
                return false
            },
            update: function () {
                index++ && assert(false, 'should not update.')
            }
        })
        var c = new Real({
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
        Real.directive('afterupdate', {
            afterUpdate: function (diff) {
                afterUpdated = true
                assert(diff)
            },
            update: function (v) {
                index++ && assert.equal(v, 2)
            }
        })
        var c = new Real({
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
        Real.directive('unbind', {
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
        var c = new Real({
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
        var c = new Real({
            data: {
                attr: ''
            },
            template: '<div r-attr="{data-attr: attr; href: \'javascript:;\'}"></div>'
        })
        var tar = c.$el.querySelector('div')
        assert(tar.hasAttribute('data-attr'))
        assert.equal(tar.getAttribute('data-attr'), '')
        assert.equal(tar.getAttribute('href'), 'javascript:;')
        c.$data.attr = undefined
        c.$update()
        assert(!tar.hasAttribute('data-attr'), '"undefined" value will remove the attribute.')
        c.$data.attr = 'real'
        c.$update()
        assert.equal(tar.getAttribute('data-attr'), 'real')
    })
    it('r-src', function () {
        var c = new Real({
            data: {
                src: '/'
            },
            template: '<img r-src="{src}" />'
        })
        var tar = c.$el.querySelector('img')
        assert.equal(tar.getAttribute('src'), '/')
        c.$data.src = ''
        c.$update()
        assert.equal(tar.getAttribute('src'), '')
    })
    it('r-href', function () {
        var c = new Real({
            data: {
                href: 'javascript:;'
            },
            template: '<a r-href="{href}" />'
        })
        var tar = c.$el.querySelector('a')
        assert.equal(tar.getAttribute('href'), 'javascript:;')
        c.$data.href = '#'
        c.$update()
        assert.equal(tar.getAttribute('href'), '#')
    })
    it('r-dataset', function () {
        var c = new Real({
            data: {
                src: '/'
            },
            template: '<a r-dataset="{src: src; href: \'javascript:;\'}" />'
        })
        var tar = c.$el.querySelector('a')
        assert.equal(tar.dataset.src, '/')
        assert.equal(tar.dataset.href, 'javascript:;')
        c.$data.src = ''
        c.$update()
        assert.equal(tar.dataset.src, '')
    })
    it('r-class', function () {
        var c = new Real({
            data: {
                clazz: ''
            },
            template: '<div r-class="{clazz: clazz}"></div>'
        })
        var tar = c.$el.querySelector('div')
        assert(!Real.$(tar).hasClass('clazz'))
        c.$set('clazz', true)
        assert(Real.$(tar).hasClass('clazz'))
    })
    it('r-classes', function (){
        var c = new Real({
            data: {
                classes: ['red', 'blue']
            },
            template: '<div r-classes="{classes}"></div>'
        })
        var tar = c.$el.querySelector('div')
        assert(Real.$(tar).hasClass('red'))
        assert(Real.$(tar).hasClass('blue'))
        c.$set('classes', ['red'])
        assert(!Real.$(tar).hasClass('blue'))
        assert(Real.$(tar).hasClass('red'))
        c.$set('classes', 'green')
        assert(!Real.$(tar).hasClass('red'))
        assert(Real.$(tar).hasClass('green'))
        c.$set('classes', 'green  black yellow')
        assert(Real.$(tar).hasClass('green'))
        assert(Real.$(tar).hasClass('black'))
        assert(Real.$(tar).hasClass('yellow'))
    })
    it('r-html', function () {
        var c = new Real({
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
        var c = new Real({
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
        var c = new Real({
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
        var c = new Real({
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
    it('r-capture', function (done) {
        var isCapture = false
        var c = new Real({
            data: {},
            template: '<div r-capture="{click: onCapture}"><div class="target" r-on="{click: onClick}"></div></div>',
            methods: {
                onCapture: function () {
                    isCapture = true
                },
                onClick: function () {
                    assert(isCapture, 'Capture event should be trigger first')
                    done()
                }
            }
        })
        var tar = c.$el.querySelector('.target')
        var event = document.createEvent('Event')
        event.initEvent('click', true, true)
        tar.dispatchEvent(event)
    })
    it('r-delegate', function (done) {
        var c = new Real({
            data: {},
            template: '<div r-delegate="{click .item: onClick}" class="con"><div class="item"><button></button></div></div>',
            methods: {
                onClick: function (e) {
                    assert.equal(e.$currentTarget, this.$el.querySelector('.item'))
                    done()
                }
            }
        })
        var tar = c.$el.querySelector('.item button')
        var event = document.createEvent('Event')
        event.initEvent('click', true, true);
        tar.dispatchEvent(event)
    })
    it('r-on:vchange', function (done) {
        var c = new Real({
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
    it('r-click', function (done) {
        var c = new Real({
            data: {},
            template: '<div r-click="{onClick}"></div>',
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
        var c = new Real({
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
        var c = new Real({
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
        var c = new Real({
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
        var c = new Real({
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
        var c = new Real({
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
        var c = new Real({
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
        var c = new Real({
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
    it('r-props', function (){
        var el = document.createElement('div')
        el.setAttribute('r-props', '{name: "abc"}')
        el.innerHTML = 
        '<div r-component="c-props"\
            r-data="{ key1: \'interface\'; }" \
            r-props="{ key1: \'prop1frominerface\';key4: \'propfromInterface\'}" \
            r-replace="true"> </div>'

        Real.component('c-props', {
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
        var c = new Real({
            el: el
        })
        assert.equal(c.$data.name, 'abc')
    })
    it('r-notemplate', function (){
        Real.component('c-notemplate', {
            template: '<span r-component="c-notemplate" r-notemplate="true"><div class="chil-inner"></div></span>'
        })
        var c = new Real({
            template: '<div><span r-component="c-notemplate"  r-notemplate="true"><div class="parent-inner"></div></span></div>'
        })
        assert(!!c.$el.querySelector('.parent-inner'))
    })
    
})
