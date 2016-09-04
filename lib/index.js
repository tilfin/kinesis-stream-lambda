'use strict';

const KLReadStream = require('./read_stream');


exports.reader = function(event, opts) {
  return new KLReadStream(event, opts);
}

exports.parseJSON = require('./json_transform');
