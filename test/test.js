'use strict';

const es = require('event-stream');
const chai = require('chai');
const assert = chai.assert;

const KinesisLambda = require('../lib');


describe('KLReadStream', () => {
  context('normal mode', () => {
    it('read one record', (done) => {
      const event = require('./fixtures/events/data-1');
      const readStream = KinesisLambda.reader(event);
      const dataList = require('./fixtures/results/data-1');

      readStream
        .pipe(KinesisLambda.parseJSON())
        .pipe(es.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }))
        .on('end', function() {
          assert.isOk(true);
          done();
        });
    });

    it('read two records', (done) => {
      const event = require('./fixtures/events/data-2');
      const readStream = KinesisLambda.reader(event);
      const dataList = require('./fixtures/results/data-2');

      readStream
        .pipe(KinesisLambda.parseJSON())
        .pipe(es.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }))
        .on('end', function() {
          assert.isOk(true);
          done();
        });
    });
  });

  context('aggregation mode', () => {
    it('read one record', (done) => {
      const event = require('./fixtures/events/agg-data-1');
      const readStream = KinesisLambda.reader(event, { isAgg: true });
      const dataList = require('./fixtures/results/agg-data-1');

      readStream
        .pipe(KinesisLambda.parseJSON())
        .pipe(es.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }))
        .on('end', function() {
          assert.isOk(true);
          done();
        });
    });

    it('read two records', (done) => {
      const event = require('./fixtures/events/agg-data-2');
      const readStream = KinesisLambda.reader(event, { isAgg: true });
      const dataList = require('./fixtures/results/agg-data-2');

      readStream
        .pipe(KinesisLambda.parseJSON())
        .pipe(es.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }))
        .on('end', function() {
          assert.isOk(true);
          done();
        });
    });
  });
});
