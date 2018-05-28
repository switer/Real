Real
=====
[![travis-ci](https://travis-ci.org/switer/Real.svg?branch=master)](https://travis-ci.org/switer/Real)
[![npm version](https://badge.fury.io/js/real.svg)](https://www.npmjs.com/package/real)

声明式的DOM操作，与服务端渲染愉快地玩耍。

## Downloads

- [real.js](https://raw.githubusercontent.com/switer/real/master/dist/real.js)
- [real.min.js](https://raw.githubusercontent.com/switer/real/master/dist/real.min.js)

## API Reference

- [Direcitves(指令)](#directives)
- [Iterator/If](#iteratorif)
- [Class Methods(类方法)](#class-methods)
- [Instance Options(实例选项)](#instance-options)
- [Instance Methods(实例方法)](#instance-methods)
- [Instance Properties(实例属性)](#instance-properties)
- [Custom Directive(自定义指令)](#custom-directive)

## 使用指南

由于部分指令会被渲染成HTML内容，请务必添加以下样式：
```css
[r-text],[r-html],[r-show],[r-if],[r-for] {display: none}
```

在HTML模板使用DOM操作指令：
```html
<div id="app" 
	r-show="{show}" 
	r-class="{hl: hl}"
>Hi, Real</div>
```


然后创建一个 ViewModel 实例与 `#app` 元素进行绑定
```js
var $app = new Real({
	el: '#app',
	data: function () {
		// define some state of ViewModel
		return {
			show: true,
			hl: true
		}
	},
	ready: function () {
		// ... do something when instance compele ...
	},
	methods: {
		// ... define methods of the ViewModel ...
	}
})
```

实例化完成后，`#app` 元素被渲染为如下内容：
```html
<div id="app" class="hl">Hi, Real</div>
```


我们可以修改 ViewModel 的数据，然后通过 `$update` 方法触发更新，框架自动修改DOM
```js
ready: function () {
	this.$data.hl = false
	this.$update()
}
```

更新后渲染结果：
```html
<div id="app" class="">Hi, Real</div>
```

如果我们想做把隐藏 `#app` 隐藏的逻辑，可以这样做：
```js
this.$data.show = false
this.$update()
```

更新完成后，`#app` 的 display 样式被修改为 none :
```html
<div id="app" class="" style="display: none">Hi, Real</div>
```

## API文档

#### Directives
Directive is declarative DOM manipulation, such as "r-class" is the DOM manipulation of add/remove class to the element.

- **r-show**

	set element's style of display to none, when value is false.  

- **r-class**

	Add className to the element when value is true, Otherwise remove that class.
	such as: 
	```html
	<span r-class="{
	  red    : hasError;
	  bold   : isImportant;
	  hidden : isHidden;
	}"></span>
	```

- **r-classes** `(since v2.0.0)`
	
	Add/remove class text to element.
	such as: 
	```html
	<span r-classes="{(isBlue ? 'blue':'green') + ' ' + (isInline ? 'inline-block' : 'block')}"></span>
	<!-- also support array -->
	<span r-classes="{['red', 'blue']}"></span>
	```

- **r-style**

	Set inline style to element.
	```html
	<span r-style="{
	  display    : show ? '':'none'
	}"></span>
	```

- **r-attr**

	Update element's attribute by binding data.
	```html
	<img r-attr="{src: imgUrl || './default.png'}" alt="">
	```

- **r-src** `(since v2.0.0)`

	Update element's "`src`" attribute by binding data.
	```html
	<img r-src="{imgUrl || './default.png'}" alt="">
	```

- **r-href** `(since v2.0.0)`

	Update element's "`href`" attribute by binding data.
	```html
	<a r-href="{url || 'javascript:;'}" >click me</a>
	```

- **r-dataset** `(since v2.0.0)`

	Update element's "`dataset`" by binding data.
	```html
	<div r-dataset="{index: index; src: src || './default.png'}" ></div>
	```

- **r-on**

	Add event listener to the element, such as add a "click" and "toucstart" events to the button element:
	```html
	<button 
		r-on="{
			click: onClick;
			touchstart: onTouchStart;
		}"
	></button>
	```


- **r-capture**
	Bind event on event capturing.
	```html
	<button 
		r-capture="{
			click: onClick;
			touchstart: onTouchStart;
		}"
	></button>
	```


- **r-delegate** `(since v2.0.0)`
	
	Event delegate. Expression format { "`click` **selector**": *handler* }
	```html
	<div class="list" 
		r-on="{
			'click .item': onDelegateClick;
		}"
	>
		<div class="item" data-index="1"></div>
		<div class="item" data-index="2"></div>
	</div>
	```
	> Noti: IE8 below, only support selectors: `#id`, `.class`, `tagName`, `[attribute]` or `[attribute="value"]`.


- **r-click** `(since v2.0.0)`

	Add click event listener to the element:
	```html
	<button 
		r-click="{
			onClick;
		}"
	></button>
	```


- **r-html**

	HTML rendering directive. Using to render template with VM's data. If attribute value is `inner`, it will render template to target element's innerHTML.

	```html
	// $data => {title: 'real'}
	<div r-html>Framework is {title}</div>
	// render to, notice: without wrapping div.
	Framework is real
	```

	Render to target element's innerHTML:
	```html
	// $data => {title: 'real'}
	<div r-html="inner">Framework is <span>{title}</span></div>
	// render to
	<div>Framework is <span>real</span></div>
	```

- **r-text**

	 Directive for render template to text. If attribute value is `inner`, it will render template to target element's innerText.
	
	```html
	Framework: <span r-text>{name}</span> !
	```

	Assert name is 'Real', it will be rendered to:
	```
	Framework: Real !
	```

	Render to target element's innerText:
	```html
	Framework: <span r-text="inner">{name}</span> !
	// render to
	Framework: <span>real</span> !
	```

	Expression in attribute:
	```html
	<div><span r-text="{name}">real</span></div>
	// render to
	<div>real</div>
	```


- **r-props** `(since v1.5.10)`
	
	Using with root element of the component. For inject data from DOM to $data.

- **r-component**

	Declare the element is a component root element, and Real will instance it with specified component id.
	Assume we have defined a component with state "title" and method "capitalize", as below:
	```js
	Real.component('header', {
		data: function () {
			return {
				title: ''
			}
		},
		methods: {
			capitalize: function (str) {
				var initial = str[0]
				return initial.towUpperCase() + str.slice(1)
			}
		}
	})
	```
	And component's template as below:
	```html
	<div id="app">
		<div r-component="header" 
			r-data="{
				title: "hi, real"
			}""
		>
			<span r-html="{capitalize(title)}"></span>
		</div>
	</div>
	```

	It will be instanced when instance parent VM:	
	```js
	var app = new Real({
		el: '#app'
	})
	```
	Render result:
	```html
	<div id="app">
		<div>
			<span>Hi, real</span>
		</div>
	</div>
	```

- **r-model**
	
	Two way binding directive for select/input/textarea element. Value of directive expression is the binding property name in $data,
	it could be a keypath, such as: **r-model="person[i].name"**. Example:

	```js
	var c = new Real({
        data: {
            val: ''
        },
        template: '<input type="text" r-model="val"/>'
    })

    // input element will update data with specified property name
    dispatchEvent(inp, 'input', 'real')
    assert.equal(c.$data.val, 'real')

    // data changed will update DOM value
    c.$set('val', 'real2')
    assert.equal(inp.value, 'real2')
	```

- **r-xmodel**
	
	支持拦截方法的双向绑定

	```js
	var c = new Real({
        data: {
            val: ''
        },
        template: '<input type="text" r-xmodel="{val: request}"/>',
        methods: {
        	request: function (willChangeValue, updated/*<Boolean>*/) {
        		/**
        		 * updated: 如果为 true 则为 state => DOM，否则 DOM => state
        		 * 例子：实现输入限制长度为10
        		 */
				return willChangeValue.slice(0, 10)
        	}
        }
    })

	```

- **r-ref**

	Add a reference of the component instance to parent component instance.
	> Notice: work with "r-component" only.

	```html
	<div r-component="header" r-ref="header"></div>
	```
	We can access the header component instance refernce by parent VM's **$refs** property:
	```js
	app.$refs.header.$data.title // 'hi, real'
	```


- **r-data**

	Passing and binding data from parent VM to child component.
	> Notice: work with "r-component" only.
	

- **r-methods**

	Passing methods from parent VM to child component.
	> Notice: work with "r-component" only.

- **r-binding**

	If 'r-binding' is false("false" or "0"), parent component will not update the child component when parent's data has been changed.
	> Notice: work with "r-component" only.

	```html
	<div class="parent">
	    <div 
	        r-component="c-child" 
	        r-data="{prop: parentState}" 
	        r-binding="false"
	        r-ref="child"
	    ></div>
	</div>
	```
	"r-binding" is disable, " c-child" will not update if parent ViewModel's parentState has been changed. If need to update child component manually, do as below:
	```js
	    var $child = this.$refs.child	    
	    $child.$data.prop = this.$data.parentState
	    this.$refs.child.$update()
	```

- **r-updateid**

	If 'r-updateid' is presented, call `$update(id)` will update those matching directives or components.
	> Notice: work with "r-component" or directives.

- **r-notemplate**

	If 'r-notemplate' is presented, will not render component's template option, and render innerHTML only.
	> Notice: work with "r-component".Using in server-side render case.


#### Iterator/If

- **r-for** `(since v2.0.0)`
	
	`r-key` is necessary, it's value could be `key-path` or "`*this`" or "`*index`", but must be unique. 
	"`*index`" mean using index of the arry as key. Build-in values:
		`$value` is current value of list item. `$index` is current item's index.
	```html
	<!-- items => {name: 'xxx', id: 'xxx'} -->
	<div r-component="c-item" 
		r-for="{items}"
		r-key="name"
	><span r-text>{$index}: {id}</span></div>
	```

- **r-if** `(since v2.0.0)`
	
	Render sub-template by condition.
	```html
	<div r-if="{cnd}">
		<div>Hellow world</div>
	</div>
	```


#### Class Methods

- **Real**(options)

	Create a ViewModel instance.

- **Real.create**(options)

	Create a ViewModel Class.

- **Real.component**(id, options)

	Create a ViewModel Class and assign it with specified `id`. it's `r-component`'s value.

- **Real.directive**(id, options)

	Define a directive which effect on global.

- **Real.on**(type, handler)
- **Real.off**(type[, handler])
- **Real.emit**(type[, data])

#### Instance Options

- **el** `<HTMLElement>` | `<String>`

	The root `Element` or element `Selector` of the ViewModel. 

- **template** `<String>`

	Replace ViewModel element's innerHTML with template, if el is not given, Real will create a div element with the `template` innerHTML

- **data** `<Function>`

	Get default ViewModel's data, `data` is a method that should return an object.

- **methods** `<Object>`

	Specified methods of the ViewModel those can be use in directive's expression and be accessed by the ViewModel instance as property directly:
	```
	methods: {
		show: function () {
			// to do something
		}
	},
	ready: function () {
		this.show() // accessing as method property
	}
	```
- **created** `<Function>`

	**Lifecycle Method** It will be called before compiling directives of the ViewModel.

- **ready** `<Function>`

	**Lifecycle Method** It will be called after all directives of the ViewModel are compiled.

- **destroy** `<Function>`

	**Lifecycle Method** It will be called before ViewModel destroyed.

- **shouldUpdate** `<Function>`

	**Lifecycle Method** It will be called when parent ViewModel call `$update` method and the result of `r-data` has been changed, 
	return `false` will stop current ViewModel to update UI. Call after value diff.


#### Instance Properties

- **$el** `<HTMLElement>`

	The root element of the ViewModel instance.

- **$data** `<Object>`

	The data object of the ViewModel instance.

- **$methods** `<Object>`

	The methods option object of the ViewModel 

- **$refs** `<Object>`

	All child component instances those have declared the reference id with `r-ref`.

- **$directives** `<Object>`

	All directives those not contain child component's directives of the ViewModel.


#### Instance Methods

- **$update**()

	Call the method manually to update UI View when data of the ViewModel instance has been changed.

- **$set**([keypath, ] value)
	
	Set value to 'this.$data' and call this.$update immediately. Also can set value by keypath. Examples:
	```html
	this.$set({ state: true })
	/** equal to 
	    this.$data.state = true
	    this.$update()
	*/

	this.$set('person[0].name', '')
	/** equal to 
	    this.$data.person[0].name = ''
	    this.$update()
	*/
	```

- **$compile**(`HTMLElement` | `String`)

	* return `<HTMLElement> | <DocumentFragment>` if param typeof `String`, it will be a documentfragment, otherwise will return HTMLElement.

	Compile all directives of the HTMLElement or HTML template in current ViewModel. It's useful when load something async then append to current ViewModel's DOM Tree.

- **$on**(type, handler)
- **$off**(type[, handler])
- **$emit**(type[, data])



#### Custom Directive

Directive lifecycle methods:
* `bind` Call only once when init.
* `update` Call when expression's value has been changed and not 'shouldUpdate' or 'shouldUpdate' return true.
* `unbind` Call only once before directive is destroyed.
* `shouldUpdate` Call every time when expression's value has been changed, before 'update', return false will stop update.
* `scoped` Scoped directy is used to compile sub-template in custom.
* `multi` Expression of directive is in key-value format: r-xx="{key: value}".
* `needReady` run directive bind/update after parent's vm is ready.

Directive instance properties:
* `$vm` Mounted VM of the directive
* `$el` Mounted target Node of the directive
* `$id` Current directive instance's id
* `$name` Current directive instance's name

Define a custom directive with `Real.directive`, such as below example to define a "tap" directive:

```html
<div r-tap="{onClick}"></div>
```

```js
Real.directive('tap', {
    bind: function (value, expression) {
        // do something when init
    },
    update: function (value) {
        // do something when state change or after init
    },
    unbind: function () {
        // do something before destroy the directive instance
    }
})
```


## License

MIT






