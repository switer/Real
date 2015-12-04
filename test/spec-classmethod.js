describe('# Class Methods', function () {
    it('create', function () {
        var C = Reve.create({
            data: function () {
                return {
                    name: '',
                    address: 'none'
                }
            }
        })
        var c = new C({
            el: document.createElement('div'),
            data: function () {
                return {
                    name: 'real',
                    na: 'china'
                }
            }
        })
        assert.equal(c.$data.name, 'real')
        assert.equal(c.$data.na, 'china')
        assert.equal(c.$data.address, 'none')

        var c2 = new C({
            el: document.createElement('div'),
            data: {
                name: 'real2'
            }
        })
        assert.equal(c2.$data.name, 'real2')
        assert.equal(c2.$data.address, 'none')
    })

    it('component', function (){
        var C = Reve.component('custom-component', {
            template: '<div class="custom-component"></div>',
            data: function () {
                return {
                    name: 'custom-component'
                }
            }
        })
        var c = new C({
            el: document.createElement('div')
        })
        assert(!!c.$el.querySelector('.custom-component'))
        var c2 = new Reve({
            el: document.createElement('div'),
            template: '<div r-component="custom-component"></div>'
        })
        assert(!!c2.$el.querySelector('.custom-component'))
    })
})
