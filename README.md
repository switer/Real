Real
=====
[![travis-ci](https://travis-ci.org/switer/Real.svg?branch=master)](https://travis-ci.org/switer/Real)
[![npm version](https://badge.fury.io/js/real.svg)](https://www.npmjs.com/package/real)

声明式的DOM操作，与服务端渲染愉快地玩耍。

## Downloads

- [real.js](https://raw.githubusercontent.com/switer/real/master/dist/real.js)
- [real.min.js](https://raw.githubusercontent.com/switer/real/master/dist/real.min.js)

## API Reference

- [Direcitves(指令)](#指令集合)
- [For/If](#forif)
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

  创建一个组件实例。

- **Real.create**(options)
  
  创建一个组件构造方法。

- **Real.component**(id, options)

  注册一个全局的组件，指定 ID，通过 `r-component` 使用，并返回一个构造方法。

- **Real.directive**(id, options)

  注册一个全局的指令。

- **Real.on**(type, handler)
  
  监听消息。

- **Real.off**(type[, handler])

  取消监听消息。

- **Real.emit**(type[, data])

  派发消息。

#### Instance Options

- **el** `<HTMLElement>` | `<String>`

  组件绑定的根元素或者是对应的选择器。 

- **template** `<String>`

  组件绑定的模板，如果指定了 `el`，将会放到 el 的innerHTML里。

- **data** `<Function>`

  用于产生组件数据挂载对象的方法。

- **watch** `<Object>`  `(since v2.0.5)`
  
  观察指定表达式的值，产生变更时回调。初始绑定时会马上执行，参数上只有一个当前值，没有旧值。
  ```js
  Real({
    data: function () {
      return {
        a: 1,
        b: 2
      }
    },
    watch: {
      'a + b': function (value, oldValue) {
        // 3
      }
    }
  })
  ```
> 手动调用 vm.$watch，详情见[实例方法](#instance-methods)


- **methods** `<Object>`

  用于组件JS/指令表达式中的方法。
  ```js
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

  **生命周期方法** 此时数据、实例属性、实例方法已经准备好了，指令、子组件未编译。

- **ready** `<Function>`

  **生命周期方法** 组件已就绪、已完成全部编译操作。

- **destroy** `<Function>`

  **生命周期方法** 组件实例将被销毁。

- **shouldUpdate** `<Function>`

  **生命周期方法** 当父组件调用 `$update` 且 `r-data` 内的值有变更时触发, 返回 `false` 将阻止当前实例更新UI。


#### Instance Properties

- **$el** `<HTMLElement>`

  组件实例的根元素。

- **$data** `<Object>`

  组件实例的数据挂载对象。

- **$methods** `<Object>`

  组件实例的方法挂载对象。

- **$refs** `<Object>`

  组件实例的全部引用实例。

- **$directives** `<Object>`

  组件的全部指令，不包含子组件的。


#### Instance Methods

- **$update**()

  触发一次UI更新。

- **$set**([keypath, ] value)
  
  更改数据值，并触发一次UI更新。
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

  * return `<HTMLElement> | <DocumentFragment>` 如果参数类型为 `String`, 将返回 documentfragment, 否则返回 HTMLElement.

  使用当前组件实例，动态编译指定的HTML或者DOM。

- **$on**(type, handler)
- **$off**(type[, handler])
- **$emit**(type[, data])

- **$watch**(expression, handler) `(since v2.0.5)`
  
  观察表达式的值变更
  ```html
  var unwatch = this.$watch('a + b -c', function(value, oldValue) {
     // 初始绑定时不存在 oldValue, arguments 长度为1
  })
  // 解绑
  unwatch()
  ```

#### Custom Directive


自定义指令的选项:
* `bind`<`Function`> 初始化绑定的时候调用，只调用一次。
* `update`<`Function`> 每次数据变更时调用，如果 'shouldUpdate' 返回 true 会阻止 update调用。
* `unbind`<`Function`> 指令被销毁前会触发，此处做一些解绑、释放引用的操作。
* `shouldUpdate`<`Function`>  每次数据变更时调用，如果 'shouldUpdate' 返回 true 会阻止 update调用。
* `scoped`<`Boolean`> 声明当前指令为域指令，用于自定义编译子元素。默认 false
* `multi`<`Boolean`> 生命当前指令为复合指定，指令的值表达式 r-xxx="{key: value}"。默认 false
* `needReady`<`Boolean`> 如果为 true， 在组件 Real 之后执行bind/update。默认 false

自定义指令的实例属性:
* `$vm` 当前指令所属的父组件实例。
* `$el` 当前指令绑定的元素。
* `$id` 当前指令的实例ID
* `$name` 当前指令的名称

通过 `Real.directive` 自定义组件, 例如一下自定义一个 "tap" 指令:

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






