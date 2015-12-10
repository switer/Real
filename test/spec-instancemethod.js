describe('# Instance Methods', function () {
    it('$set', function () {
        var c = new Reve({
            template: '<div r-text="replace">{name}</div>',
            data: {
                name: ''
            }
        })
        c.$set('name', 'real')
        assert.equal(c.$data.name, 'real')
        assert.equal(c.$el.innerText, 'real')
    })
    it('$compile', function () {
        var c = new Reve({
            template: '<div class="con"></div>',
            data: {
                name: 'real'
            }
        })
        var inserted = '<div r-text="replace">{name}</div>'
        var el = c.$compile(inserted)
        assert.equal(el.nodeType, 11)
        
        var con = c.$el.querySelector('.con')
        con.appendChild(el)
        assert.equal(con.innerText, 'real')
    })
    it('$root', function () {

        var c = new Reve({
            template: '<div class="con"></div>',
            data: {
                name: 'real'
            }
        })
        var cc = new Reve({
            el: document.createElement('img')
        })
        var ccc = new Reve({
            el: document.createElement('img')
        })

        cc.$appendTo(c)
        ccc.$appendTo(cc)

        assert.equal(ccc.$root(), c)
    })
})
