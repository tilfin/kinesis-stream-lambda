'use strict';

const Readable = require('stream').Readable;

/**
 * KLReadStream
 */
class KLReadStream extends Readable {

  /**
   * Contructor
   *
   * @param {Object} event - Lambda event
   * @param {Object} options - Readable stream options
   * @param {Boolean} options.isAgg - Use KPL aggregation or not
   */
  constructor(event, options) {
    const opts = options || {};
    const isAgg = opts.isAgg;
    delete opts.isAgg;
    opts.objectMode = true;
    super(opts);

    this._records = event.Records;
    this._recCnt = this._records.length;
    this._recIdx = 0;
    this._agg = isAgg ? require('aws-kinesis-agg') : null;
  }

  _read(m) {
    this._nextRecord();
  }

  _nextRecord() {
    if (this._recIdx === this._recCnt) {
      this.push(null);
      return;
    }

    const record = this._records[this._recIdx++];
    if (this._agg) {
      this._agg.deaggregateSync(record.kinesis, true, (err, userRecords) => {
          if (err) {
            this.emit('error', err);
          } else {
            userRecords.forEach((usrRec) => {
              this._processRecord(usrRec.data);
            });
          }
        });
    } else {
      this._processRecord(record.kinesis.data);
    }
  }

  _processRecord(b64Data) {
    try {
      const buf = new Buffer(b64Data, 'base64');
      this.push(buf);
    } catch (err) {
      this.emit('error', Error('invalid Base64 data'));
    }
  }
}

module.exports = KLReadStream;
