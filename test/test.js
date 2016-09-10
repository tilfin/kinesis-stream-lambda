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

    const data3 = require('./fixtures/results/data-3');

    it('read one record with expanding array', (done) => {
      const event = require('./fixtures/events/data-3');
      const readStream = KinesisLambda.reader(event);
      const dataList = data3.concat();

      readStream
        .pipe(KinesisLambda.parseJSON({ expandArray: true }))
        .pipe(es.map(function(data, callback) {
          assert.deepEqual(data, dataList.shift());
          callback(null, data)
        }))
        .on('end', function() {
          assert.isOk(true);
          done();
        });
    });

    it('read one record with expanding array and counting by 2', (done) => {
      const event = require('./fixtures/events/data-3');
      const readStream = KinesisLambda.reader(event);
      const dataList = data3.concat();

      readStream
        .pipe(KinesisLambda.parseJSON({ expandArray: true, countBy: 2 }))
        .pipe(es.map(function(data, callback) {
          const twoItems = dataList.splice(0, 2);
          assert.deepEqual(data, twoItems);
          callback(null, data)
        }))
        .on('end', function() {
          assert.isOk(true);
          done();
        });
    });
  });

  context('aggregation mode', () => {
    const aggDate1 = require('./fixtures/results/agg-data-1');
    const aggDate2 = require('./fixtures/results/agg-data-2');

    it('read one record', (done) => {
      const event = require('./fixtures/events/agg-data-1');
      const readStream = KinesisLambda.reader(event, { isAgg: true });
      const dataList = aggDate1.concat();

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
      const dataList = aggDate2.concat();

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

    it('read one records with counting by 3 items', (done) => {
      const event = require('./fixtures/events/agg-data-1');
      const readStream = KinesisLambda.reader(event, { isAgg: true });
      const dataList = aggDate1.concat();

      readStream
        .pipe(KinesisLambda.parseJSON({ countBy: 3 }))
        .pipe(es.map(function(data, callback) {
          const threeItems = dataList.splice(0, 3);
          assert.deepEqual(data, threeItems);
          callback(null, data)
        }))
        .on('end', function() {
          assert.isOk(true);
          done();
        });
    });

    it('read two records with counting by 4 items', (done) => {
      const event = require('./fixtures/events/agg-data-2');
      const readStream = KinesisLambda.reader(event, { isAgg: true });
      const dataList = aggDate2.concat();

      readStream
        .pipe(KinesisLambda.parseJSON({ countBy: 4 }))
        .pipe(es.map(function(data, callback) {
          const threeItems = dataList.splice(0, 4);
          assert.deepEqual(data, threeItems);
          callback(null, data)
        }))
        .on('end', function() {
          assert.isOk(true);
          done();
        });
    });
  });
});
