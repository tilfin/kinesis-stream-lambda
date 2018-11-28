'use strict'

const StreamUtils = require('@tilfin/stream-utils')
const { assert } = require('chai')

const KinesisLambda = require('../lib');


describe('KLReadStream', () => {
  context('normal mode', () => {
    it('reads one record', (done) => {
      const event = require('./fixtures/events/data-1');
      const readStream = KinesisLambda.reader(event);
      const dataList = require('./fixtures/results/data-1');

      readStream
        .pipe(KinesisLambda.parseJSON())
        .pipe(StreamUtils.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }));
      readStream.on('end', done);
    });

    it('reads two records', (done) => {
      const event = require('./fixtures/events/data-2');
      const readStream = KinesisLambda.reader(event);
      const dataList = require('./fixtures/results/data-2');

      readStream
        .pipe(KinesisLambda.parseJSON())
        .pipe(StreamUtils.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }));
      readStream.on('end', done);
    });

    const data3 = require('./fixtures/results/data-3');

    it('reads one record with expanding array', (done) => {
      const event = require('./fixtures/events/data-3');
      const readStream = KinesisLambda.reader(event);
      const dataList = data3.concat();

      readStream
        .pipe(KinesisLambda.parseJSON({ expandArray: true }))
        .pipe(StreamUtils.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }));
      readStream.on('end', done);
    });

    it('reads one record with expanding array and counting by 2', (done) => {
      const event = require('./fixtures/events/data-3');
      const readStream = KinesisLambda.reader(event);
      const dataList = data3.concat();

      readStream
        .pipe(KinesisLambda.parseJSON({ expandArray: true, countBy: 2 }))
        .pipe(StreamUtils.map(function(data, callback) {
          const twoItems = dataList.splice(0, 2);
          assert.deepEqual(data, twoItems);
          callback(null, data)
        }));
      readStream.on('end', done);
    });
  });

  context('aggregation mode', () => {
    const aggDate1 = require('./fixtures/results/agg-data-1');
    const aggDate2 = require('./fixtures/results/agg-data-2');

    it('reads one record', (done) => {
      const event = require('./fixtures/events/agg-data-1');
      const readStream = KinesisLambda.reader(event, { isAgg: true });
      const dataList = aggDate1.concat();

      readStream
        .pipe(KinesisLambda.parseJSON())
        .pipe(StreamUtils.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }));
      readStream.on('end', done);
    });

    it('reads two records', (done) => {
      const event = require('./fixtures/events/agg-data-2');
      const readStream = KinesisLambda.reader(event, { isAgg: true });
      const dataList = aggDate2.concat();

      readStream
        .pipe(KinesisLambda.parseJSON())
        .pipe(StreamUtils.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }));
      readStream.on('end', done);
    });

    it('reads one records with counting by 3 items', (done) => {
      const event = require('./fixtures/events/agg-data-1');
      const readStream = KinesisLambda.reader(event, { isAgg: true });
      const dataList = aggDate1.concat();

      readStream
        .pipe(KinesisLambda.parseJSON({ countBy: 3 }))
        .pipe(StreamUtils.map(function(data, callback) {
          const threeItems = dataList.splice(0, 3);
          assert.deepEqual(data, threeItems);
          callback(null, data)
        }));
      readStream.on('end', done);
    });

    it('reads two records with counting by 4 items', (done) => {
      const event = require('./fixtures/events/agg-data-2');
      const readStream = KinesisLambda.reader(event, { isAgg: true });
      const dataList = aggDate2.concat();

      readStream
        .pipe(KinesisLambda.parseJSON({ countBy: 4 }))
        .pipe(StreamUtils.map(function(data, callback) {
          const threeItems = dataList.splice(0, 4);
          assert.deepEqual(data, threeItems);
          callback(null, data)
        }));
      readStream.on('end', done);
    });
  });

  context('data is invalid JSON format', () => {
    it('catches an syntax error', (done) => {
      const event = require('./fixtures/events/data-invalid-json');
      const readStream = KinesisLambda.reader(event);

      const jsonStream = KinesisLambda.parseJSON();
      jsonStream.on('error', function(err) {
        assert.instanceOf(err, SyntaxError);
        done();
      });

      readStream
        .pipe(jsonStream)
        .pipe(StreamUtils.map(function(data, callback) {
          callback(null, data)
        }));
    });
  });
});
