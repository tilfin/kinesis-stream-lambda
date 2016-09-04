# kinesis-stream-lambda

## How to install

```
$ npm install -save kinesis-stream-lambda
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
    context.done();
  })
  .pipe(KSL.parseJSON({ expandArray: false }))
  .pipe(es.map(function(data, callback) {
    result.push(data);
    callback(null, data)
  }))
  .on('end', function(){
    JSON.stringify(result, null, 2);
  });
}
```
