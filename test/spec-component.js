describe('# Component', function () {
    it('Instance', function () {
        Reve.component('header', {
            template: '<div class="c-header"></div>'
        })
        var c = new Reve({
            template: '<div r-component="header" r-ref="header"></div>'
        })
        assert.equal(c.$components[0].$name, 'header')
        assert(typeof c.$components[0].$id == 'number')
        assert.equal(c.$refs.header.$el.getAttribute('_r-component'), 'header')
    })
    it('Circular instance', function () {
        Reve.component('child', {
            template: '<div r-component="child"></div>'
        })
        var c = new Reve({
            template: '<div r-component="child"></div>'
        })
        // will get circular error console
        assert(!!c.$el.querySelector('[r-component]'))
    })
    it('Nested components', function () {
        var call = 0
        Reve.component('outer', {
            ready: function () {
                call ++
                assert.equal(this.$data.title , 'real:outer')
            }
        })
        Reve.component('inner', {
            ready: function () {
                call ++
                assert.equal(this.$data.title , 'real:outer:inner')
            }
        })
        var c = new Reve({
            data: {title: 'real'},
            template: '<div r-component="outer" r-data="{title: title + \':outer\'}">' + 
                        '<div r-component="inner" r-data="{title: title + \':inner\'}"></div></div>'
        })
        assert.equal(call, 2)
    })
    it('component-directives:r-data', function () {
        Reve.component('header', {
            template: '<div class="c-header"><span r-text="replace">{title}</span></div>'
        })
        var c = new Reve({
            data: {title: 'real'},
            template: '<div r-component="header" r-data="{title: title}"></div>'
        })
        var tar = c.$el.querySelector('.c-header')
        assert.equal(tar.innerHTML, 'real')
        c.$set('title', '')
        assert.equal(tar.innerHTML, '')
    })
    it('component-directives:r-methods', function () {
        Reve.component('header', {
            template: '<div class="c-header"><span r-text="replace">{upCase(title)}</span></div>'
        })
        var c = new Reve({
            data: {title: 'real'},
            methods: {
                upCase: function (text) {
                    return text.toUpperCase()
                }
            },
            template: '<div r-component="header" r-data="{title: title}" r-methods="{upCase:upCase}"></div>'
        })
        var tar = c.$el.querySelector('.c-header')
        assert.equal(tar.innerHTML, 'REAL')
        c.$set('title', 'reve')
        assert.equal(tar.innerHTML, 'REVE')
    })
    it('component-directives:r-ref', function () {
        Reve.component('header', {
            template: '<div class="c-header"></div>'
        })
        var c = new Reve({
            template: '<div r-component="header" r-ref="header"></div>'
        })
        var tar = c.$el.querySelector('.c-header')
        assert.equal(tar, c.$refs.header.$el.querySelector('.c-header'))
    })
    it('component-directives:r-binding', function () {
        Reve.component('header', {
            template: '<div class="c-header"><span r-text="replace">{title}</span></div>'
        })
        var c = new Reve({
            data:{title: 'real'},
            template: '<div r-component="header" r-binding="false" r-data="{title: title}"></div>'
        })
        var tar = c.$el.querySelector('.c-header')
        assert.equal(tar.innerHTML, 'real')
        c.$set('title', '')
        assert.equal(tar.innerHTML, 'real', 'Should not be changed')
    })
    it('component-directives:r-replace', function () {
        Reve.component('header', {})
        var c = new Reve({
            template: '<div r-component="header" r-replace="true" r-ref="header"><div class="c-header"></div></div>'
        })
        var tar = c.$el.querySelector('.c-header')
        assert.equal(tar, c.$refs.header.$el)
    })
    it('component-directives:r-replace:replace parent component', function () {
        Reve.component('header', {})
        var c = new Reve({
            replace: true,
            template: '<div r-component="header" r-ref="header"><div class="c-header"></div></div>'
        })
        var tar = c.$el.querySelector('.c-header')
        assert.equal(c.$el, c.$refs.header.$el)
    })
    it('component-directives:r-updateid', function () {
        Reve.component('header', {
            template: '<div class="c-header"><span r-text="replace">{title}</span></div>',
            methods: {
                update: function () {
                    this.$data.title = 'reve'
                }
            }
        })
        var c = new Reve({
            data:{title: 'real'},
            template: '<div r-component="header" r-updateid="header" r-data="{title: title}" r-ref="header"></div>'
        })
        var tar = c.$el.querySelector('.c-header')
        assert.equal(tar.innerHTML, 'real')
        c.$refs.header.update()
        c.$update('header')
        assert.equal(tar.innerHTML, 'reve')
    })
    it('merged-attributes:r-attr', function () {
        Reve.component('header', {
            template: '<div class="c-header" r-attr="{title: 1;inner: 2}"></div>',
            ready: function (){
                assert.equal(this.$el.getAttribute('title'), 'outer')
                assert.equal(this.$el.getAttribute('inner'), 2)
            }
        })
        var c = new Reve({
            data:{title: 'real'},
            template: '<div><div r-component="header" r-attr="{title: \'outer\'}" r-replace="true"></div></div>'
        })
    })
    it('merged-attributes:r-style', function () {
        Reve.component('header', {
            template: '<div class="c-header" r-style="{color: \'white\'}"></div>',
            ready: function (){
                assert.equal(this.$el.style.display, 'none')
                assert.equal(this.$el.style.color, 'white')
            }
        })
        var c = new Reve({
            data:{title: 'real'},
            template: '<div><div r-component="header" r-style="{display: \'none\';}" r-replace="true"></div></div>'
        })
    })
})