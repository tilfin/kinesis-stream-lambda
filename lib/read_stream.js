'use strict';

const util = require('util');
const Readable = require('stream').Readable;


function KLReadStream(event, options) {
  if (!(this instanceof KLReadStream))
    return new KLReadStream(event, options);

  this._records = event.Records;
  this._recCnt = this._records.length;
  this._recIdx = 0;

  const opts = options || {};
  if (opts.isAgg) {
    this._agg = require('aws-kinesis-agg');
  } else {
    this._agg = null;
  }
  delete opts.isAgg;

  opts.objectMode = true;
  Readable.call(this, opts);
}
util.inherits(KLReadStream, Readable);
KLReadStream.prototype._read = function(m) {
  this._nextRecord();
}
KLReadStream.prototype._nextRecord = function() {
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
KLReadStream.prototype._processRecord = function(b64Data) {
  try {
    const buf = new Buffer(b64Data, 'base64');
    this.push(buf);
  } catch (err) {
    this.emit('error', Error('invalid Base64 data'));
  }
}


module.exports = KLReadStream;
