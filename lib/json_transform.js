'use strict';

const through2 = require('through2');


module.exports = function(options) {
  const opts = options || {};
  const countBy = opts.countBy || 1;
  const expanding = opts.expandArray || false;

  let items = [];

  const stream = through2({ objectMode: true },
    function(chunk, enc, cb) {
      try {
        const data = JSON.parse(chunk);
        if (expanding && (data instanceof Array)) {
          items = items.concat(data);
        } else {
          items.push(data);
        }
      } catch (err) {
        cb(err, null);
        return;
      }

      while (items.length >= countBy) {
        const enqItems = items.splice(0, countBy);
        this.push(countBy > 1 ? enqItems : enqItems[0]);
      }
      cb();
    }, function(cb) {
      if (items.length) {
        this.push(items);
      }
      cb();
    });

  return stream;
}
