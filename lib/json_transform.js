'use strict';

const Transform = require('stream').Transform;

/**
 * JSONTransform
 */
class JSONTransform extends Transform {

  /**
   * Contructor
   *
   * @param {Object} options - Transform options
   * @param {Number} options.countBy - number of block items
   * @param {Boolean} options.expandArray - Flatten an array into items
   */
  constructor(options) {
    const opts = options || {};
    const countBy = opts.countBy || 1;
    const expanding = opts.expandArray || false;
    delete opts.countBy;
    delete opts.expandArray;
    opts.objectMode = true;
    super(opts);

    this._countBy = countBy;
    this._expanding = expanding;
    this._items = [];
  }

  _transform(chunk, encoding, cb) {
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
      if (!this._pushItems(this._shiftItems())) break;
    }
    cb();
  }

  _flush(cb) {
    const items = this._items;

    while (items.length >= this._countBy) {
      this._pushItems(this._shiftItems());
    }

    if (items.length) this._pushItems(items);
    cb();
  }

  _pushItems(items) {
    return this.push(this._countBy > 1 ? items : items[0]);
  }

  _shiftItems() {
    return this._items.splice(0, this._countBy);
  }
}

module.exports = JSONTransform;
