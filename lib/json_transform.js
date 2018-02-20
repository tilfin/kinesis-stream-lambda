'use strict';

const Transform = require('stream').Transform;

const JSONUnexpectedTokenRe = /^Unexpected token (.) in JSON at position (\d+)$/;

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
    this._buf = '';
  }

  _transform(chunk, encoding, cb) {
    this._buf += chunk.toString();

    try {
      const data = JSON.parse(this._buf);
      this._pushItemsFromData(data);
      this._buf = '';
    } catch (err) {
      if (!(err instanceof SyntaxError)) {
        return cb(err);
      }

      const r = this._rescueJSONError(err);
      if (r === 'next') {
        return cb();
      } else if (r === 'error') {
        return cb(err);
      }
    }

    while (this._items.length >= this._countBy) {
      if (!this._pushItems(this._shiftItems())) break;
    }
    cb();
  }

  _rescueJSONError(err) {
    const errMsg = err.message;
    if (errMsg === 'Unexpected end of JSON input') {
      // JSON unfinished
      return 'next';
    }

    const md = JSONUnexpectedTokenRe.exec(errMsg);
    if (md) {
      const pos = Number(md[2]);
      if (md[1] === '{') {
        // another JSON follows
        const data = JSON.parse(this._buf.substr(0, pos));
        this._pushItemsFromData(data);
        this._buf = this._buf.substr(pos);
        return 'continue';
      } else if (this._buf.substr(pos - 1, 1) === '"') {
        // JSON unfinished
        return 'next';
      }
    }

    return 'error';
  }

  _pushItemsFromData(data) {
    if (this._expanding && (data instanceof Array)) {
      this._items = this._items.concat(data);
    } else {
      this._items.push(data);
    }    
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
