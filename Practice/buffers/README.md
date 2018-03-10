## 概述

`Buffer`是 Node.JS 内建的[核心模块](https://github.com/nodejs/node/blob/v8.x/src/node_buffer.cc)，解决 JS 二进制数据处理问题。`Buffer`对象位于全局空间`global`下，无需引入即可直接使用。

## 创建 Buffer

### 通过 Buffer.from

在 Node 8+版本中，通过如下构造函数创建`Buffer`的方式已不再推荐

```js
new Buffer(array)

new Buffer(arrayBuffer[,byteOffet[,length]])

new Buffer(buffer)

new Buffer(size)

new Buffer(string[,encoding])
```

取而代之的是`Buffer.from`静态方法

```js
Buffer.from(array)

Buffer.from(arrayBuffer[,byteOffet[,length]])

Buffer.from(buffer)

Buffer.from(string[,encoding])

Buffer.from(object[,offsetOrEncoding[,lenght]])
```

基本上一一对应，除了少了`new Buffer(size)`，新增了一个`Buffer.from(object[,offsetOrEncoding[,lenght]])`

现在如果需要创建一个一定大小的空`Buffer`对象，可以按如下方式实现:

```js
const arrayBuffer = new ArrayBuffer(255);
const buffer = Buffer.from(arrayBuffer);

// inspect
> buf.length
255
> buf.inspect()
'<Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... >'
>
```

或者直接使用`Buffer.alloc(length)`

### 通过 Buffer.alloc(length)

```js
const buf1 = Buffer.alloc(5); // 初始化一个5个字节长度的buffer，默认填充0x0，'<Buffer 00 00 00 00 00>'

const buf2 = Buffer.alloc(5, 10); // 初始化一个5个字节长度的buffer，填充初始值0xa, '<Buffer 0a 0a 0a 0a 0a>'

const buf3 = Buffer.alloc(5, 'a', 'utf8'); // 初始化一个5个字节长度的buffer，填充初始值为utf8编码的字符a，'<Buffer 61 61 61 61 61>'
```

如果需要对不合法的参数输入直接报出异常，可以使用`Buffer.allocUnsafe(size)`，同时性能上更好，因为其底层内存未初始化，所以新 buffer 的内容是不可预知的，要确保初始内容一致，可以使用`buffer.fill(0)`填充内容为`0x0`。

当要初始化的`Buffer`对象大小不超过`Buffer.poolSize`一半时(一般 4096)，`Buffer.allocUnsafe(size).fill(0)`对比`Buffer.alloc(size, 0)`会有性能优势，因为会使用内部预先初始化的`Buffer`池。若如果想留预先初始化的`Buffer`池作为它用，而直接申请新的非`Buffer`池中的实例，可以使用`Buffer.allocUnsafeSlow(size)`。

下面的列子显示了一个`buffer`实例是否使用了`Buffer`池初始化:

```js
> var buf1 = Buffer.alloc(5)
undefined
> buf1.buffer
ArrayBuffer { byteLength: 5 }
> var buf2 = Buffer.allocUnsafe(5).fill(0)
undefined
> buf2.buffer
ArrayBuffer { byteLength: 8192 }
> buf2.length
5
>
> var buf3 = Buffer.allocUnsafeSlow(5).fill(0)
undefined
> buf3.buffer
ArrayBuffer { byteLength: 5 }
> Buffer.poolSize
8192
>
```

## 实战

### 转换 Base64 文本

普通文本转换为 Base64 编码文本

```js
const text = 'a normal text';
const base64Text = Buffer.from(text).toString('base64'); // 'YSBub3JtYWwgdGV4dA=='
```

Base64 编码文本转普通原始文本

```js
const base64Text = 'YSBub3JtYWwgdGV4dA==';
const text = Buffer.from(base64Text, 'base64').toString(); // 'a normal text'
```
