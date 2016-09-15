'use strict';

const KLReadStream = require('./read_stream');
const JSONTransform = require('./json_transform');

exports.reader = function(event, opts) {
  return new KLReadStream(event, opts);
}

exports.parseJSON = function(opts) {
  return new JSONTransform(opts);
}
