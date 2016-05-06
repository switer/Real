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
    it('directive', function (){
        Reve.directive('empty', {
            bind: function (value, expression) {
                assert.equal(value, 'empty-value')
            },
            update: function (value) {
                this.$el.setAttribute('data-empty', value)
            }
        })
        var c = new Reve({
            el: document.createElement('div'),
            template: '<div class="empty" r-empty="empty-value"></div>'
        })
        assert.equal(c.$el.querySelector('.empty').getAttribute('data-empty'), 'empty-value')
    })
    it('set', function (){
        Reve.set('catch', true)
        var c = Reve.component('catch', {
            el: document.createElement('div'),
            ready: function () {
                throw Error('Here match a err')
            }
        })
        var c = new Reve({
            template: '<div r-component="catch"></div>',
            ready: function () {
                throw new Error('Err')
            }
        })
    })
})
