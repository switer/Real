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

如果我们想做把 `#app` 隐藏的逻辑，可以这样：
```js
this.$data.show = false
this.$update()
// 或者
this.$update('show', false)
```

更新完成后，`#app` 的 display 样式被修改为 none :
```html
<div id="app" class="" style="display: none">Hi, Real</div>
```

## API文档

#### 指令集合

指令是声明式的 DOM 操作，例如: "r-class" 是给 DOM 动态 `添加`/`移除` class。

- **r-show**

	控制元素显示或隐藏，如果表达式的值为 `false` 则隐藏，反之显示。
	```html
	<div r-show="{isShow}"></div>
	```

- **r-class**
	
	动态添加类名。
	```html
	<span r-class="{
	  red    : hasError;
	  bold   : isImportant;
	  hidden : isHidden;
	}"></span>
	```

- **r-classes** `(since v2.0.0)`
	
	动态添加多个类名。
	```html
	<span r-classes="{(isBlue ? 'blue':'green') + ' ' + (isInline ? 'inline-block' : 'block')}"></span>
	<!-- also support array -->
	<span r-classes="{['red', 'blue']}"></span>
	```

- **r-style**

	修改元素的样式。
	```html
	<span r-style="{
	  display    : show ? '':'none'
	}"></span>
	```

- **r-attr**

	修改元素的属性值。
	```html
	<img r-attr="{src: imgUrl || './default.png'}" />
	```

- **r-src** `(since v2.0.0)`

	修改图片的 `src` 值。
	```html
	<img r-src="{imgUrl || './default.png'}" alt="">
	```

- **r-href** `(since v2.0.0)`

	修改 A 链接的 `href` 值。
	```html
	<a r-href="{url || 'javascript:;'}" >click me</a>
	```

- **r-dataset** `(since v2.0.0)`

	修改元素的 `dateset`。
	```html
	<div r-dataset="{
		index: index;
		src: src || './default.png';
	}"></div>
	```

- **r-on**

	绑定事件（冒泡阶段），例如绑定 "`click`"、"`toucstart`" 事件：
	```html
	<button 
		r-on="{
			click: onClick;
			touchstart: onTouchStart;
		}"
	></button>
	```


- **r-capture**

	绑定事件（捕获阶段），例如绑定 "`click`"、"`toucstart`" 事件：
	```html
	<button 
		r-capture="{
			click: onClick;
			touchstart: onTouchStart;
		}"
	></button>
	```


- **r-delegate** `(since v2.0.0)`
	

	事件代理（冒泡阶段），表达式格式 => { "`click` **selector**": *handler* }:
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
	> 注意: IE8 以下, 仅支持的选择器: `#id`, `.class`, `tagName`, `[attribute]` or `[attribute="value"]`.


- **r-click** `(since v2.0.0)`

	绑定点击事件：
	```html
	<button 
		r-click="{ onClick }"
	></button>
	```


- **r-html**


	元素渲染成内容的HTML，如果 `r-html` 的值为 `inner`，则只渲染 innerHTML。
	```html
	// $data => {title: 'real'}
	<div r-html>Framework is {title}</div>
	// DOM被直接替换为模板内容
	Framework is real
	```

	// 只渲染 innerHTML
	```html
	// $data => {title: 'real'}
	<div r-html="inner">Framework is <span>{title}</span></div>
	// render to
	<div>Framework is <span>real</span></div>
	```

- **r-text**

	
	元素渲染成内容模板的文本格式，如果 `r-text` 的值为 `inner`，则只渲染 innerText。
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




- **r-component**

	自定义子组件 => Real.component(组件名<`String`>，组件定义<`Object`>)：
	```js
	Real.component('header', {
		template: '<span r-html="{capitalize(title)}"></span>',
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

	在模板中使用
	```html
	<div id="app">
		<div 
			r-component="header" 
			r-data="{ title: 'hi, real' }"
		>
		</div>
	</div>
	```

	被父组件实例化
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

- **r-notemplate**

	如果指定了 'r-notemplate' , 将不会渲染组件声明的 `template`, 而是取当前元素下的 innerHTML，用于已生成内容的绑定.
	> 注意: 仅限于同 "r-component" 一起使用。


- **r-props** `(since v1.5.10)`
	
	向子组件传递数据，不绑定，父组件的数据更新`不会同步`到子组件
	> 注意: 仅限于同 "r-component" 一起使用。

- **r-data**

	向子组件传递数据，建立数据绑定，父组件的数据更新`会同步`到子组件
	> 注意: 仅限于同 "r-component" 一起使用。

- **r-methods**

	向子组件传递方法。
	> 注意: 仅限于同 "r-component" 一起使用。

- **r-binding**

	如果 'r-binding' 的值为 false("false" or "0"), 父组件不会触发子组件的任何更新，用于性能优化。
	> 注意: 仅限于同 "r-component" 一起使用。

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

	如果 "r-binding" 值为关闭，父组件更新的时候 "c-child" 将不会触发更新，如果需要手动触发子组件更新，可以通过实例引用：
	```js
	    var $child = this.$refs.child	    
	    $child.$data.prop = this.$data.parentState
	    this.$refs.child.$update()
	```
	> 注意: 仅限于同 "r-component" 一起使用。


- **r-ref**

	提供一个实例引用的名字。
	> 注意: 仅限于同 "r-component" 一起使用。

	```html
	<div r-component="header" r-ref="header"></div>
	```

	父组件获取子组件实例
	```js
	app.$refs.header.$data.title // 'hi, real'
	```


- **r-model**
	
	select/input/textarea 元素的双向绑定. 绑定的值取自$data, 支持 keypath, 例如: **r-model="person[i].name"**。
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




- **r-updateid**

	如果指定了 'r-updateid'，可以通过 `$update(id)` 指定局部更新，用于性能优化

	```html
	<div 
		r-show="{isShow}"
		r-updateid="showMe"
	></div>
	```

	```js
	this.$data.isShow = true
	this.$update('showMe')
	```



#### For/If

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






