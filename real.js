'use strict';

var $ = require('./lib/tools/dm')
var util = require('./lib/tools/util')
var conf = require('./lib/conf')
var is = require('./lib/tools/is')
var Query = require('./lib/tools/query')
var consoler = require('./lib/tools/consoler')
var KP = require('./lib/tools/keypath')
var nextTick = require('./lib/tools/nexttick')
var buildInDirectives = require('./lib/directives/build-in')
var buildInScopedDirectives = require('./lib/directives/scoped-directives')(Real)
var Expression = require('./lib/tools/expression')
var Directive = require('./lib/directive')
var Watcher = require('./lib/watcher')
var Message = require('./lib/tools/message')
var detection = require('./lib/tools/detection')
var supportQuerySelector = detection.supportQuerySelector
var _execute = require('./lib/tools/execute')
var _components = {}
var _externalDirectives = {}
var _scopedDirectives = []
var _allDiretives = {}
var _allDiretiveKeys = []
var _allBuildInScopedDecKeys = []
var _allScopedDecKeys = []
var _allScopedDecWithCompoentKeys = []
var _isExpr = Expression.isExpr
var _strip = Expression.strip
var _getAttribute = util.getAttribute
var _cid = 0
var _getData = function (data) {
    return (util.type(data) == 'function' ? data():data) || {}
}
var CATCH_KEY = 'CATCH'.toLowerCase()
setAllDirective()
/**
 * Constructor Function and Class.
 * @param {Object} options Instance options
 * @return {Object} Real component instance
 */
