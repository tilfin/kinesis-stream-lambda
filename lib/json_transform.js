'use strict';

const Transform = require('stream').Transform;
const util = require('util');


/**
 * JSONTransform
 *
 * @param {Object} opts - Transform options
 * @param {Number} opts.countBy - number of block items
 * @param {Boolean} opts.expandArray - Flatten an array into items
 */
function JSONTransform(opts) {
  if (!(this instanceof JSONTransform))
    return new JSONTransform(opts);

  const opts_ = opts || {};
  this._countBy = opts_.countBy || 1;
  this._expanding = opts_.expandArray || false;
  delete opts_.countBy;
  delete opts_.expandArray;

  this._items = [];

  opts_.objectMode = true;
  Transform.call(this, opts_);
}
util.inherits(JSONTransform, Transform);

JSONTransform.prototype._transform = function(chunk, encoding, cb) {
  try {
    const data = JSON.parse(chunk);
    if (this._expanding && (data instanceof Array)) {
      this._items = this._items.concat(data);
    } else {
      this._items.push(data);
    }
  } catch (err) {
    cb(err, null);
    return;
  }

  while (this._items.length >= this._countBy) {
    if (!this._enqueue(this._shiftItems())) break;
  }
  cb();
}

JSONTransform.prototype._flush = function(cb) {
  const items = this._items;

  while (items.length >= this._countBy) {
    this._enqueue(this._shiftItems());
  }

  if (items.length) this._enqueue(items);
  cb();
}

JSONTransform.prototype._enqueue = function(items) {
  return this.push(this._countBy > 1 ? items : items[0]);
}

JSONTransform.prototype._shiftItems = function() {
  return this._items.splice(0, this._countBy);
}

module.exports = JSONTransform;
