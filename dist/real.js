/**
* Real v2.1.0
* (c) 2015 switer
* Released under the MIT License.
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Real"] = factory();
	else
		root["Real"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var $ = __webpack_require__(1)
	var util = __webpack_require__(2)
	var conf = __webpack_require__(5)
	var is = __webpack_require__(4)
	var Query = __webpack_require__(6)
	var consoler = __webpack_require__(7)
	var KP = __webpack_require__(8)
	var nextTick = __webpack_require__(9)
	var buildInDirectives = __webpack_require__(10)
	var buildInScopedDirectives = __webpack_require__(13)(Real)
	var Expression = __webpack_require__(11)
	var Directive = __webpack_require__(14)
	var Watcher = __webpack_require__(17)
	var Message = __webpack_require__(18)
	var detection = __webpack_require__(3)
	var supportQuerySelector = detection.supportQuerySelector
	var _execute = __webpack_require__(15)
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
	var CATCH_KEY = 'CATCH'.toLowerCase()
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
	    var _message = new Message()

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
	    /**
	     * Assign Event-methods to component instance
	     */
	    this.$on = function() {
	        return _message.on.apply(_message, arguments)
	    }
	    this.$off = function() {
	        return _message.off.apply(_message, arguments)
	    }
	    this.$emit = function() {
	        return _message.emit.apply(_message, arguments)
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

	    util.objEach(options.methods, function (key, m) {
	        vm.$methods[key] = vm[key] = util.bind(m, vm)
	    })
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
	        var $compiledEl = this.$compile(el)
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
	    var scopedDecKeys = util.keys(buildInScopedDirectives)
	    var scopedDec = scopedDecKeys.concat(_scopedDirectives)
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
	        // build in scoped directive is first
	        if (util.some(scopedDecKeys, function (k) {
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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *  DOM manipulations
	 */

	'use strict';
	var util = __webpack_require__(2)
	var is = __webpack_require__(4)

	function Selector(sel) {
	    if (util.type(sel) == 'string') {
	        return Shell(util.copyArray(document.querySelectorAll(sel)))
	    }
	    else if (util.type(sel) == 'array') {
	        return Shell(sel)
	    }
	    else if (sel instanceof Shell) return sel
	    else if (is.DOM(sel)) {
	        return Shell(new ElementArray(sel))
	    }
	    else {
	        throw new Error('Unexpect selector !')
	    }
	}

	function Shell(nodes) {
	    if (nodes instanceof Shell) return nodes
	    var $items = new ElementArray()
	    util.forEach(nodes, function (item) {
	        $items.push(item)
	    })
	    return $items
	}

	function ElementArray () {
	    var _arr = util.slice(arguments)
	    var that = this
	    this.push = function (el) {
	        _arr.push(el)
	        that[_arr.length - 1] = el
	        that.length = _arr.length
	    }
	    this.forEach = function (fn) {
	        util.forEach(_arr, fn)
	    }
	    this.forEach(function (item, i) {
	        that[i] = item
	    })
	    this.length = _arr.length
	}

	ElementArray.prototype = Shell.prototype

	var proto = Shell.prototype
	proto.find = function(sel) {
	    var subs = []
	    this.forEach(function(n) {
	        subs = subs.concat(util.copyArray(n.querySelectorAll(sel)))
	    })
	    return Shell(subs)
	}
	proto.attr = function(attname, attvalue) {
	    var len = arguments.length
	    var el = this[0]

	    if (len > 1) {
	        el.setAttribute(attname, attvalue)
	    } else if (len == 1) {
	        return (el.getAttribute(attname) || '').toString()
	    }
	    return this
	}
	proto.removeAttr = function(attname) {
	    this.forEach(function(el) {
	        el.removeAttribute(attname)
	    })
	    return this
	}
	proto.addClass = function(clazz) {
	    this.forEach(function(el) {

	        // IE9 below not support classList
	        // el.classList.add(clazz)

	        var classes = clazz
	        if (util.type(clazz) == 'string') {
	            classes = [clazz]
	        }
	        if (el.classList && el.classList.add) {
	            util.forEach(classes, function (c) {
	                el.classList.add(c)
	            })
	        } else {
	            var classList = el.className.split(/\s+/)
	            util.forEach(classes, function (c) {
	                if (!~util.indexOf(classList, c)) classList.push(c)
	            })
	            el.className = classList.join(' ')
	        }
	    })
	    return this
	}
	proto.removeClass = function(clazz) {
	    this.forEach(function(el) {
	        
	        // IE9 below not support classList
	        // el.classList.remove(clazz)

	        var classes = clazz
	        if (util.type(clazz) == 'string') {
	            classes = [clazz]
	        }
	        if (el.classList && el.classList.remove) {
	            util.forEach(classes, function (c) {
	                el.classList.remove(c)
	            })
	        } else {
	            var classList = el.className.split(' ')
	            util.forEach(classes, function (c) {
	                var index = util.indexOf(classList, c)
	                if (~index) classList.splice(index, 1)
	            })
	            el.className = classList.join(' ')
	        }

	    })
	    return this
	}
	proto.hasClass = function(clazz) {
	    if (!this[0]) return false
	    var classList = this[0].className.split(' ')
	    return !!~util.indexOf(classList, clazz)
	}
	proto.each = function(fn) {
	    this.forEach(fn)
	    return this
	}
	var ieEvent = !document.addEventListener
	proto.on = function(type, listener, capture) {
	    this.forEach(function(el) {
	        if (ieEvent) {
	            el.attachEvent('on' + type, listener)
	        } else {
	            el.addEventListener(type, listener, capture)
	        }
	    })
	    return this
	}
	proto.off = function(type, listener, capture) {
	    this.forEach(function(el) {
	        if (ieEvent) {
	            el.detachEvent('on' + type, listener)
	        } else {
	            el.removeEventListener(type, listener, capture)
	        }
	    })
	    return this
	}
	proto.html = function(html) {
	    var len = arguments.length
	    if (len >= 1) {
	        this.forEach(function(el) {
	            el.innerHTML = html
	        })
	    } else if (this.length) {
	        return this[0].innerHTML
	    }
	    return this
	}
	proto.parent = function() {
	    if (!this.length) return null
	    return Shell([_parentNode(this[0])])
	}
	proto.remove = function() {
	    this.forEach(function(el) {
	        var parent = _parentNode(el)
	        parent && parent.removeChild(el)
	    })
	    return this
	}
	proto.insertBefore = function (pos) {
	    var tar
	    if (!this.length) return this
	    else if (this.length == 1) {
	        tar = this[0]
	    } else {
	        tar = _createDocumentFragment()
	        this.forEach(function (el) {
	            _appendChild(tar, el)
	        })
	    }
	    _parentNode(pos).insertBefore(tar, pos)
	    return this
	}
	proto.insertAfter = function (pos) {
	    var tar
	    if (!this.length) return this
	    else if (this.length == 1) {
	        tar = this[0]
	    } else {
	        tar = _createDocumentFragment()
	        this.forEach(function (el) {
	            _appendChild(tar, el)
	        })
	    }
	    _parentNode(pos).insertBefore(tar, pos.nextSibling)
	    return this
	}
	// return element by index
	proto.get = function(i) {
	    return this[i]
	}
	proto.append = function(n) {
	    if (this.length) _appendChild(this[0], n)
	    return this
	}
	proto.appendTo = function (p) {
	    if (this.length == 1) _appendChild(p, this[0])
	    else if (this.length > 1) {
	        var f = _createDocumentFragment()
	        this.forEach(function (n) {
	            _appendChild(f, n)
	        })
	        _appendChild(p, f)
	    }
	}
	proto.replace = function(n) {
	    var tar = this[0]
	    _parentNode(tar).replaceChild(n, tar)
	    return this
	}

	function _parentNode (e) {
	    return e && e.parentNode
	}

	function _createDocumentFragment () {
	    return document.createDocumentFragment()
	}

	function _appendChild (p, c) {
	    return p.appendChild(c)
	}
	Selector.DOM = Shell
	module.exports = Selector


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var detection = __webpack_require__(3)

	function hasOwn (obj, prop) {
	    return obj && obj.hasOwnProperty(prop)
	}
	var escapeCharMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '\"': '&quot;',
	    '\'': '&#x27;',
	    '/': '&#x2F;'
	}
	function _keys(o){
	    var ks = []
	    for (var k in o) {
	        if (hasOwn(o, k)) ks.push(k)
	    }
	    return ks
	}
	var entCon = document.createElement('div')
	var entities = {}
	function _convertEntity(ent) {
	    var r = entities[ent]
	    if (r) return r
	    entCon.innerHTML = ent
	    var chNodes = entCon.childNodes
	    r = chNodes && chNodes.length ? chNodes[0].nodeValue : ent
	    entities[ent] = r
	    return r
	}
	var undef = void(0)
	var escapeRex = new RegExp(_keys(escapeCharMap).join('|'), 'g')
	var DEFAULT_DIFF_LEVEL = 5
	var util = {
	    type: function(obj) {
	        if (obj === null) return 'null'
	        else if (obj === undef) return 'undefined'
	        var m = /\[object (\w+)\]/.exec(Object.prototype.toString.call(obj))
	        return m ? m[1].toLowerCase() : ''    
	    },
	    keys: function (obj) {
	        var keys = []
	        if (!obj) return keys
	        if (Object.keys) return Object.keys(obj)
	        this.objEach(obj, function (key) {
	            keys.push(key)
	        })
	        return keys
	    },
	    bind: function (fn, ctx) {
	        if (fn.bind) return fn.bind(ctx)
	        return function () {
	            return fn.apply(ctx, arguments)
	        }
	    },
	    extend: function(obj) {
	        if (this.type(obj) != 'object') return obj;
	        var source, prop;
	        for (var i = 1, length = arguments.length; i < length; i++) {
	            source = arguments[i];
	            for (prop in source) {
	                obj[prop] = source[prop];
	            }
	        }
	        return obj;
	    },
	    trim: function (str) {
	        if (str.trim) return str.trim()
	        else {
	            return str.replace(/^\s+|\s+$/gm, '')
	        }
	    },
	    strip: function (str) {
	        return str.replace(/^['"]|['"]$/gm, '')
	    },
	    indexOf: function (arr, tar) {
	        if (arr.indexOf) return arr.indexOf(tar)
	        else {
	            var i = -1
	            util.some(arr, function (item, index) {
	                if (item === tar) {
	                    i = index
	                    return true
	                }
	            })
	            return i
	        }
	    },
	    forEach: function (arr, fn) {
	        if (arr.forEach) return arr.forEach(fn)
	        else {
	            var len = arr.length
	            for (var i = 0 ; i < len; i++) {
	                fn(arr[i], i)
	            }
	        }
	        return arr
	    },
	    some: function (arr, fn) {
	        if (arr.some) return arr.some(fn)
	        else {
	            var len = arr.length
	            var r = false
	            for (var i = 0 ; i < len; i++) {
	                if (fn(arr[i], i)) {
	                    r = true
	                    break
	                }
	            }
	            return r
	        }
	    },
	    map: function (arr, fn) {
	        if (arr.map) return arr.map(fn)
	        else {
	            var len = arr.length
	            var next = []
	            for (var i = 0 ; i < len; i++) {
	                next.push(fn(arr[i], i))
	            }
	            return next
	        }
	    },
	    objEach: function (obj, fn) {
	        if (!obj) return
	        for(var key in obj) {
	            if (hasOwn(obj, key)) {
	                if(fn(key, obj[key]) === false) break
	            }
	        }
	    },
	    domRange: function (tar, before, after) {
	        var children = []
	        var nodes = tar.childNodes
	        var start = false
	        for (var i = 0; i < nodes.length; i++) {
	            var item = nodes[i]
	            if (item === after) break
	            else if (start) {
	                children.push(item)
	            } else if (item == before) {
	                start = true
	            }
	        }
	        return children
	    },
	    immutable: function (obj) {
	        var that = this
	        var _t = this.type(obj)
	        var n

	        if (_t == 'array') {
	            n = util.map(obj, function (item) {
	                return that.immutable(item)
	            })
	        } else if (_t == 'object') {
	            n = {}
	            this.objEach(obj, function (k, v) {
	                n[k] = that.immutable(v)
	            })
	        } else {
	            n = obj
	        }
	        return n
	    },
	    diff: function(next, pre, _t) {
	        var that = this
	        _t = _t === undefined ? DEFAULT_DIFF_LEVEL : _t

	        if (_t <= 0) return next !== pre

	        if (this.type(next) == 'array' && this.type(pre) == 'array') {
	            if (next.length !== pre.length) return true
	            return util.some(next, function(item, index) {
	                return that.diff(item, pre[index], _t - 1)
	            })
	        } else if (this.type(next) == 'object' && this.type(pre) == 'object') {
	            var nkeys = util.keys(next)
	            var pkeys = util.keys(pre)
	            if (nkeys.length != pkeys.length) return true

	            var that = this
	            return util.some(nkeys, function(k) {
	                return (!~util.indexOf(pkeys, k)) || that.diff(next[k], pre[k], _t - 1)
	            })
	        }
	        return next !== pre
	    },
	    slice: function (a) {
	        if (!a || !a.length) return []
	        if (a.slice) return a.slice(0)
	        var len = a.length
	        var next = []
	        for (var i = 0; i < len; i ++) {
	            next.push(a[i])
	        }
	        return next
	    },
	    walk: function(node, fn) {
	        var into = fn(node) !== false
	        var that = this
	        if (into) {
	            var children = util.slice(node.childNodes)
	            util.forEach(children, function (i) {
	                that.walk(i, fn)
	            })
	        }
	    },
	    isUndef: function (obj) {
	        return obj === void(0)
	    },
	    escape: function (str) {
	        if (this.type(str) !== 'string') return str
	        return str.replace(escapeRex, function (m) {
	            return escapeCharMap[m]
	        })
	    },
	    hasOwn: hasOwn,
	    hasAttribute: function(el, an) {
	        if (el.hasAttribute) return el.hasAttribute(an)
	        else if (!el.getAttribute) return false
	        return el.getAttribute(an) !== null
	    },
	    getAttribute: function (el, an) {
	        return el && el.getAttribute(an)
	    },
	    split: function (str, sep) {
	        if (detection.ie && detection.ie <= 8) {
	            // IE8 below, convert regexp sep to string sep
	            // http://stackoverflow.com/questions/11144628/ie8-parses-this-simple-regex-differently-from-all-other-browsers
	            var placeholder = '[\uFFF3|\uFFF4]'
	            str = str.replace(sep, function () {
	                return placeholder
	            })
	            return str.split(placeholder)
	        } else {
	            return str.split(sep)
	        }
	    },
	    inherit: function (clazz, target) {
	        function F () {}
	        F.prototype = target.prototype
	        clazz.prototype = new F()
	        return clazz
	    },
	    /**
	     * Covert HTML entities
	     * @doc http://www.w3school.com.cn/tags/html_ref_entities.html
	     */
	    entity: function(text) {
	        if (!text || !text.replace) return text
	        return text.replace(/(&[#a-zA-Z0-9]+;)/g, function (m, s) {
	            return _convertEntity(s)
	        })
	    },
	    isObj: function (obj) {
	        return Object.prototype.toString.call(obj) == '[object Object]'
	    }
	}

	module.exports = util

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * IE5~IE9
	 */
	function detect() {
	    var undef,
	        v = 3,
	        div = document.createElement('div'),
	        all = div.getElementsByTagName('i');

	    while (
	        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
	        all[0]
	    );

	    return v > 4 ? v : undef;
	}

	var ie = detect()
	var inp = document.createElement('input')
	module.exports = {
		ie: ie,
		supportQuerySelector: document.querySelector && document.querySelectorAll,
	    supportChangeEvent: 'onchange' in inp,
	    supportKeyupEvent: 'onkeyup' in inp
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	    Element: function(el) {
	    	// 1: ELEMENT_NODE, 11: DOCUMENT_FRAGMENT_NODE
	        return el && (el.nodeType == 1 || el.nodeType == 11)
	    },
	    Fragment: function(el) {
	        // 11: DOCUMENT_FRAGMENT_NODE
	        return el && el.nodeType == 11
	    },
	    DOM: function (el) {
	    	// 8: COMMENT_NODE
	        return el && (this.Element(el) || el.nodeType == 8)
	    }
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	var conf = {
		namespace: 'r-',
		directiveSep: ';',
	    directiveSep_regexp: /;/g,
	    directiveKey_regexp: /^\s*['"]?[^:]+['"]?\s*:/m,
	    mutable_dirtives: ['html', 'text']
		// 'catch': false // catch error when component instance or not
	}
	// IE8 hack
	conf['CATCH'.toLowerCase()] = false
	module.exports = conf

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(2)
	var is = __webpack_require__(4)
	var supportQuerySelector = __webpack_require__(3).supportQuerySelector

	/**
	 * Query all elements that inde "sels", and which element match scoped selector will be skipped.
	 * All selector is attribute selector
	 * @param {Element} el container element
	 * @param {Array} scopedSels scope element's selector
	 * @param {Array} seles selectors
	 */
	module.exports = function (el, scopedSels, sels) {
		if (!supportQuerySelector) {
			var _elements = {}
			util.walk(el, function (node) {
				if (!is.Element(node)) return false
				util.forEach(sels, function (sel) {
					if (util.hasAttribute(node, sel)) {
						if (!_elements[sel]) _elements[sel] = []
						_elements[sel].push(node)
					}
				})
				// checking for scoped attributes
				var isScoped
				util.forEach(scopedSels, function (scopedSel) {
					if (util.hasAttribute(node, scopedSel)) {
						isScoped = true
						if (!_elements[scopedSel]) _elements[scopedSel] = []
						_elements[scopedSel].push(node)
					}
				})
				if (isScoped) return false
				return true
			})
		}

		return function (sels) {
			if (supportQuerySelector) {
				return el.querySelectorAll(sels.join(','))
			} else {
				var nodeList = []
				var reduplicative = {}
				util.forEach(sels, function (selector) {
					var propName = selector.match(/^\[(.+?)\]$/)[1]
					if (reduplicative[propName]) return
					reduplicative[propName] = true

					var targets = _elements[propName] || []
					if (!nodeList.length) nodeList = nodeList.concat(targets)
					else {
						// reduce: remove reduplications
						util.forEach(targets, function (el) {
							if (!~util.indexOf(nodeList, el)) nodeList.push(el)
						})
					}
				})
				return nodeList
			}
		}
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * Console shim for IE8 below
	 */
	'use strict';

	var co = window.console
	var isCompeletedSupport = co && co.log && co.error && co.warn && co.info
	function log(type, args) {
		// IE8 below console could be not defined, if Devtool panel is not opened.
		if (!co) return

		var printer = co[type]
		if (printer && typeof printer.apply == 'function') {
			printer.apply(co, args)
		} else {
			var logs = []
			logs.push('[' + type.toUpperCase() + ']')
			for (var i = 0; i < args.length; i ++) {
				logs.push(args[i])
			}
			co.log(logs.join(' '))
		}
	}
	var logger = isCompeletedSupport ? co : {
		log: function () {
			log('log', arguments)
		},
		error: function () {
			log('error', arguments)
		},
		warn: function () {
			log('warn', arguments)
		},
		info: function () {
			log('info', arguments)
		}
	}
	// custom error trace methods
	logger.errorTrace = function (error) {
		if (!co) return

		if (!co.groupCollapsed || !co.groupEnd) {
			logger.log(error)
		} else if (!error.stack) {
			logger.error(error.message || error)
		} else {
			co.groupCollapsed('%c' + error.message, 'color: white;background:red')
			var lines = error.stack.split('\n')
			lines.shift()
			for (var i =0; i < lines.length; i++) {
				co.log(lines[i])
			}
			co.groupEnd()
		}
	}

	module.exports = logger

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(2)
	/**
	 *  normalize all access ways into dot access
	 *  @example "person.books[1].title" --> "person.books.1.title"
	 */
	function _keyPathNormalize(kp) {
	    return String(kp).replace(/\[([^\[\]]+)\]/g, function(m, k) {
	        return '.' + k.replace(/^["']|["']$/g, '')
	    })
	}
	function _isNon (o) {
	    return util.isUndef(o) || o === null
	}
	/**
	 *  set value to object by keypath
	 */
	function _set(obj, keypath, value) {
	    var parts = _keyPathNormalize(keypath).split('.')
	    var last = parts.pop()
	    var dest = obj
	    var hasError
	    var errorInfo
	    util.some(parts, function(key) {
	        var t = util.type(dest)
	        if (t != 'object' && t != 'array') {
	            hasError = true
	            errorInfo = [key, dest]
	            return true
	        }
	        dest = dest[key]
	    })
	    // set value
	    if (!hasError) {
	        if (util.type(dest) != 'object' && util.type(dest) != 'array') {
	            hasError = true
	            errorInfo = [last, dest]
	        } else {
	            dest[last] = value
	            return obj
	        }
	    }
	    throw new Error('Can\' not access "' + errorInfo[0] + '" of "'+ errorInfo[1] + '" when set value of "' + keypath + '"')
	}
	function _get(obj, keypath) {
	    var parts = _keyPathNormalize(keypath).split('.')
	    var dest = obj

	    util.some(parts, function(key) {
	        if (_isNon(dest)) {
	            dest = void(0)
	            return true
	        }
	        dest = dest[key]
	    })
	    return dest
	}
	module.exports = {
	    normalize: _keyPathNormalize,
	    set: _set,
	    get: _get
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var tasks = []
	var pending
	var util = __webpack_require__(2)
	module.exports = function (fn) {
		if (pending) {
			tasks.push(fn)
			return
		}
		pending = true
		setTimeout(function () {
			pending = false
			var flushTask = tasks
			tasks = []
			try {
				fn && fn()
			} finally {
				util.forEach(flushTask, function (t) {
					t && t()				
				})
			}
		}, 0)
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *  Global Build-in Directives
	 */

	'use strict';

	var $ = __webpack_require__(1)
	var conf = __webpack_require__(5)
	var util = __webpack_require__(2)
	var consoler = __webpack_require__(7)
	var detection = __webpack_require__(3)
	var Expression = __webpack_require__(11)
	var keypath = __webpack_require__(8)
	var delegate = __webpack_require__(12)
	var CLASS_KEY = 'CLASS'.toLowerCase()
	function noop () {}
	function _templateShouldUpdate(vm) {
	    return util.some(vm._expressions, function(exp, index) {
	        var pv = vm._caches[index]
	        var nv = vm.$exec(exp)
	        if (!nv[0]) {
	            return !!vm.$diff(pv, nv[1])
	        }
	    })
	}
	function _eventUpdate(vm, handler, capture) {
	    vm.unbind()
	    var fn = handler
	    if (util.type(fn) !== 'function')
	        return consoler.warn('"' + conf.namespace + 'on" only accept function. {' + vm._expr + '}')

	    var that = vm
	    vm.fn = function (e) {
	        e.$currentTarget = that.$el
	        e.$preventDefault = preventDefault
	        e.$stopPropagation = stopPropagation
	        fn.call(that.$vm, e)
	    }
	    $(vm.$el).on(vm.type, vm.fn, !!capture)
	}
	function preventDefault(e) {
	    e = e || window.event
	    if (!e) return
	    e.preventDefault 
	        ? e.preventDefault() 
	        : e.returnValue = false
	}
	function stopPropagation(e) {
	    e = e || window.event
	    if (!e) return
	    if (e.stopPropagation) {
	        e.stopPropagation() 
	    } else {
	        e.cancelBubble = true
	        window.event && (window.event.cancelBubble = true)
	    }
	}
	function _onConf (capture) {
	    return {
	        multi: true,
	        bind: function(evtType, handler, expression) {
	            this._expr = expression
	            var tagName = this.$el.tagName
	            // IE8 below do not support onchange event
	            if (evtType == 'vchange') {
	                if ((tagName == 'INPUT' || tagName == 'TEXTAREA') && !('onchange' in this.$el)) {
	                    if ('onkeyup' in this.$el) {evtType = 'keyup'}
	                    else evtType = 'input'
	                } else {
	                    evtType = 'change'
	                }
	            }
	            this.type = evtType
	        },
	        update: function (handler) {
	            return _eventUpdate(this, handler, capture)
	        },
	        unbind: function() {
	            if (this.fn) {
	                $(this.$el).off(this.type, this.fn, !!capture)
	                this.fn = null
	            }
	        }
	    }
	}
	var ds = {
	    'attr': {
	        multi: true,
	        bind: function(attname) {
	            this.attname = attname
	            this._$el = $(this.$el)
	        },
	        update: function(next) {
	            if (util.isUndef(next)) {
	                this._$el.removeAttr(this.attname)
	            } else {
	                this._$el.attr(this.attname, next)
	            }
	        },
	        unbind: function () {
	            this._$el = null
	        }
	    },
	    'html': {
	        constant: true,
	        bind: function (opt) {
	            // if express is not empty will set innerHTML with expression result.
	            // Otherwise render content template then set innerHTML.
	            var reg = Expression.exprRegexp
	            var isReplace = opt == 'replace' || opt != 'inner'
	            var usingAttrExpr = opt != 'replace' && opt != 'inner' && !!opt
	            var template = this.$el.innerHTML
	            var expr = usingAttrExpr ? opt : template

	            if (!expr) {
	                expr = ''
	                consoler.warn('Content template should not empty of "' + conf.namespace + 'html".', this.$el)
	            }
	            var veilExpr = Expression.veil(expr)
	            var expressions = this._expressions = util.map(veilExpr.match(reg) || [], function (exp) {
	                return Expression.angleBrackets(Expression.strip(exp))
	            }) || [expr]

	            var parts = util.split(veilExpr, reg)
	            var caches = this._caches = new Array(expressions.length)
	            var that = this


	            /**
	             * Computed all expression and get concated result
	             */
	            function compute () {
	                // set value
	                util.forEach(expressions, function(exp, index) {
	                    var v = that.$exec(exp)
	                    if (!v[0]) caches[index] = v[1]
	                })
	                // get content
	                var frags = []
	                util.forEach(parts, function(item, index) {
	                    frags.push(item)
	                    if (index < expressions.length) {
	                        frags.push(caches[index])
	                    }
	                })
	                return Expression.unveil(frags.join(''))
	            }

	            if (!isReplace) {
	                this._render = function () {
	                    this.$el.innerHTML = compute()
	                }
	            } else {
	                var parent = this.$el.parentNode
	                var tmpCon = document.createElement('div')
	                var fragCon = document.createDocumentFragment()
	                var before = document.createComment('<' + conf.namespace + 'html>' + expr)
	                var after = document.createComment('</' + conf.namespace + 'html>')

	                fragCon.appendChild(before)
	                fragCon.appendChild(after)
	                parent.replaceChild(fragCon, this.$el)

	                this._render = function () {
	                    // parent may be a fragment node
	                    parent = before.parentNode
	                    
	                    var result = compute()
	                    var childRange = util.domRange(parent, before, after)

	                    /**
	                     * Convert html to nodes
	                     */
	                    tmpCon.innerHTML = result
	                    util.forEach(util.slice(tmpCon.childNodes), function (node) {
	                        fragCon.appendChild(node)
	                    })
	                    /**
	                     * Remve last children
	                     */
	                    util.forEach(childRange, function (child) {
	                        parent.removeChild(child)
	                    })
	                    parent.insertBefore(fragCon, after)
	                }
	            }
	        },
	        shouldUpdate: function () {
	            return _templateShouldUpdate(this)
	        },
	        update: function() {
	            this._render()
	        },
	        unbind: function () {
	            this._render = noop
	            this._expressions = this._caches = null
	        }
	    },
	    'show': {
	        update: function(next) {
	            this.$el.style.display = next ? '' : 'none'
	        }
	    },
	    'style': {
	        multi: true,
	        bind: function(sheet) {
	            this.sheet = sheet
	        },
	        update: function(next) {
	            if(this.$el.style) this.$el.style[this.sheet] = next
	        }
	    },
	    'text': {
	        constant: true,
	        bind: function (opt) {
	            var isReplace = opt == 'replace' || opt != 'inner'
	            var usingAttrExpr = opt != 'replace' && opt != 'inner' && !!opt
	            var reg = Expression.exprRegexp
	            var expr = this.expr = usingAttrExpr ? opt : this.$el.innerHTML
	            var veilExpr = Expression.veil(expr)
	            var expressions = this._expressions = util.map(veilExpr.match(reg) || [], function (exp) {
	                return Expression.angleBrackets(Expression.strip(exp))
	            }) || [veilExpr]
	            var parts = util.split(veilExpr, reg)
	            var caches = this._caches = new Array(expressions.length)
	            var that = this

	            var $textNode
	            var $el = this.$el
	            this.render = function () {
	                // set value
	                util.forEach(expressions, function(exp, index) {
	                    var v = that.$exec(exp)
	                    if (!v[0]) caches[index] = v[1]
	                })
	                // get content
	                var frags = []
	                util.forEach(parts, function(item, index) {
	                    frags.push(item)
	                    if (index < expressions.length) {
	                        frags.push(caches[index])
	                    }
	                })
	                var result = Expression.unveil(frags.join(''))
	                if (isReplace) {
	                    // TODO, Number Mobile bug, trying to using replaceChild
	                    $textNode.nodeValue = util.entity(result)
	                } else {
	                    this.$el['innerText' in $el ? 'innerText' : 'textContent'] = util.entity(result)
	                }
	            }
	            if (isReplace) {
	                $textNode = this.textNode = document.createTextNode('')
	                var pn = this.$el.parentNode
	                if (pn) {
	                    pn.replaceChild($textNode, this.$el)
	                } else {
	                    return consoler.error('"' + conf.namespace + 'text" \'s parentNode is not found. {' + this.$expr + '}')
	                }
	            }
	            this.render()
	        },
	        shouldUpdate: function () {
	            return _templateShouldUpdate(this)
	        },
	        update: function () {
	            this.render()
	        },
	        unbind: function () {
	            this.render = noop
	            this._expressions = this._caches = this.textNode = null
	        }
	    },
	    'model': bindModel(),
	    'xmodel': bindModel(true),
	    'capture': _onConf(true),
	    'on': _onConf(false),
	    'click': {
	        bind: function(handler, expression) {
	            this._expr = expression
	            this.type = 'click'
	        },
	        update: function (handler) {
	            return _eventUpdate(this, handler)
	        },
	        unbind: function() {
	            if (this.fn) {
	                $(this.$el).off(this.type, this.fn)
	                this.fn = null
	            }
	        }
	    },
	    'dataset': {
	        multi: true,
	        bind: function(attname) {
	            this.attname = 'data-' + attname
	            this._$el = $(this.$el)
	        },
	        update: function(next) {
	            if (util.isUndef(next)) {
	                this._$el.removeAttr(this.attname)
	            } else {
	                this._$el.attr(this.attname, next)
	            }
	        },
	        unbind: function () {
	            this.attname = ''
	            this._$el = null
	        }
	    },
	    'src': {
	        bind: function(src) {
	            this.src = src || ''
	            this._$el = $(this.$el)
	        },
	        update: function(src) {
	            this._$el.attr('src', src || '')
	        },
	        unbind: function () {
	            this._$el = null
	        }
	    },
	    'href': {
	        bind: function(href) {
	            this.href = href || ''
	            this._$el = $(this.$el)
	        },
	        update: function(href) {
	            this._$el.attr('href', href || '')
	        },
	        unbind: function () {
	            this._$el = null
	        }
	    },
	    'classes': {
	        bind: function() {
	            this._$el = $(this.$el)
	        },
	        update: function (classes) {
	            var that = this
	            if (this._classes) {
	                that._$el.removeClass(this._classes)
	            }
	            var type = util.type(classes)
	            if (type == 'array') {
	                classes = util.map(classes, function (clazz) {
	                    return util.trim(clazz)
	                })
	            } else if (type == 'string') {
	                classes = util.trim(classes).split(/\s+/m)
	            }
	            this._classes = classes
	            that._$el.addClass(classes)
	        },
	        unbind: function () {
	            this._$el = this._classes = null
	        }
	    },
	    'delegate': {
	        multi: true,
	        bind: function (typeSel, handler) {
	            var type
	            var selector = typeSel.replace(/^\s*(\w+)\s+/, function (m, t) {
	                type = t
	                return ''
	            })
	            if (!type) {
	                return consoler.error('"' + conf.namespace + 'delegate" need specify event type. ' + this.$rawExpr)
	            }
	            selector = util.trim(selector)
	            if (!selector) {
	                return consoler.error('"' + conf.namespace + 'delegate" need specify selector for element. ' + this.$rawExpr)
	            }
	            var that = this
	            this._handler = handler
	            this._unbind = delegate(this.$el, type, selector, function (e) {
	                that._handler && that._handler(e)
	            })
	        },
	        update: function (handler) {
	            this._handler = handler
	        },
	        unbind: function () {
	            this._unbind()
	            this._handler = this._unbind = null
	        }
	    }
	}

	function bindModel(isMulti) {
	    return {
	        multi: !!isMulti,
	        bind: function (prop, request) {
	            var tagName = this.$el.tagName
	            var type = tagName.toLowerCase()
	            var $el = this._$el = $(this.$el)
	            this._request = isMulti ? request : null
	            
	            type = type == 'input' ? $el.attr('type') || 'text' : type

	            switch (type) {
	                case 'tel':
	                case 'url':
	                case 'text':
	                case 'email':
	                case 'search':
	                case 'password':
	                case 'textarea':
	                    // todo: support composite events
	                    if (detection.supportChangeEvent) {
	                        // sometime, input doesn't fire change event
	                        this.evtType = 'change,input'
	                    } else if (detection.supportKeyupEvent) {
	                        // IE9 doesn't fire input event on backspace/del/cut , inspired by vue
	                        this.evtType = 'keyup,input'
	                    } else {
	                        this.evtType = 'input'
	                    }
	                    break
	                
	                case 'date':
	                case 'week':
	                case 'time':
	                case 'month':
	                case 'datetime':
	                case 'datetime-local':
	                case 'color':
	                case 'range':
	                case 'number':
	                case 'select':
	                case 'checkbox':
	                    this.evtType = 'change'
	                    break
	                default:
	                    consoler.warn('"' + conf.namespace + 'model" only support input,textarea,select')
	                    return
	            }
	            var that = this
	            var vm = this.$vm
	            var vType = this.vType = type == 'checkbox' ? 'checked':'value'
	            this._prop = prop
	            /**
	             *  DOM input 2 state
	             */
	            this._requestChange = function () {
	                if (!that._prop) return
	                var value = that.$el[vType]
	                var state = vm.$data[that._prop]

	                if (util.diff(value, state)) {
	                    if (that._request) {
	                        value = that._request(value, false)
	                    }
	                    vm.$set(that._prop, value)
	                }
	            }
	            /**
	             *  State 2 DOM input
	             */
	            this._update = function () {
	                if (!that._prop) return

	                var pv = that.$el[vType]
	                var nv = keypath.get(vm.$data, that._prop)
	                if (pv !== nv) {
	                    if (that._request) {
	                        nv = that._request(nv, true)
	                    }
	                    that.$el[vType] = nv
	                }
	            }
	            util.forEach(this.evtType.split(','), function (t) {
	                $el.on(t, that._requestChange)
	            })

	            // Initial state 2 DOM update
	            this._update()
	        },
	        update: function (prop) {
	            if (isMulti) {
	                this._request = prop
	            } else {
	                if (!prop) consoler.error('Invalid property key "' + prop + '"')
	                else {
	                    this._prop = prop
	                }
	            }
	        },
	        afterUpdate: function () {
	            // to compare state value and DOM value, update DOM value if not equal 
	            this._update()
	        },
	        unbind: function () {
	            var that = this
	            var $el = $(this.$el)
	            util.forEach(this.evtType.split(','), function (t) {
	                $el.off(t, that._requestChange)
	            })
	            this._requestChange = this._update = noop
	        }
	    }
	}

	// class directive
	ds[CLASS_KEY] = {
	    multi: true,
	    bind: function(className) {
	        this.className = className
	        this._$el = $(this.$el)
	    },
	    update: function(next) {
	        if (next) this._$el.addClass(this.className)
	        else this._$el.removeClass(this.className)
	    },
	    unbind: function () {
	        this._$el = null
	    }
	}
	module.exports = ds

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Expression manipulation
	 */
	'use strict';

	var util = __webpack_require__(2)

	function _isExpr(c) {
	    return c ? !!util.trim(c).match(/^\{[\s\S]*?\}$/m) : false
	}
	function _strip (expr) {
	    return util.trim(expr)
	            .match(/^\{([\s\S]*)\}$/m)[1]
	            .replace(/^- /, '')
	}
	module.exports = {
		isExpr: _isExpr,
		strip: _strip,
	    wrapExpr: function (expr) {
	        return '{' + expr + '}'
	    },
	    exprRegexp: /\{[\s\S]*?\}/g,
		veil: function (expr) {
	        return expr.replace(/\\{/g, '\uFFF0')
	                   .replace(/\\}/g, '\uFFF1')
	    },
	    unveil: function (expr) {
	        return expr.replace(/\uFFF0/g, '\\{')
	                   .replace(/\uFFF1/g, '\\}')
	    },
	    angleBrackets: function (expr) {
	        return expr.replace(/&lt;/g, '<')
	                   .replace(/&gt;/g, '>')
	                   .replace(/&amp;/g, '&')
	    }
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var $ = __webpack_require__(1)
	function getMatchMethod() {
	    var body = document.body
	    // if script run in head
	    if (!body) return null
	    var matchesSelector = body.matches || body.webkitMatchesSelector ||
	        body.mozMatchesSelector || body.oMatchesSelector ||
	        body.matchesSelector
	    var supportQS = body.querySelectorAll
	    /**
	     * IE8 Support
	     */
	    var wrap = document.createElement('div')
	    if (!matchesSelector && supportQS) {
	        matchesSelector = function(el, selector) {    
	            // http://tanalin.com/en/blog/2012/12/matches-selector-ie8/
	            if (!el || !selector) return false
	            var elems
	            if (el.parentNode) {
	                elems = el.parentNode.querySelectorAll(selector)
	            } else {
	                wrap.appendChild(el)
	                elems = el.parentNode.querySelectorAll(selector)
	                wrap.removeChild(el)
	            }
	            var count = elems.length
	            for (var i = 0; i < count; i++) {
	                if (elems[i] === el) { return true }
	            }
	            return false
	        }
	    } else if (!matchesSelector) {
	        matchesSelector = function (selector) {
	            var el = this
	            var v
	            if (v = isIdSel(selector)) {
	                return el.id === v
	            } else if (v = isClassSel(selector)) {
	                return el.className.split(/\s+/).indexOf(v) === -1 ? false : true
	            } else if (v = isNameSel(selector)) {
	                return el.tagName.toLowerCase() === v.toLowerCase()
	            } else if (v = isAttrSel(selector)) {
	                if (v.length > 1) {
	                    var av = el.getAttribute(v[0])
	                    return av + '' === v[1]
	                } else {
	                    return el.hasAttribute(v[0])
	                }
	            } else {
	                // not support selector
	                return false
	            }
	        }
	    }
	    return matchesSelector
	}

	var matchesSelector = getMatchMethod()
	module.exports = function delegate(con, type, selector, handler) {
	    var fn = function(e) {
	        var currentTarget = findMatch(e.target, selector, con)
	        if (!currentTarget) return
	        e.$currentTarget = currentTarget
	        handler.call(currentTarget, e)
	    }
	    var $con = $(con)
	    $con.on(type, fn)
	    if (!matchesSelector) {
	        matchesSelector = getMatchMethod()
	    }
	    return function() {
	        $con.off(type, fn)
	    }
	}

	function findMatch(el, selector, con) {
	    if (!el || el === con.parentNode || el === document.body.parentNode) return null
	    matchesSelector = matchesSelector || getMatchMethod()
	    if (!matchesSelector) return null
	    return matchesSelector.call(el, selector, con) ? el : findMatch(el.parentNode, selector, con)

	}
	function isIdSel(sel) {
	    var m = sel.match(/^\#([\w\-]+)$/)
	    if (!m) return false
	    return m[1]
	}
	function isAttrSel(sel) {
	    var m = sel.match(/^\[(.+)\]$/)
	    if (!m) return false
	    //[r-attr]
	    var m1 = m[1].match(/^[\w\-]+$/)
	    if (m1) {
	        return [m1[0]]
	    }
	    //[r-attr="value"]
	    var m2 = m[1].match(/^([\w\-]+)\="([^\"]*)"$/)
	    if (!m2) return false
	    return [m2[1],m2[2]]
	}
	function isNameSel(sel) {
	    var m = sel.match(/^[\w\-]+$/)
	    if (!m) return false
	    return m[0]
	}
	function isClassSel(sel) {
	    var m = sel.match(/^\.([\w\-]+)$/)
	    if (!m) return false
	    return m[1]
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var $ = __webpack_require__(1)
	var util = __webpack_require__(2)
	var keypath = __webpack_require__(8)
	var consoler = __webpack_require__(7)
	var conf = __webpack_require__(5)
	module.exports = function(Real) {
	    var ds = {}
	    var FOR_KEY = 'FOR'.toLowerCase()
	    ds[FOR_KEY] = {
	        bind: function(v) {
	            var $el = $(this.$el)
	            var keyName = conf.namespace + 'key'
	            this._key = $el.attr(keyName)
	            var tagExpr = this._tagExpr = '<'+ conf.namespace + 'for="' + this.$rawExpr+'" '+ keyName + '="' + this._key+'"/>'
	            if (!this._key) {
	                consoler.error('Missing attribute, the directive need specify "' +
	                    conf.namespace + 'key".', tagExpr)
	            }
	            this._isSelfStrKey = this._key === '*this'
	            this._isIndexKey = this._key === '*index'
	            this.$before = document.createComment('<for ' + tagExpr  + '">')
	            this.$after = document.createComment('</for>')
	            if (this.$el.parentNode) {
	                var frag = document.createDocumentFragment()
	                frag.appendChild(this.$before)
	                frag.appendChild(this.$after)
	                $el.replace(frag)
	            } else {
	                consoler.error('ElementNode of the directive must not the root node. ', tagExpr)
	            }
	            $el.removeAttr(keyName)
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
	                this._v = v
	                if (!this._pending) {
	                    this._pending = true
	                    ;(function() {
	                        try {
	                            var lastVms = that._vms || []
	                            var lastVmMap = that._vmMap || {}
	                            var parentVm = that.$vm
	                            var removedVms = []
	                            var changedVms = []
	                            var insertedVms = []
	                            var vms = that._vms = []
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
	                                    vms.push(p)
	                                    cursor ++
	                                } else {
	                                    index = cursor
	                                    var el = that.$el.cloneNode(true)
	                                    var data = util.extend({}, parentVm.$data, isObj ? data : null, {
	                                        $index: index,
	                                        $value: data,
	                                        $parent: parentVm.$data
	                                    })
	                                    // create new VM
	                                    vm = new Real({
	                                        parent: parentVm,
	                                        el: el,
	                                        methods: parentVm.$methods,
	                                        data: data
	                                    })
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
	                                    vms.push(p)
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
	                            // debug
	                            // consoler.log(
	                            //     '+', insertedCount, isContinuedInsert, ' / ', 
	                            //     '-', removedCount, ' / ', 
	                            //     '$', changedCount, isContinuedChange, continuedChangeOffset)
	                            var patch = function() {
	                                var onlyRemoved
	                                if (!insertedCount) {
	                                    if (!changedCount && !removedCount) {
	                                        // debug
	                                        // consoler.log('#1')
	                                        // no change
	                                        return
	                                    } else if (removedCount && (!changedCount || (-1*continuedChangeOffset == removedCount && isContinuedChange))) {
	                                        // debug
	                                        // consoler.log('#2')
	                                        // only removedVMs
	                                        onlyRemoved = true
	                                    }
	                                } else {
	                                    if (isContinuedInsert && (!changedCount || isContinuedChange)) {
	                                        // debug
	                                        // consoler.log('#3')
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
	                            }
	                            patch()
	                        } finally {
	                            that._pending = false
	                        }
	                        // console.timeEnd('r-for:render' + _c)
	                    })()
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


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	var conf = __webpack_require__(5)
	var Expression = __webpack_require__(11)
	var consoler = __webpack_require__(7)
	var util = __webpack_require__(2)
	var _execute = __webpack_require__(15)
	var _isExpr = Expression.isExpr
	var _strip = Expression.strip
	var _did = 0
	var _diff = function () {
	    return util.diff.apply(util, arguments)
	}
	function noop() {}
	/**
	 * Abstract direcitve
	 * @param {Reve}    vm      Reve instance
	 * @param {Element} tar     Target DOM of the direcitve
	 * @param {Object}  def     Directive definition
	 * @param {String}  name    Attribute name of the directive
	 * @param {String}  expr    Attribute value of the directive
	 */
	var keyParseCaches = {}
	function Directive(vm, tar, def, name, expr, scope) {
	    var d = this
	    var bindParams = []
	    var isExpr = !!_isExpr(expr)
	    var rawExpr = expr

	    isExpr && (expr = _strip(expr))

	    if (def.multi) {
	        // extract key and expr from "key: expression" format
	        var key
	        var cached = keyParseCaches[expr]
	        if (cached) {
	            key = cached.key
	            expr = cached.expr
	        } else {
	            var keyMatched
	            expr = expr.replace(/^\s*['"](.+?)['"]\s*:/m, function(m, k) {
	                keyMatched = true
	                key = k
	                return ''
	            })
	            if (!keyMatched) {
	                expr = expr.replace(/^([^:]+):/m, function(m, k) {
	                    key = util.trim(k)
	                    return ''
	                })
	            }
	            expr = util.trim(expr)
	            keyParseCaches[expr] = {
	                key: key,
	                expr: expr
	            }
	        }



	        bindParams.push(key)
	    }

	    d.$el = tar
	    d.$vm = vm
	    d.$id = ++_did
	    d.$expr = expr
	    d.$rawExpr = rawExpr
	    d.$name = name
	    d.$destroyed = false
	    d.$scoped = !!def.scoped
	    d.$scope = scope
	    // updateId is used to update directive/component which DOM match the "updateid"
	    d.$updateId = util.getAttribute(tar, conf.namespace + 'updateid') || ''
	    this._$unbind = def.unbind

	    var bind = def.bind
	    var upda = def.update
	    var shouldUpdate = def.shouldUpdate
	    var afterUpdate = def.afterUpdate
	    var isConst = def.constant
	    var needReady = def.needReady
	    var prev

	    // set properties
	    util.objEach(def, function(k, v) {
	        d[k] = v
	    })
	    // support custom diff method
	    var diffMethod = this.$diff = _diff
	    if (def.diff) {
	        diffMethod = def.diff
	    }
	    /**
	     *  update handler
	     */
	    function _update() {
	        if (d.$destroyed) return consoler.warn('Directive "' + name + '" already destroyed.')

	        var hasDiff = false
	        // empty expression also can trigger update, such `r-text` directive
	        if (!isExpr || isConst) {
	            if (shouldUpdate && shouldUpdate.call(d)) {
	                upda && upda.call(d)
	            }
	        } else {
	            var nexv = d.$exec(expr) // [error, result]
	            var r = nexv[1]

	            if (!nexv[0] && diffMethod.call(d, r, prev)) {
	                hasDiff = true

	                // shouldUpdate(nextValue, preValue)
	                if (!shouldUpdate || shouldUpdate.call(d, r, prev)) {
	                    var p = prev
	                    prev = r
	                    // update(nextValue, preValue)
	                    upda && upda.call(d, r, p)
	                }
	            }
	        }
	        afterUpdate && afterUpdate.call(d, hasDiff)
	    }

	    /**
	     *  If expression is a string iteral, use it as value
	     */
	    var hasError
	    if (isExpr && !isConst) {
	        prev =  d.$exec(expr)
	        hasError = prev[0]
	        prev = prev[1]
	    } else {
	        prev = rawExpr
	    }
	    bindParams.push(prev)
	    bindParams.push(expr)
	    d.$update = _update
	    /**
	     * bind([propertyName, ]expression-value, expression)
	     * propertyName will be passed if and only if "multi:true"
	     */
	    var unwatch
	    function run () {
	        unwatch && unwatch()
	        bind && bind.apply(d, bindParams)
	        // error will stop update
	        !hasError && upda && upda.call(d, prev)
	    }
	    if (needReady) {
	        unwatch = vm.$on('ready', run)
	    } else {
	        run()
	    }
	}
	/**
	 *  execute wrap with directive name and current ViewModel
	 */
	Directive.prototype.$exec = function (expr) {
	    return _execute(this.$vm, expr, this.$name)
	}
	Directive.prototype.$destroy = function () {
	    if (this.$destroyed) return

	    this._$unbind && this._$unbind.call(this)
	    this.$update = this.$destroy = this.$exec = noop
	    this.$el = null
	    this.$destroyed = true
	}

	module.exports = Directive

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *  execute expression from template with specified Scope and ViewModel
	 */

	var __$util__ = __webpack_require__(2)
	var __$compile__ = __webpack_require__(16)
	var __$compiledExprs___ = {}
	/**
	 *  Calc expression value
	 */
	function _execute($vm/*, expression, [label], [target]*/) {
	    /**
	     *  $scope is passed when call instance method $compile, 
	     *  Each "scope" object maybe include "$parent, data, method" properties
	     */
	    var __$args__ = __$util__.slice(arguments)
	    var __$expr__ = __$args__[1]
	    var __$fn__ = __$compiledExprs___[__$expr__]
	    try {
	        if (!__$fn__) {
	            __$fn__ = __$compiledExprs___[__$expr__] = __$compile__(__$expr__)
	        }
	        return [null, __$util__.immutable(__$fn__(
	            __$util__.extend({}, $vm.$methods, $vm.$data
	        )))]
	    } catch (e) {
	        __$args__[1] =  '. '+ __$args__[2] + '=' + (/^\{/.test(__$args__[1]) 
	            ? __$args__[1]
	            : '{' + __$args__[1] + '}') // expr
	        
	        var $consoler = __webpack_require__(7)
	        // __$args__[2] // label
	        // __$args__[3] // target
	        switch (e.name) {
	            case 'ReferenceError':
	                $consoler.warn(e.message + __$args__[1], '@VM: ', $vm)
	                break
	            default:
	                $consoler.error(
	                    (__$args__[2] ? '\'' + __$args__[2] + '\': ' : ''),
	                    e.message + __$args__[1],
	                    __$args__[3] || '',
	                    '@VM: ',
	                    $vm
	                )
	        }
	        return [e]
	    }
	}
	module.exports = _execute

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function (__$expr__) {
		if (/^[_$][\w$]*$/.test(__$expr__)) {
			// access property if begin with _ or $
			return function ($scope) {
				return $scope[__$expr__]
			}
		} else {
			return new Function('$scope', 'with($scope){return (' + __$expr__ + ')}')
		}
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(2)
	var _execute = __webpack_require__(15)
	function noop () {}
	var wid = 0
	function Watcher(vm, expr, handler) {
		var w = this
		w.$id = ++wid
		w.$vm = vm
		w.$expr = expr
		w.$destroyed = false

		var prev = w.$exec(expr)[1]
		w.$update = function () {
			var r = w.$exec(expr)
			if (!r[0] && util.diff(prev, r[1])) {
				var last = prev
				prev = r[1]
				handler.call(w, prev, last)

			}
		}
		handler.call(w, prev)

	}
	Watcher.prototype.$exec = function (expr) {
	    return _execute(this.$vm, expr)
	}
	Watcher.prototype.$destroy = function () {
	    if (this.$destroyed) return
	    this.$update = this.$destroy = this.$exec = noop
	    this.$expr = ''
	    this.$destroyed = true
	}

	module.exports = Watcher

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *  Simple Pub/Sub module
	 *  兼容IE
	 **/

	'use strict';

	var fns = __webpack_require__(2)

	function Message () {
	    this._evtObjs = {};
	    this._outdatedMsgs = {};
	}
	Message.prototype.on = function (evtType, handler, _once) {
	    if (!this._evtObjs[evtType]) {
	        this._evtObjs[evtType] = [];
	    }
	    this._evtObjs[evtType].push({
	        handler: handler,
	        once: _once
	    })
	    var that = this
	    return function () {
	        that.off(evtType, handler)
	    }
	}
	Message.prototype.wait = function (evtType, handler) {
	    if (this._outdatedMsgs[evtType]) {
	        handler.apply(null, this._outdatedMsgs[evtType])
	        return noop
	    } else {
	        // call once
	        return this.on(evtType, handler, true)
	    }
	}
	Message.prototype.off = function (evtType, handler) {
	    var that = this
	    var types;
	    if (evtType) {
	        types = [evtType];
	    } else {
	        types = fns.keys(this._evtObjs)
	    }
	    fns.forEach(types, function (type) {
	        if (!handler) {
	            // remove all
	            that._evtObjs[type] = [];
	        } else {
	            var handlers = that._evtObjs[type] || [],
	                nextHandlers = [];

	            fns.forEach(handlers, function (evtObj) {
	                if (evtObj.handler !== handler) {
	                    nextHandlers.push(evtObj)
	                }
	            })
	            that._evtObjs[type] = nextHandlers;
	        }
	    })

	    return this;
	}
	Message.prototype.emit = function (evtType) {
	    var args = Array.prototype.slice.call(arguments, 1)

	    this._outdatedMsgs[evtType] = args
	    var handlers = this._evtObjs[evtType] || [];
	    fns.forEach(handlers, function (evtObj) {
	        if (evtObj.once && evtObj.called) return
	        evtObj.called = true
	        evtObj.handler && evtObj.handler.apply(null, args);
	    })
	}
	Message.prototype.emitAsync = function () {
	    var args = arguments
	    var ctx = this
	    setTimeout(function () {
	        ctx.emit.apply(ctx, args)
	    }, 0)
	}
	Message.prototype.assign = function (target, keys) {
	    var msg = this
	    fns.forEach(keys || ['on', 'off', 'wait', 'emit', 'emitAsync', 'assign'], function (name) {
	        var method = msg[name]
	        target[name] = function () {
	            return method.apply(msg, arguments)
	        }
	    })
	}
	function noop(){}
	/**
	 *  Global Message Central
	 **/
	;(new Message()).assign(Message)
	module.exports = Message;

/***/ }
/******/ ])
});
;