function Real(options) {
    options = options || {}

    var vm = this
    var NS = conf.namespace
    var _ready = options.ready
    var _created = options.created
    var _destroy = options.destroy
    var _binding = util.hasOwn(options, 'binding') ? options.binding : true
    var _message = this._message = new Message()
    var optimiseOpt = options.optimise || {}

    this.$id = _cid ++
    this.$name = options.name || ''
    this.$parent = options.parent || null
    this.$binding = !!_binding
    this.$shouldUpdate = options.shouldUpdate
    this.$directives = []
    this.$components = []
    this.$watchers = []
    this._$beforeDestroy = function () {
        _safelyCall(conf[CATCH_KEY], _destroy, vm)
    }


    var el = options.el
    var hasReplaceOption = util.hasOwn(options, 'replace') 
            ? options.replace
            : false
    /**
     *  Mounted element detect
     *  Convert selector to element
     */
    if (util.type(el) == 'string') {
        var sel = el
        if (supportQuerySelector) {
            el = document.querySelector(sel)
        } else if (/^\./.test(sel)) {
            el = _getElementsByClassName(sel.replace(/^\./, ''))
            el && (el = el[0])
        } else if (/^#/.test(sel)) {
            el = document.getElementById(sel.replace(/^#/, ''))
        } else {
            el = null
        }

        if (!el) return consoler.error('Can\'t resolve element by "' + sel + '"')
    }
    
    /**
     * Container element must be a element or has template option
     */
    var isHTMLElement = is.Element(el)
    var children
    if (isHTMLElement && options.template) {
        /**
         * If el is passed and has template option
         * if without "replace", it will render template to innerHTML,
         * otherwise template rendering to innerHTML and replace the component element with
         * root element of template.
         */
        if (util.hasAttribute(el, NS + 'notemplate') || options.notemplate) {
            // skip render template, using with SSR
        } else if (hasReplaceOption) {
            var child = _fragmentWrap(options.template)
            // for get first Element of the template as root element of the component
            children = _fragmentChildren(child)
            if (!children.length) 
                throw new Error('Component with \'replace\' must has a child element of template.', options.template)
            var nextEl = children[0]
            var parent = el.parentNode
            if (parent) {
                parent.replaceChild(nextEl, el)
            }
            _cloneAttributes(el, nextEl)
            el = nextEl
        } else {
            // el is given then set template as innerHTML for the component
            if (is.Fragment(el)){
                consoler.warn('Container element should\'nt a fragment node when "template" is given. Template:\n', options.template)
            } else {
                el.innerHTML = options.template
            }
        }
    } else if (!el && options.template) {
        if (hasReplaceOption) {
            var frag = _fragmentWrap(options.template)
            // for get first Element of the template as root element of the component
            el = _fragmentChildren(frag)[0]
            if (!el) 
                consoler.warn('Component\'s template should has a child element when using \'replace\' option.', options.template)
        }
        if (!el) {
            el = document.createElement('div')
            el.innerHTML = options.template
        }
    } else if (isHTMLElement) {
        if (hasReplaceOption) {
            children = is.Fragment(el) ? _fragmentChildren(el) : el.children
            var hasChildren = children && children.length
            !hasChildren && consoler.warn('Component\'s container element should has children when "replace" option given.')
            if (hasChildren) {
                var oldel = el
                el = children[0]
                if(oldel.parentNode) 
                    oldel.parentNode.replaceChild(el, oldel)
            }
        }
    } else {
        throw new Error('illegal "el" option.')
    }
    var componentDec = NS + 'component'
    var isReplaced
    var hasChildCompoent
    if (hasReplaceOption 
        && util.hasAttribute(el, componentDec) 
        && _getAttribute(el, componentDec) !== options.name) {
        // not same name policy, and make parentVM anonymous
        isReplaced = true
    } else {
        var cname = _getAttribute(el, componentDec)
        if (cname && cname === this.$name) {
            // prevent instance circularly
            _removeAttribute(el, componentDec)
        } else if (cname) {
            hasChildCompoent = true
        }
        // support multiple cid
        var cidKey = '_' + NS + 'cid'
        var cidValue = _getAttribute(el, cidKey) || ''
        if (cidValue) {
            cidValue += ','+this.$id
        } else {
            cidValue = this.$id
        }
        // expose cid to DOM for debug
        _setAttribute(el, cidKey, cidValue)
    }

    this.$methods = {}
    this.$refs = {}
    
    // from options.data
    var data = _getData(options.data)
    // prop NS-props
    var props = hasChildCompoent ? null : this._$parseProps(el)
    // from DOM interface
    var _data = _getData(options._data)
    this.$data = util.extend(data, props, _data) 

    if (optimiseOpt.bindMethods == false) {
        this.$methods = options.methods
    } else {
        util.objEach(options.methods, function (key, m) {
            vm.$methods[key] = vm[key] = util.bind(m, vm)
        })
    }
    // created lifecycle
    _safelyCall(conf[CATCH_KEY], _created, vm)
    this.$el = el
    // binding watcher
    try {
        util.objEach(options.watch || [], function (expr, handler) {
            vm.$watchers.push(new Watcher(vm, expr, handler))
        })
    } catch(e) {
        consoler.error('Watch catch error:', e)
    }
    try {
        // console.time('compile')
        var $compiledEl = this.$compile(el, null, optimiseOpt.precompile, optimiseOpt.compileCache)
        // console.timeEnd('compile')
        isReplaced && (this.$el = $compiledEl)
    } finally {

        // ready lifecycle
        try {
            _safelyCall(conf[CATCH_KEY], _ready, vm)
        } finally {
            _message.emit('ready')
        }
    }
}
/**
* Event message
*/
Real.prototype.$on = function() {
    return this._message.on.apply(this._message, arguments)
}
Real.prototype.$off = function() {
    return this._message.off.apply(this._message, arguments)
}
Real.prototype.$emit = function() {
    return this._message.emit.apply(this._message, arguments)
}
/**
 * @private
 */
Real.prototype._$parseProps = function (el) {
    var attr = conf.namespace + 'props'
    var props = _getAttribute(el || this.$el, attr)
    _removeAttribute(el || this.$el, attr)
    return props
        ? _execLiteral(props, this, attr)
        : null
}
Real.prototype.$set = function (/*[keypath, ]*/value) {
    var keypath = util.type(value) == 'string' ? value : ''
    if (keypath) {
        value = arguments[1]
        KP.set(this.$data, keypath, value)
    } else {
        this.$data = util.extend(this.$data, value)
    }
    this.$update()
}
/**
 * Get root component instance of the ViewModel
 */
Real.prototype.$root = function () {
    var parent = this
    while(parent.$parent) {
        parent = parent.$parent 
    }
    return parent || null
}
/**
 * Compile all directives of the HTMLElement or HTML template in current ViewModel. 
 * It's useful when load something async then append to current ViewModel's DOM Tree.
 * @param  {Element} | {String} el The HTMLElement of HTML template need to compile
 * @return {Element} | {DocumentFragment}
 */
Real.prototype.$compile = function (el, scope, precompile, compileCache) {
    var useCache = !!compileCache
    compileCache = compileCache || {}
    if (precompile) {
        precompile.scopes = []
        precompile.directives = []
    } else {
        precompile = {}        
    }
    precompile.components = 0

    if (util.type(el) == 'string') el = _fragmentWrap(el)

    var NS = conf.namespace
    var $directives = scope ? scope.$directives : this.$directives
    var $components = scope ? scope.$components : this.$components
    var componentDec = NS + 'component'
    var vm = this

    // compile directives of the VM
    var _diretives = compileCache.directives || _allDiretives
    var _scopeDirts =  _allScopedDecWithCompoentKeys
    var scopedDec = compileCache.scopes || _allScopedDecKeys
    var querySelectorAll = Query(
        el, 
        _scopeDirts, 
        // normal attribute directives
        util.map(_allDiretiveKeys, function (name) {
            return conf.namespace + name
        })
    )

    var scopedElements = scopedDec.length ? querySelectorAll(util.map(scopedDec, function (name) {
        return '[' + conf.namespace + name + ']'
    })) : []
    if (supportQuerySelector && scopedElements.length) {
        // nested component
        // Block selector cartesian product
        var selectors = []
        // Selector's cartesian product
        util.forEach(_scopeDirts, function (dec1) {
            return util.forEach(_scopeDirts, function (dec2) {
                selectors.push('[' + dec1 + '] [' + dec2 + ']')
            })
        })
        var scopedChilds = selectors.length ? util.slice(el.querySelectorAll(selectors)) : []
    }

    var componentElements = useCache && compileCache.components 
        ? querySelectorAll(['[' + componentDec + ']'])
        : []

    var compileComponent = function (tar) {
        precompile.components ++
        // prevent cross DOM level parsing or repeat parse
        if (tar._component) return
        // build in scoped directive is first
        if (util.some(_allBuildInScopedDecKeys, function (k) {
            return !!_getAttribute(tar, NS + k)
        })) {
            return
        }
        if (supportQuerySelector && ~util.indexOf(scopedChilds, tar)) return
        var cname = _getAttribute(tar, componentDec)
        if (!cname) {
            return consoler.error(componentDec + ' missing component id.', tar)
        }
        var Component = _components[cname]
        if (!Component) {
            consoler.error('Component \'' + cname + '\' not found.')
            return
        }
        // prevent circular instance
        if (Component.__id === vm.$classid) {
            consoler.error('Component in circular instance.', tar)
            return
        }

        tar._component = cname
        /**
         * Parsing begin
         */
        var refid = _getAttribute(tar, NS + 'ref')
        var cdata = _getAttribute(tar, NS + 'data')
        var cmethods = _getAttribute(tar, NS + 'methods')
        var bindingOpt = _getAttribute(tar, NS + 'binding')
        var updId = _getAttribute(tar, NS + 'updateid') || ''
        var replaceOpt = _getAttribute(tar, NS + 'replace') || _getAttribute(tar, 'replace')
        var data = {}
        var methods = {}
        var preData = {}
        // using binding option to top updating
        var isBinding = (bindingOpt === 'false' || bindingOpt === '0') 
            ? false 
            : true

        replaceOpt = replaceOpt == 'true' || replaceOpt == '1'
        // remove 'NS-component' attribute
        _removeAttribute(tar, componentDec)

        util.forEach(['ref','data', 'methods', 'binding', 'replace'], function (a) {
            _removeAttribute(tar, NS + a)
        })

        // data first then props
        // data will create binding of panrent
        if (cdata) {
            data = _execLiteral(cdata, this, NS + 'data')            
            preData = util.immutable(data)
        }
        // methods will not create binding
        if (cmethods) {
            methods = _execLiteral(cmethods, this, NS + 'methods')
        }
        // props will not create binding
        var props = vm._$parseProps(tar) || {}

        var c = new Component({
            el: tar,
            _data: util.extend(props, data),
            name: cname,
            parent: vm,
            // methods will not trace changes
            methods: methods,
            // if binding is disable, parent component will not trigger child's updating
            // unbinding if data is empty
            binding: isBinding,
            replace: !!replaceOpt
        })
        // for component inspecting
        _setAttribute(c.$el, '_' + NS + 'component', cname)

        if (refid) {
            this.$refs[refid] = c
        }
        c.$updateId = updId || ''
        /**
         * Hook to component instance update method;
         * A private method offer to parent ViewModel calling;
         * If binding data has been changed, it will trigger "$shouldUpdate()" method.
         */
        var _$update = c.$update
        c.$componentShouldUpdate = function () {
            // no binding
            if (!cdata || !isBinding) return

            var shouldUpdate = this.$shouldUpdate
            var nextData = _execLiteral(cdata, vm)
            // no cdata binding will not trigger update
            if (util.diff(preData, nextData)) {
                // should update return false will stop continue UI update
                if (shouldUpdate && !shouldUpdate.call(c, nextData, preData)) return
                preData = util.immutable(nextData)
                // merge updated data
                c.$data = util.extend(c.$data, nextData)
                _$update && _$update.apply(c, arguments)
            }
        }
        $components.push(c)

        return c.$el
    }
    /**
     * compile components
     */
    var replaceEl
    if (util.hasAttribute(el, componentDec)){
        replaceEl = compileComponent.call(this, el)
    }
    util.forEach(componentElements, util.bind(compileComponent, this))

    /**
     * compile scoped directives
     */
    function instanceScopedDirective(tar, dec, dname) {
        // don't compile child scope
        if (supportQuerySelector && ~util.indexOf(scopedChilds, tar)) return

        var drefs = tar._diretives || []
        // prevent repetitive binding
        if (drefs && ~util.indexOf(drefs, dname)) return

        var def = _diretives[dname]
        var expr = _getAttribute(tar, dec) || ''
        drefs.push(dec)
        tar._diretives = drefs
        _removeAttribute(tar, dec)

        var d = new Directive(vm, tar, def, dec, expr, scope)
        $directives.push(d)
    }

    util.forEach(scopedElements, function (tar) {
        util.some(scopedDec, function(dname) {
            var dec = conf.namespace + dname
            if (util.hasAttribute(tar, dec)) {
                precompile.scopes && precompile.scopes.push(dname)
                instanceScopedDirective(tar, dec, dname)
                return true
            }
        })
    })

    /**
     * compile normal atributes directives
     */
    util.forEach(util.keys(_diretives), function (dname) {

        var rawName = dname
        var def = _diretives[dname]
        dname = NS + dname
        var bindings = util.slice(querySelectorAll(['[' + dname + ']']))
        // compile directive of container 
        if (util.hasAttribute(el, dname)) bindings.unshift(el)
        if (bindings.length) {
            precompile.directives && precompile.directives.push(rawName)
        }
        util.forEach(bindings, function (tar) {
            // save all directives as node properties
            var drefs = tar._diretives || []
            var expr = _getAttribute(tar, dname) || ''
            // prealnt repetitive binding
            if (drefs && ~util.indexOf(drefs, dname)) return
            _removeAttribute(tar, dname)
            drefs.push(dname)
            tar._diretives = drefs

            var sep = conf.directiveSep
            var d
            if (def.multi && expr.match(sep)) {
                // multiple defines expression parse
                var dExprs = []
                util.forEach(
                    _strip(expr).split(sep), 
                    function(item, i) {
                        // discard empty expression 
                        if (!util.trim(item)) return
                        // bad case, such as => key: 'javascript:;';
                        if (conf.directiveKey_regexp.test(item)) {
                            dExprs.push(item)
                        } else {
                            if (i > 0) {
                                // concat to last item
                                dExprs[i - 1] += conf.directiveSep + item
                            } else {
                                return consoler.error('Invalid expression of "{' + expr + '}", it should be in this format: ' + name + '="{ key: expression }".')
                            }
                        }
                    })
                util.forEach(dExprs, function (item) {
                    d = new Directive(vm, tar, def, dname, '{' + item + '}', scope)
                    $directives.push(d)
                })

            } else {
                d = new Directive(vm, tar, def, dname, expr, scope)
                $directives.push(d)
            }
        })
    })

    return replaceEl || el
}
/**
 * Append child ViewModel to parent VideModel
 * @param  {Real} parent            Parent container ViewModel
 * @param  {Function} appendHandler Custom append function
 */
Real.prototype.$appendTo = function (parent, appendHandler) {
    if (!parent || !parent.$el) 
        throw new Error('Unvalid parent viewmodel instance.')

    this.$parent = parent
    appendHandler = appendHandler || function (currNode, parentNode) {
        parentNode.appendChild(currNode)
    }
    appendHandler.call(this, this.$el, parent.$el)
}
/**
 * Update bindings, binding option can enable/disable
 */
Real.prototype.$update = function (updId/*updIds*/, handler) {
    var $components = this.$components
    var $directives = this.$directives
    var $watchers = this.$watchers

    if (updId && updId.length) {
        var multi = util.type(updId) == 'array' ?  true:false
        var updateHandler = function(t) {
            return function (c) {
                if (multi && !~updId.indexOf(c.$updateId)) return
                else if (!multi && c.$updateId !== updId) return

                if (util.type(handler) == 'function') {
                    handler.call(c, t, c.$updateId) && c.$update()
                } else {
                    c.$update()
                }
            }
        }
        util.forEach($components, updateHandler('component'))
        return util.forEach($directives, updateHandler('directive'))
    }

    // update watchers of the VM
    util.forEach($watchers, function (w) {
        w.$update()
    })
    /**
     * Update child components of the ViewModel
     * "$componentShouldUpdate()" is a private method of child-component for updating check.
     */
    util.forEach($components, function (c) {
        if(c.$binding) {
            c.$componentShouldUpdate 
                ? c.$componentShouldUpdate() 
                : c.$update()
        }
    })
    // update directive of the VM
    util.forEach($directives, function (d) {
        d.$update()
    })
}
/**
 * Destroy the ViewModel, relase variables.
 */
Real.prototype.$destroy = function () {
    if (this.$destroyed) return
    // call destroy method before destroy
    this._$beforeDestroy && this._$beforeDestroy()
     // destroy directive of the VM
    util.forEach(this.$watchers, function (w) {
        w.$destroy()
    })
    // destroy child components
    util.forEach(this.$components, function (c) {
        c.$destroy()
    })
    // destroy directive of the VM
    util.forEach(this.$directives, function (d) {
        d.$destroy()
    })
    this.$el = this.$components = this.$directives = this.$watchers = this.$data = this.$methods = this.$refs = null
    this.$set = this.$update = this.$compile = this.$root = this.$appendTo = noop
    this.$destroyed = true
}
Real.prototype.$watch = function (expr, handler) {
    var vm = this
    var w = new Watcher(this, expr, handler)
    var wid = w.$id
    this.$watchers.push(w)
    /**
     * unbind watcher
     */
    return function () {
        var watchers = vm.$watchers
        if (!watchers || !watchers.length) return
        var nextWatchers = []
        util.forEach(watchers, function (item) {
            if (item.$id === wid) {
                item.$destroy()
            } else {
                nextWatchers.push(item)
            }
        })
        vm.$watchers = nextWatchers
    }
}
/**
 * Create Real subc-lass that inherit Real
 * @param {Object} options Real instance options
 * @return {Function} sub-lass of Real
 */
var _classid = 0
function Ctor (options) {
    options = options || {}
    var baseMethods = options.methods
    var classid = _classid ++
    function Class (opts) {
        var baseData = _getData(options.data)
        var instanOpts = util.extend({}, options, opts, {
            data: opts ? _getData(opts.data) : null
        })

        instanOpts.methods = util.extend({}, baseMethods, instanOpts.methods)
        instanOpts.data = util.extend({}, baseData, instanOpts.data)

        this.$classid = classid
        Real.call(this, instanOpts)
    }
    Class.__id = classid
    util.inherit(Class, Real)
    return Class
}
Message.assign(Real, ['on', 'off', 'emit'])
Real.create = function (options) {
    return Ctor(options)
}
Real.component = function (id, options) {
    var c = Ctor(options)
    _components[id] = c
    return c
}
Real.directive = function (id, def) {
    if (def.scoped) _scopedDirectives.push(id) 
    _externalDirectives[id] = def
    setAllDirective()
}
function setAllDirective() {
    _allDiretives = util.extend({}, buildInDirectives, buildInScopedDirectives, _externalDirectives)
    _allDiretiveKeys = util.keys(_allDiretives)
    _allBuildInScopedDecKeys = util.keys(buildInScopedDirectives)
    _allScopedDecKeys = _allBuildInScopedDecKeys.concat(_scopedDirectives)
    _allScopedDecWithCompoentKeys = [conf.namespace + 'component'].concat(util.map(_allScopedDecKeys, function (name) {
        return conf.namespace + name
    }))
}
/**
 * Support config:
 *     - catch
 *     - namespace
 */
Real.set = function (k, v) {
    conf[k] = v
    return Real
}
/**
 * Call method and catch error then log by console.log
 */
function _safelyCall(isCatch, fn, ctx) {
    if (!fn) return

    if (isCatch) {
        try {
            fn.call(ctx)
        } catch(e) {
            consoler.errorTrace(e)
        }
    } else {
        fn.call(ctx)
    }
}

function _execLiteral (expr, vm, name) {
    if (!_isExpr(expr)) return {}
    expr = expr.replace(conf.directiveSep_regexp, ',')
               .replace(/,\s*}$/, '}')

    var r = _execute(vm, expr, name)
    return r[0] ? {} : r[1]
}

function _removeAttribute (el, an) {
    return el && el.removeAttribute(an)
}
function _setAttribute (el, an, av) {
    return el && el.setAttribute && el.setAttribute(an, av)
}
function _mergeAttribute(_from, to) {
    if (_isExpr(_from) && _isExpr(to)) {
        var sep = conf.directiveSep
        var ccStr = _strip(to) + sep + _strip(_from)
        var map = {}
        util.forEach(ccStr.split(sep), function (item) {
            item = util.trim(item)
            if (!item) return
            else {
                var k, v
                v = item.replace(/^[^:]+\:/, function (m) {
                    // skip illegal attribute
                    k = util.trim(m.replace(/:$/, ''))
                    return ''
                })
                if(k) map[k] = v
            }
        })
        // from first
        return Expression.wrapExpr(util.map(util.keys(map), function (k) {
            return k + ':' + map[k]
        }).join(sep))
    }
    return _from
}
function _cloneAttributes(el, target) {
    var attrs = util.slice(el.attributes)
    var needMergedAttrs = util.map(['data', 'style', 'methods', 'attr', 'on', 'props'], function (n) {
        return conf.namespace + n
    })
    util.forEach(attrs, function (att) {
        // In IE9 below, attributes and properties are merged...
        var aname = att.name
        var avalue = att.value

        // unclone function property
        if (util.type(avalue) == 'function') return
        // IE9 below will get all inherited function properties
        if (/^on/.test(aname) && avalue === 'null') return
        try {
            // prevent attribute manual throw exception
            if (aname == 'class') {
                target.className = target.className + (target.className ? ' ' : '') + avalue
                return
            }
            if (util.some(needMergedAttrs, function (n) {
                return aname === n
            })) {
                avalue = _mergeAttribute(avalue, _getAttribute(target, aname))
            }
            target.setAttribute(aname, avalue)
        } catch(e) {
            // In IE, set some attribute will cause error...
            consoler.warn('set attribute fail:'+ e +', name:'+aname + ', value:' + avalue)
        }
    })
    return target
}
function _fragmentWrap (html) {
    var matches = /^\s*<(th|tr|td|thead|tbody)\b/i.exec(html)
    var frag = document.createDocumentFragment()
    var tmp = document.createElement('div')
    var children

    if (matches) {
        // IE9下:
        // 1. thead/tbody/table/th/tr 的 innerHTML 无效，所以要包在template下
        // 2. td 挂在 thead/tbody 下会多一层 tr
        switch (matches[1].toLowerCase()) {
            case 'thead':
            case 'tbody':
                tmp.innerHTML = '<table>' + html + '</table>'
                children = tmp.childNodes[0].childNodes
                break
            case 'th':
            case 'tr':
                tmp.innerHTML = '<table><tbody>' + html + '</tbody></table>'
                children = tmp.childNodes[0].childNodes[0].childNodes
                break
            case 'td':
                tmp.innerHTML = '<table><tbody><tr>' + html + '</tr></tbody></table>'
                children = tmp.childNodes[0].childNodes[0].childNodes[0].childNodes
                break
        }
    }
    if (!children) {
        tmp.innerHTML = html
        children = tmp.childNodes
    }
    while(children.length){
        frag.appendChild(children[0])
    }
    return frag
}
function _fragmentChildren(frag) {
    var children = []
    util.forEach(frag.childNodes, function (node) {
        // element node type
        ;(node.nodeType === 1) && children.push(node)
    })
    return children
}
function _getElementsByClassName(search) {
    if (document.getElementsByClassName) return document.getElementsByClassName(search)
    else {
        /**
         * @author eikes
         * @ref https://gist.github.com/eikes/2299607
         */
        var d = document, elements, pattern, i, results = []
        if (d.querySelectorAll) { // IE8
            return d.querySelectorAll("." + search)
        }
        if (d.evaluate) { // IE6, IE7
            pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]"
            elements = d.evaluate(pattern, d, null, 0, null)
            while ((i = elements.iterateNext())) {
                results.push(i)
            }
        } else {
            elements = d.getElementsByTagName("*")
            pattern = new RegExp("(^|\\s)" + search + "(\\s|$)")
            for (i = 0; i < elements.length; i++) {
                if ( pattern.test(elements[i].className) ) {
                    results.push(elements[i])
                }
            }
        }
        return results
    }
}
function noop() {}
Real.$ = $
Real.util = util
Real.consoler = consoler
Real.nextTick = nextTick
module.exports = Real