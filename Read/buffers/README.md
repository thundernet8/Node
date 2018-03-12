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

## Buffer 解码、转码

Buffer 解码转码支持`ascii`,`utf8`,`utf16le`(同`ucs2`),`base64`,`latin1`(同`binary`)和`hex`

其中`ascii`意味着每个 Buffer 元素不超过 127,对于超出的元素将以二进制截断高位直至符合大小

`latin1`与`ascii`一样都是单个元素表示一个实际字符，不过编码范围扩大到了 255

`utf8`编码则是 1~4 个元素才能表示一个实际字符，这是 Buffer 的默认编码

`utf16le`编码则是 2 或 4 个元素才能表示一个实际字符

`hex`编码实际是 Buffer 各元素 16 进制表示的拼接

```js
const buf = Buffer.from('test'); // '<Buffer 74 65 73 74>'
buf.toString('hex'); // 74657374
```

`base64`实质是字节按规则映射

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

## Buffer 比较

### buffer1.equals(buffer2)

实际是判断二者存储的数据是否相同

### buffer.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])

对两个 buffer 实例进行比较，可以通过 start、end 指定指定特定比较的范围返回值为整数，意义为:

*   0：buffer、target 大小相同。
*   1：buffer 大于 target，也就是说 buffer 应该排在 target 之后。
*   -1：buffer 小于 target，也就是说 buffer 应该排在 target 之前

### Buffer.compare(buffer1, buffer2)

这实际上是 buffer.compare 的静态版本，但是它可以直接作为排序的参数

```js
const arr = [buffer1, buffer2];
arr.sort(Buffer.compare);
```

## Buffer 查找

### buffer.indexOf(value[, byteOffset][, encoding])

有不同类型的`value`参数，包括:

*   String: encoding 即 value 的编码，默认 utf8
*   Buffer: 会将 buffer 中的数据与 value 对比
*   Integer: value 是作为无符号的 8bits 整数(0~255)，即会查找其数值等于 value 的第一个元素

```js
const buffer = Buffer.from('this is a buffer'); // '<Buffer 74 68 69 73 20 69 73 20 61 20 62 75 66 66 65 72>'
buffer.indexOf('this'); // 0
buffer.indexOf(Buffer.from('a buffer')); // 8
buffer.indexOf(104); // 1, 104的16进制表示即为第二个元素0x68
```
