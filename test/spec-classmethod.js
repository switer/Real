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
            data: function () {
                return {
                    name: 'real',
                    na: 'china'
                }
            },
            el: document.createElement('div')
        })

        assert.equal(c.$data.name, 'real')
        assert.equal(c.$data.na, 'china')
        assert.equal(c.$data.address, 'none')
    })
})
