describe('# Scoped Directive', function() {
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
    it('r-for:Initial render: object item', function(done) {
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
    it('r-for:Initial render: primitive item', function(done) {
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
    it('r-for:Insert: before', function(done) {
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
    it('r-for:Insert: middle', function(done) {
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
    it('r-for:Insert: after', function(done) {
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
    it('r-for:Remove: before', function(done) {
        var c = new Reve({
            data: {
                items: [1, 2, 3]
            },
            template: '<div r-for="{items}" r-key="*this"><span r-html>{$index}:{$value} </span></div>'
        })
        c.$data.items.shift()
        c.$update()
        Reve.nextTick(function() {
            assert.equal('0:2 1:3 ', c.$el.innerText)
            done()
        })
    })
    it('r-for:Remove: middle', function(done) {
        var c = new Reve({
            data: {
                items: [1, 2, 3]
            },
            template: '<div r-for="{items}" r-key="*this"><span r-html>{$index}:{$value} </span></div>'
        })
        c.$data.items.splice(1, 1)
        c.$update()
        Reve.nextTick(function() {
            assert.equal('0:1 1:3 ', c.$el.innerText)
            done()
        })
    })
    it('r-for:Remove: after', function(done) {
        var c = new Reve({
            data: {
                items: [1, 2, 3]
            },
            template: '<div r-for="{items}" r-key="*this"><span r-html>{$index}:{$value} </span></div>'
        })
        c.$data.items.pop()
        c.$update()
        Reve.nextTick(function() {
            assert.equal('0:1 1:2 ', c.$el.innerText)
            done()
        })
    })
    it('r-for:Remove: before & Insert: after', function(done) {
        var c = new Reve({
            data: {
                items: [1, 2, 3, 4, 5]
            },
            template: '<div r-for="{items}" r-key="*this"><span r-html>{$index}:{$value} </span></div>'
        })
        c.$data.items.shift()
        c.$data.items.push(6, 7)
        c.$update()
        Reve.nextTick(function() {
            assert.equal('0:2 1:3 2:4 3:5 4:6 5:7 ', c.$el.innerText)
            done()
        })
    })
    it('r-for:Remove: after & Insert: before', function(done) {
        var c = new Reve({
            data: {
                items: [1, 2, 3, 4, 5]
            },
            template: '<div r-for="{items}" r-key="*this"><span r-html>{$index}:{$value} </span></div>'
        })
        c.$data.items.unshift(-1, 0)
        c.$data.items.pop()
        c.$update()
        Reve.nextTick(function() {
            assert.equal('0:-1 1:0 2:1 3:2 4:3 5:4 ', c.$el.innerText)
            done()
        })
    })
})