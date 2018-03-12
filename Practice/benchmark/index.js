const Benchmark = require('benchmark');

function useIndex(arr, item) {
    return arr.indexOf(item) !== -1;
}

function useIncludes(arr, item) {
    return arr.includes(item);
}

const arr = new Array(100).fill(0).map((value, index) => index + 1);

const suite = new Benchmark.Suite();

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
