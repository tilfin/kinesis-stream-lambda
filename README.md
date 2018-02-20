kinesis-stream-lambda
=====================

[![NPM Version][npm-image]][npm-url]
[![Node](https://img.shields.io/node/v/kinesis-stream-lambda.svg)]()
[![Build Status](https://travis-ci.org/tilfin/kinesis-stream-lambda.svg?branch=master)](https://travis-ci.org/tilfin/kinesis-stream-lambda)
[![Coverage Status](https://coveralls.io/repos/github/tilfin/kinesis-stream-lambda/badge.svg?branch=master)](https://coveralls.io/github/tilfin/kinesis-stream-lambda?branch=master)

## Features

* Easily reads a Lambda event of Kinesis Stream as a stream handling the chunk as Buffer
* Supports KPL aggregation (set opts.isAgg true)
* Provides KSL.parseJSON transform to handle items expanded array data in one record (set opts.expandArray true)
* Node.js 6.10 or Later

## How to install

```
$ npm install -save kinesis-stream-lambda
```

### KPL aggregation only

furthermore,

```
$ npm install -save aws-kinesis-agg
```

## Lambda handler example

```javascript
const es = require('event-stream');
const KSL = require('kinesis-stream-lambda');


exports.handler = function(event, context) {
  console.log('event: ', JSON.stringify(event, null, 2));

  const result = [];
  const stream = KSL.reader(event, { isAgg: false });

  stream.on('end', function() {
    console.dir(result);
    context.done();
  });

  stream.on('error', function(err) {
    context.fail(err);
  });

  stream
  .pipe(KSL.parseJSON({ expandArray: false }))
  .pipe(es.map(function(data, callback) {
    result.push(data);
    callback(null, data)
  }));
}
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/kinesis-stream-lambda.svg
[npm-url]: https://npmjs.org/package/kinesis-stream-lambda
