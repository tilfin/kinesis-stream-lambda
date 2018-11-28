'use strict'

const { assert } = require('chai')

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
