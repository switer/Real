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
    it('$appendTo', function () {
        var c = new Reve({
            template: '<div class="con"></div>'
        })
        var cc = new Reve({
            el: document.createElement('div')
        })
        cc.$appendTo(c)
        assert.equal(cc.$parent, c)
        assert(c.$el.contains(cc.$el))
    })
    it('$root', function () {
        var c = new Reve({
            template: '<div class="con"></div>'
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
    it('$on/$off/$emit', function (done) {
        var times = 0
        function handler() {
            times++
            assert(times <= 1, 'handler should be triggered only once.')
            done()
        }
        var c = new Reve({
            template: '<div></div>'
        })
        c.$on('event', handler)
        c.$emit('event')
        c.$off('event', handler)
        c.$emit('event')
    })
    it('$watch', function (done) {
        var c = new Reve({
            template: '<div></div>',
            data: ()=>{
                return {
                    a: 1,
                    b: 2,
                    c: 4,
                    d: 5
                }
            }
        })
        c.$watch('a + b', function (v) {
            assert.equal(v, 3)
        })
        c.$watch('b - a', function (v) {
            assert.equal(v, 1)
        })
        var results = [9, 10]
        c.$watch('c + d', function (v) {
            assert.equal(results.shift(), v)
            if (!results.length) done()
        })  
        setTimeout(function () {
            c.$set('d', 6)
        }, 20)
    })
})
