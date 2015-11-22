describe('# Component', function () {
    it('component-directives:r-data', function () {
        Reve.component('header', {
            template: '<div class="c-header"><span r-text>{title}</span></div>'
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
            template: '<div class="c-header"><span r-text>{upCase(title)}</span></div>'
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
            template: '<div class="c-header"><span r-text>{title}</span></div>'
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
})