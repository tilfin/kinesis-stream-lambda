const StreamUtils = require('@tilfin/stream-utils');
const KSL = require('../lib');

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

exports.handler(require('./data'), null, function (err) {
  if (err) console.error('Failed:', err)
  else console.info('<<< END >>>')
})
