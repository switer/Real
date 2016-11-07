'use strict';

var $ = require('./lib/tools/dm')
var util = require('./lib/tools/util')
var conf = require('./lib/conf')
var is = require('./lib/tools/is')
var Query = require('./lib/tools/query')
var consoler = require('./lib/tools/consoler')
var KP = require('./lib/tools/keypath')
var buildInDirectives = require('./lib/directives/build-in')
var buildInScopedDirectives = require('./lib/directives/scoped-directives')
var Expression = require('./lib/tools/expression')
var Directive = require('./lib/directive')
var detection = require('./lib/tools/detection')
var supportQuerySelector = detection.supportQuerySelector
var _execute = require('./lib/tools/execute')
var _components = {}
var _externalDirectives = {}
var _scopedDirectives = []
var _isExpr = Expression.isExpr
var _strip = Expression.strip
var _getAttribute = util.getAttribute
var _cid = 0
var _getData = function (data) {
    return (util.type(data) == 'function' ? data():data) || {}
}
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
    this.$id = _cid ++
    this.$name = options.name || ''
    this.$parent = options.parent || null
    this.$binding = !!_binding
    this.$shouldUpdate = options.shouldUpdate
    this.$directives = []
    this.$components = []
    this._$beforeDestroy = function () {
        _safelyCall(conf['catch'], _destroy, vm)
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
            var children = _fragmentChildren(child)
            if (!children.length) 
                throw new Error('Component with \'' + NS + 'replace\' must has a child element of template.', options.template)
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
            var children = is.Fragment(el) ? _fragmentChildren(el) : el.children
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
    if (hasReplaceOption 
        && util.hasAttribute(el, componentDec) 
        && _getAttribute(el, componentDec) !== options.name) {
        // not same name policy, and make parentVM anonymous
        isReplaced = true
    } else {
        // prevent instance circularly
        _removeAttribute(el, componentDec)
        // expose cid to DOM for debug
        _setAttribute(el, '_' + NS + 'cid', this.$id)
    }

    this.$methods = {}
    this.$refs = {}
    
    // from options.data
    var data = _getData(options.data)
    // prop NS-props
    var props = this._$parseProps(el)
    // from DOM interface
    var _data = _getData(options._data)
    this.$data = util.extend(data, props, _data) 

    util.objEach(options.methods, function (key, m) {
        vm.$methods[key] = vm[key] = util.bind(m, vm)
    })
    // created lifecycle
    _safelyCall(conf['catch'], _created, vm)
    this.$el = el
    var $compiledEl = this.$compile(el)
    isReplaced && (this.$el = $compiledEl)
    // ready lifecycle
    _safelyCall(conf['catch'], _ready, vm)
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
Real.prototype.$compile = function (el, scope) {
    if (util.type(el) == 'string') el = _fragmentWrap(el)

    var NS = conf.namespace
    var $directives = scope ? scope.$directives : this.$directives
    var $components = scope ? scope.$components : this.$components
    var componentDec = NS + 'component'
    var vm = this
    // compile directives of the VM
    var _diretives = util.extend({}, buildInDirectives, buildInScopedDirectives, _externalDirectives)
    var attSels = util.keys(_diretives)
    var scopedDec = util.keys(buildInScopedDirectives).concat(_scopedDirectives)
    var allScopedDec = [componentDec].concat(util.map(scopedDec, function (name) {
        return conf.namespace + name
    }))
    var querySelectorAll = Query(
        el, 
        allScopedDec, 
        // normal attribute directives
        util.map(attSels, function (name) {
            return conf.namespace + name
        })
    )

    if (supportQuerySelector) {
        // nested component
        // Block selector cartesian product
        var scopeSelectors = allScopedDec
        var selectors = []
        // Selector's cartesian product
        util.forEach(scopeSelectors, function (dec1) {
            return util.forEach(scopeSelectors, function (dec2) {
                selectors.push('[' + dec1 + '] [' + dec2 + ']')
            })
        })
        var scopedChilds = util.slice(el.querySelectorAll(selectors))
    }
    var scopedElements = querySelectorAll(util.map(scopedDec, function (name) {
        return '[' + conf.namespace + name + ']'
    }))
    var componentElements = querySelectorAll(['[' + componentDec + ']'])
    var compileComponent = function (tar) {
        // prevent cross DOM level parsing or repeat parse
        if (tar._component) return
            
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
        var replaceOpt = _getAttribute(tar, NS + 'replace')
        var data = {}
        var methods = {}
        var preData = {}

        replaceOpt = util.hasAttribute(tar, NS + 'replace')
            ? replaceOpt == 'true' || replaceOpt == '1'
            : false
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
            binding: (bindingOpt === 'false' || bindingOpt === '0') ? false : true,
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
            var shouldUpdate = this.$shouldUpdate
            var nextData = _execLiteral(cdata, vm)
            // no cdata binding will not trigger update
            if (cdata && util.diff(preData, nextData)) {
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
                instanceScopedDirective(tar, dec, dname)
                return true
            }
        })
    })

    /**
     * compile normal atributes directives
     */
    util.forEach(util.keys(_diretives), function (dname) {

        var def = _diretives[dname]
        dname = NS + dname
        var bindings = util.slice(querySelectorAll(['[' + dname + ']']))
        // compile directive of container 
        if (util.hasAttribute(el, dname)) bindings.unshift(el)

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
                util.forEach(
                    _strip(expr).split(sep), 
                    function(item) {
                        // discard empty expression 
                        if (!util.trim(item)) return
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
    // update child components
    util.forEach(this.$components, function (c) {
        c.$destroy()
    })
    // update directive of the VM
    util.forEach(this.$directives, function (d) {
        d.$destroy()
    })
    this.$el = this.$components = this.$directives = this.$data = this.$methods = this.$refs = null
    this.$set = this.$update = this.$compile = this.$root = this.$appendTo = noop
    this.$destroyed = true
}
/**
 * Create Real subc-lass that inherit Real
 * @param {Object} options Real instance options
 * @return {Function} sub-lass of Real
 */
var _classid = 0
function Ctor (options) {
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
}
Real.set = function (k, v) {
    conf[k] = v
    return Real
}


function _isScopedElement(el) {
    if (!el) return false
    return util.some(util.keys(buildInScopedDirectives).concat(_scopedDirectives), function (k) {
        return util.hasAttribute(conf.namespace + k)
    })
}

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
module.exports = Real