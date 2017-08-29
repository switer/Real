describe('# Scoped Directive', function() {
    it('Initial render: object item', function(done) {
        var c = new Reve({
            data: {
                items: [{ name: 123 }, { name: 456 }, { name: 789 }]
            },
            template: '<div r-for="{items}" r-key="name"><span r-text>{$index}:{name}/</span></div>'
        })
        Reve.nextTick(function() {
            assert.equal('0:123/1:456/2:789/', c.$el.innerText)
            done()
        })
    })
    it('Initial render: primitive item', function(done) {
        var c = new Reve({
            data: {
                items: [1, 2, 3]
            },
            template: '<div r-for="{items}" r-key="*this"><span r-html>{$index}:{$value} </span></div>'
        })
        Reve.nextTick(function() {
            assert.equal('0:1 1:2 2:3 ', c.$el.innerText)
            done()
        })
    })
    it('Insert: before', function(done) {
        var c = new Reve({
            data: {
                items: [1, 2, 3]
            },
            template: '<div r-for="{items}" r-key="*this"><span r-html>{$index}:{$value} </span></div>'
        })
        c.$data.items.unshift(0)
        c.$update()
        Reve.nextTick(function() {
            assert.equal('0:0 1:1 2:2 3:3 ', c.$el.innerText)
            done()
        })
    })
    it('Insert: middle', function(done) {
        var c = new Reve({
            data: {
                items: [1, 2, 3]
            },
            template: '<div r-for="{items}" r-key="*this"><span r-html>{$index}:{$value} </span></div>'
        })
        c.$data.items.splice(1, 0, 2.1)
        c.$update()
        Reve.nextTick(function() {
            assert.equal('0:1 1:2.1 2:2 3:3 ', c.$el.innerText)
            done()
        })
    })
    it('Insert: after', function(done) {
        var c = new Reve({
            data: {
                items: [1, 2, 3]
            },
            template: '<div r-for="{items}" r-key="*this"><span r-html>{$index}:{$value} </span></div>'
        })
        c.$data.items.push(4)
        c.$update()
        Reve.nextTick(function() {
            assert.equal('0:1 1:2 2:3 3:4 ', c.$el.innerText)
            done()
        })
    })
})