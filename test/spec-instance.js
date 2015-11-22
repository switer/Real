describe('# Instance', function () {
    it('options:el && template', function () {
        var el = document.createElement('div')
        var c = new Reve({
            el: el,
            template: '<div class="container"></div>'
        })
        assert.equal(el, c.$el)
        assert(!!c.$el.querySelector('.container'))
    })
})