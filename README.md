kinesis-stream-lambda
=====================

[![NPM Version][npm-image]][npm-url]
[![Node](https://img.shields.io/node/v/kinesis-stream-lambda.svg)]()
[![Build Status](https://travis-ci.org/tilfin/kinesis-stream-lambda.svg?branch=master)](https://travis-ci.org/tilfin/kinesis-stream-lambda)
[![Coverage Status](https://coveralls.io/repos/github/tilfin/kinesis-stream-lambda/badge.svg?branch=master)](https://coveralls.io/github/tilfin/kinesis-stream-lambda?branch=master)
[![dependencies Status](https://david-dm.org/tilfin/kinesis-stream-lambda/status.svg)](https://david-dm.org/tilfin/kinesis-stream-lambda)

## Features

* Easily reads a Lambda event of Kinesis Stream as a stream handling the chunk as Buffer
* Supports KPL aggregation (set opts.isAgg true)
* Provides KSL.parseJSON transform to handle items expanded array data in one record (set opts.flatArray true)
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

## Lambda handler examples

### async/await style

```javascript
const StreamUtils = require('@tilfin/stream-utils');
const KSL = require('kinesis-stream-lambda');
const PromisedLife = require('promised-lifestream');

exports.handler = async function (event) {
  console.log('event: ', JSON.stringify(event, null, 2));

  const result = [];

  await PromisedLife([
    KSL.reader(event, { isAgg: false }),
    KSL.parseJSON({ flatArray: false }),
    StreamUtils.map(function(data, cb) {
      result.push(data);
      cb(null, data)
    })
  ])

  console.dir(result);
}
```

### normal style

```javascript
const StreamUtils = require('@tilfin/stream-utils');
const KSL = require('kinesis-stream-lambda');

exports.handler = function (event, context, callback) {
  console.log('event: ', JSON.stringify(event, null, 2));

  const result = [];
  const stream = KSL.reader(event, { isAgg: false });

  stream.on('end', () => {
    console.dir(result);
    callback();
  });

  stream.on('error', err => {
    callback(err);
  });

  stream
  .pipe(KSL.parseJSON({ flatArray: false }))
  .pipe(StreamUtils.map(function(data, cb) {
    result.push(data);
    cb(null, data)
  }));
}
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/kinesis-stream-lambda.svg
[npm-url]: https://npmjs.org/package/kinesis-stream-lambda
