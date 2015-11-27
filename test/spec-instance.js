describe('# Instance', function () {
    it('options: "el" only', function () {
        var el = document.createElement('div')
        var c = new Reve({
            el: el
        })
        assert.equal(el, c.$el)
    })
    it('options: "template" only', function () {
        var c = new Reve({
            template: '<div class="container"></div>'
        })
        assert(!!c.$el.querySelector('.container'))
    })
    it('options: "el" and "template"', function () {
        var el = document.createElement('div')
        var c = new Reve({
            el: el,
            template: '<div class="container"></div>'
        })
        assert.equal(el, c.$el)
        assert(!!c.$el.querySelector('.container'))
    })
    it('options: "el" is a id selector', function () {
        var el = document.createElement('div')
        el.id = 'el-selector'
        document.body.appendChild(el)
        var c = new Reve({
            el: '#el-selector'
        })
        assert.equal(el, c.$el)
        document.body.removeChild(el)
    })
    it('options: "el" is a class selector', function () {
        var el = document.createElement('div')
        el.className = 'el-selector'
        document.body.appendChild(el)
        var c = new Reve({
            el: '.el-selector'
        })
        assert.equal(el, c.$el)
        document.body.removeChild(el)
    })
    it('options: "el" with replace', function () {
        var el = document.createElement('div')
        var child = document.createElement('div')
        child.className = 'child'
        el.appendChild(child)
        var c = new Reve({
            replace: true,
            el: el
        })
        assert.equal(c.$el, child)
    })
    it('options: "template" with replace', function () {
        var c = new Reve({
            replace: true,
            template: '<div class="container"></div>'
        })
        assert.equal(c.$el.className, 'container')
    })
    it('options: "el" is a selector and with replace option', function () {
        var el = document.createElement('div')
        var child = document.createElement('div')
        child.className = 'child'
        el.id = 'el-selector2'
        el.appendChild(child)
        document.body.appendChild(el)
        var c = new Reve({
            replace: true,
            el: '#el-selector2'
        })
        assert.equal(c.$el, child)
        assert(document.body.contains(c.$el))
        assert(!document.body.contains(el))
    })
    it('options: "el" and "template" with replace option', function () {
        var el = document.createElement('div')
        el.setAttribute('data-name', 'holder')
        var c = new Reve({
            el: el,
            replace: true,
            template: '<div class="container"></div>'
        })
        assert.equal(c.$el.className, 'container')
        assert.equal(c.$el.getAttribute('data-name'), 'holder')
    })
})