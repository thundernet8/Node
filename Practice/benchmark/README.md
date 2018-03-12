## 如何给代码添加 Benchmark 测试

使用`benchmark`包和编写 benchmark 用例

例如测试`arr.indexOf`和`arr.includes`的速度对比

方法实现

```js
function useIndex(arr, item) {
    return arr.indexOf(item) !== -1;
}

function useIncludes(arr, item) {
    return arr.includes(item);
}
```

benchmark 用例

```js
const arr = new Array(100).fill(0).map((value, index) => index + 1);

suite
    .add('useindex', function() {
        useIndex(arr, 10);
    })
    .add('useinclude', function() {
        useIncludes(arr, 10);
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({ async: true });

// results - 两者速度接近
// useindex x 22,935,986 ops/sec ±0.94% (87 runs sampled)
// useinclude x 23,099,723 ops/sec ±0.83% (84 runs sampled)
// Fastest is useinclude,useindex
```
