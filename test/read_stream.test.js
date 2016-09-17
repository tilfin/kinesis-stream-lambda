'use strict';

const es = require('event-stream');
const chai = require('chai');
const assert = chai.assert;

const KLReadStream = require('../lib/read_stream');


describe('KLReadStream', () => {
  context('aggregation mode', () => {
    context('data is invalid base64', () => {
      it('raises error event', (done) => {
        const event = require('./fixtures/events/agg-data-invalid');
        const readStream = new KLReadStream(event, { isAgg: true });

        readStream.on('error', function(err) {
            assert.instanceOf(err, Error);
            done();
          });

        readStream.pipe(process.stdout);
      });
    });
  });
});
