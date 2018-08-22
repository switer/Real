'use strict'

var $ = require('../tools/dm')
var util = require('../tools/util')
var keypath = require('../tools/keypath')
var consoler = require('../tools/consoler')
var conf = require('../conf')
/**
 * 缓存编译结果
 */
var listCompileResults = {}
module.exports = function(Real) {
    var ds = {}
    var FOR_KEY = 'FOR'.toLowerCase()
    ds[FOR_KEY] = {
        bind: function(v) {
            var $el = this.$el
            var listIdName = conf.namespace + 'listid'
            var keyName = conf.namespace + 'key'
            this._listId = $el.getAttribute(listIdName)
            this._key = $el.getAttribute(keyName)

            var tagExpr = this._tagExpr = '<'+ conf.namespace + 'for="' + this.$rawExpr+'" '+ keyName + '="' + this._key+'"/>'
            if (!this._key) {
                consoler.error('Missing attribute, the directive need specify "' +
                    conf.namespace + 'key".', tagExpr)
            }
            this._isSelfStrKey = this._key === '*this'
            this._isIndexKey = this._key === '*index'
            this.$after = document.createComment('<for ' + tagExpr  + '">')
            if (this.$el.parentNode) {
                this.$el.parentNode.replaceChild(this.$after, this.$el)
            } else {
                consoler.error('ElementNode of the directive must not the root node. ', tagExpr)
            }
            // first update
            this.diff(v)
            this._compileCache = null
        },
        /**
         * Custom diff method, using as update
         */
        diff: function(v) {
            if (!this._key) return
            if (util.type(v) == 'array') {
                var that = this
                this._v = v
                var lastVms = that._vms || []
                var lastVmMap = that._vmMap || {}
                var parentVm = that.$vm
                var removedVms = []
                var changedVms = []
                var insertedVms = []
                var vms = that._vms = new Array(that._v.length)
                var vmMap = that._vmMap = {}
                var lastInsertIndex = -1
                var continuedChangeOffset = 0
                var lastChangeIndex = -1
                var isContinuedInsert = true
                var isContinuedChange = true
                var cursor = 0

                util.forEach(that._v, function(data, index) {
                    var isObj = util.isObj(data)
                    var key
                    if (that._isIndexKey) {
                        key = index
                    } else if (!isObj || that._isSelfStrKey) {
                        key = data + ''
                    } else {
                        key = keypath.get(data, that._key)
                    }
                    var vm = lastVmMap[key]
                    if (vm) {
                        vm = vm.vm
                    }
                    var p = {
                        key: key,
                        vm: vm
                    }
                    if (vmMap[key]) {
                        // duplicative
                        consoler.warn('Key for the directive is not unique { "'+ key + '" :', data, '}. ', that._tagExpr)
                        return vms
                    }
                    if (vm) {
                        var _i = vm.$data.$index
                        index = cursor
                        // detect is continue changed VMS by increasing index and fixed offset
                        if (vm.$data.$index !== index) {
                            // TODO update POS
                            changedVms.push(p)
                            if (isContinuedChange) {
                                if (lastChangeIndex < 0) {
                                    continuedChangeOffset = index - _i
                                    lastChangeIndex = index
                                } else {
                                    if (lastChangeIndex + 1 != index || continuedChangeOffset != index - _i) {
                                        // break
                                        isContinuedChange = false
                                    } else {
                                        lastChangeIndex = index
                                    }
                                }
                            }
                        }
                        util.extend(vm.$data, parentVm.$data, isObj ? data : null, {
                            $index: index,
                            $value: data,
                            $parent: parentVm.$data
                        })
                        vm.$update()
                        vms[index] = p
                        cursor ++
                    } else {
                        index = cursor
                        var el = that.$el.cloneNode(true)
                        var data = util.extend({}, parentVm.$data, isObj ? data : null, {
                            $index: index,
                            $value: data,
                            $parent: parentVm.$data
                        })

                        /**
                         * If `listId` and compile result exit, use it
                         */
                        if (!that._compileCache && that._listId && listCompileResults[that._listId]) {
                            that._compileCache = listCompileResults[that._listId]
                        }
                        // create new VM
                        var useCache = !!that._compileCache
                        if (!useCache) {
                            that._compileCache = {}
                        }
                        vm = new Real({
                            lite: true,
                            parent: parentVm,
                            el: el,
                            optimise: {
                                precompile: useCache ? null : that._compileCache,
                                compileCache: useCache ? that._compileCache : null,
                                bindMethods: false,
                                noMessage: true
                            },
                            methods: parentVm.$methods,
                            data: data
                        })
                        /**
                         * cache compile result
                         */
                        if (that._listId && !listCompileResults[that._listId]) {
                            listCompileResults[that._listId] = that._compileCache
                        }

                        if (isContinuedInsert) {
                            if (lastInsertIndex < 0) {
                                lastInsertIndex = index
                            } else {
                                if (lastInsertIndex + 1 != index) {
                                    // break
                                    isContinuedInsert = false
                                } else {
                                    lastInsertIndex = index
                                }
                            }
                        }
                        p.vm = vm
                        vms[index] = p
                        insertedVms.push(p)
                        cursor ++
                    }
                    vmMap[key] = p
                    return vms
                })
                /**
                 * remove
                 */
                util.forEach(lastVms, function(item) {
                    if (!vmMap[item.key]) {
                        removedVms.push(item)
                    }
                })
                var changedCount = changedVms.length
                var insertedCount = insertedVms.length
                var removedCount = removedVms.length
                var onlyRemoved
                if (!insertedCount) {
                    if (!changedCount && !removedCount) {
                        return
                    } else if (removedCount && (!changedCount || (-1*continuedChangeOffset == removedCount && isContinuedChange))) {
                        onlyRemoved = true
                    }
                } else {
                    if (isContinuedInsert && (!changedCount || isContinuedChange)) {
                        onlyRemoved = true
                        // insert only and effect on changedVMs
                        mountVMs(
                            insertedVms, 
                            lastInsertIndex + 1 < vms.length 
                                ? vms[lastInsertIndex + 1].vm.$el
                                : that.$after
                        )
                    }
                }
                // remove in batch
                util.forEach(removedVms, function(item) {
                    detroyVM(item.vm)
                })
                if (!onlyRemoved) {
                    // update pos at all items
                    mountVMs(vms, that.$after)
                }
            } else {
                consoler.warn('The directive only support Array value. ', this._tagExpr)
            }
        },
        unbind: function() {

        }
    }
    var IF_KEY = 'IF'.toLowerCase()
    ds[IF_KEY] = {
        bind: function() {
            var $el = this.$el
            var $parent = $el.parentNode
            var _mounted = true
            var holder = document.createComment('<if ' + this.$rawExpr + '/>')

            $($el).attr('_'+conf.namespace + 'if', this.$rawExpr)

            this._mount = function() {
                if (_mounted) return
                _mounted = true
                if (!$el.parentNode && holder.parentNode) {
                    $parent.replaceChild($el, holder)
                }
                    
            }
            this._unmount = function() {
                if (!_mounted) return
                _mounted = false
                if ($el.parentNode) {
                    $parent.replaceChild(holder, $el)
                }
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
    return ds
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
    util.forEach(vms, function(item) {
        frag.appendChild(item.vm.$el)
    })
    target.parentNode.insertBefore(frag, target)
}
