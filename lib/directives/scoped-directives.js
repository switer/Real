'use strict'

var $ = require('../tools/dm')
var util = require('../tools/util')
var keypath = require('../tools/keypath')
var consoler = require('../tools/consoler')
var nextTick = require('../tools/nexttick')
var conf = require('../conf')
var ds = function(Real) {
    return {
        'for': {
            bind: function(v) {
                var $el = $(this.$el)
                var keyName = conf.namespace + 'key'
                this._key = $el.attr(keyName)
                $el.removeAttr(keyName)
                this.$before = document.createComment('<repeat ' + conf.namespace + 'for="' + this.$rawExpr 
                    + '" ' + keyName + '="' + this._key  + '">')
                this.$after = document.createComment('</repeat>')
                if (this.$el.parentNode) {
                    var frag = document.createDocumentFragment()
                    frag.appendChild(this.$before)
                    frag.appendChild(this.$after)
                    $el.replace(frag)
                } else {
                    consoler.error('ElementNode of directive "' + conf.namespace + 'for" must not the root node', this.$el)
                }
                if (!this._key) {
                    consoler.error('Missing attribute, Directive "' +
                        conf.namespace + 'for" need specify "key" by "' +
                        conf.namespace + 'key".', this.$el)
                }
                // first update
                this.diff(v)
            },
            /**
             * Custom diff method, using as update
             */
            diff: function(v) {
                if (!this._key) return
                if (util.type(v) == 'array') {
                    var that = this
                    if (!this._pending) {
                        this._pending = true
                        nextTick(function() {
                            try {
                                var lastVms = that._vms || []
                                var lastVmMap = that._vmMap || {}
                                var parentVm = that.$vm
                                var removedVms = []
                                var changedVms = []
                                var insertedVms = []
                                var vms = that._vms = []
                                var vmMap = that._vmMap = {}
                                util.forEach(v, function(data, index) {
                                    var isObj = util.isObj(data)
                                    var key = isObj ? keypath.get(data, that._key) : data + ''
                                    var vm = lastVmMap[key]
                                    var p = {
                                        key: key,
                                        vm: vm
                                    }
                                    if (vm) {
                                        p._i = vm.$data.$index
                                        if (vmMap[key]) {
                                            // duplicative
                                            consoler.warn('Key for directive"' + conf.namespace + 'for" is not unique:', key + ':', data, that.$el)
                                            return vms
                                        } else {
                                            if (vm.$data.$index !== index) {
                                                // TODO update POS
                                                changedVms.push(p)
                                            }
                                            util.extend(vm.$data, parentVm.$data, isObj ? data : null, {
                                                $index: index,
                                                $value: data,
                                                $parent: parentVm.$data
                                            })
                                            vm.$update()
                                            vms.push(p)
                                        }
                                    } else {
                                        vmMap[key] = vm
                                        // create new VM
                                        vm = new Real({
                                            parent: parentVm,
                                            el: that.$el.cloneNode(true),
                                            methods: util.extend({}, parentVm.$methods),
                                            data: util.extend({}, parentVm.$data, isObj ? data : null, {
                                                $index: index,
                                                $value: data,
                                                $parent: parentVm.$data
                                            })
                                        })
                                        p.vm = vm
                                        vms.push(p)
                                        insertedVms.push(p)
                                    }
                                    vmMap[key] = vm
                                    return vms
                                })
                                /**
                                 * remove
                                 */
                                lastVms.forEach(function(item) {
                                    if (!vmMap[item.key]) {
                                        removedVms.push(item)
                                    }
                                })
                                var changeCount = changedVms.length
                                var insertedCount = insertedVms.length
                                var patch = function() {
                                    if (!changeCount && !insertedCount) {
                                        return removedVms.forEach(function(item) {
                                            // has remove only
                                            detroyVM(item.vm)
                                        })
                                    } else {
                                        if (!removedVms.length) {
                                            if (insertedCount && !changeCount && vms.length > insertedCount) {
                                                var lastIndex = -1
                                                // detect if continued indexes
                                                if (!util.some(insertedVms, function(item) {
                                                        var index = item.vm.$data.$index
                                                        if (lastIndex < 0) return
                                                        // is no continues
                                                        if (lastIndex + 1 != index) {
                                                            return true
                                                        }
                                                        lastIndex = index
                                                    })) {

                                                    mountVMs(
                                                        insertedVms, 
                                                        lastIndex + 1 < vms.length ?
                                                            vms[lastIndex + 1] :
                                                            that.$after)
                                                    // break
                                                    return
                                                }
                                            } else if (!insertedCount && changeCount) {
                                                // swap
                                            }
                                        }
                                    }
                                    // remove
                                    removedVms.forEach(function(item) {
                                        // has remove only
                                        detroyVM(item.vm)
                                    })
                                    // update pos at all items
                                    mountVMs(vms, that.$after)
                                }
                                patch()
                            } finally {
                                that._pending = false
                            }
                        })
                    }
                } else {
                    consoler.warn('Directive "' + conf.namespace + 'for" need Array value.', this.$el)
                }
            },
            unbind: function() {

            }
        }
    }
    var IF_KEY = 'IF'.toLowerCase()
    ds[IF_KEY] = {
        bind: function() {
            var $el = this.$el
            var $parent = $el.parentNode
            var _mounted = true

            this._mount = function() {
                if (_mounted) return
                _mounted = true
                $parent.appendChild($el)
            }
            this._unmount = function() {
                if (!_mounted) return
                _mounted = false
                $parent.removeChild($el)
            }
        },
        unbind: function() {
            this._mount = this._unmount = noop
        },
        update: function(cnd) {
            if (!cnd) return this._unmount()
            else if (this._compiled) return this._mount()
            else {
                this._compiled = true
                this.$vm.$compile(this.$el)
                this._mount()
            }
        }
    }
}

function noop() {}

function detroyVM(vm) {
    if (vm.$el.parentNode) {
        vm.$el.parentNode.removeChild(vm.$el)
    }
    vm.$destroy()
}
function mountVMs(vms, target) {
    var frag = document.createDocumentFragment()
    vms.forEach(function(item) {
        frag.appendChild(item.vm.$el)
    })
    target.parentNode.insertBefore(frag, target)
}
module.exports = ds