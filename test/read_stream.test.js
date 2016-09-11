'use strict';

const es = require('event-stream');
const chai = require('chai');
const assert = chai.assert;

const KLReader = require('../lib/read_stream');


describe('KinesisLambda.reader', () => {
  context('called function', () => {
    it('OK', () => {
      const event = require('./fixtures/events/data-0');
      const readStream = KLReader(event);

      readStream
        .pipe(es.writeArray(function(err, array) {
          assert.equal(array[0].toString(), 'data');
        }))
        .on('end', function() {
          assert.isOk(true);
          done();
        });
    });
  });

  context('aggregation mode', () => {
    context('data is invalid base64', () => {
      it('raises error event', (done) => {
        const event = require('./fixtures/events/agg-data-invalid');
        const readStream = KLReader(event, { isAgg: true });

        readStream.on('error', function(err) {
            assert.instanceOf(err, Error);
            done();
          });

        readStream.pipe(process.stdout);
      });
    });
  });
});
