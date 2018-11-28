const StreamUtils = require('@tilfin/stream-utils');
const KSL = require('../lib');
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

exports.handler(require('./data'))
.then(() => {
  console.info('<<< END >>>')
})
.catch(err => {
  console.error('Failed:', err)
})
