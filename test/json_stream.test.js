'use strict';

const fs = require('fs');
const es = require('event-stream');
const chai = require('chai');
const assert = chai.assert;

const JSONTransform = require('../lib/json_transform');


describe('KinesisLambda.parseJSON', () => {
  context('passed valid JSON', () => {
    it('raises finish event', (done) => {
      const readStream = fs.createReadStream(__dirname + '/fixtures/data/valid_json.txt');
      const jsonStream = JSONTransform()
        .on('finish', function() {
          assert.isOk(true);
          done();
        })
        .on('error', function(err) {
          assert.ifError(err);
          done();
        });

      readStream.pipe(jsonStream);
    });
  });

  context('passed 9 items JSON with count by 2 and expanding array', () => {
    it('flush 5 items', (done) => {
      const readStream = fs.createReadStream(__dirname + '/fixtures/data/data_json.txt');
      const jsonStream = JSONTransform({ expandArray: true, countBy: 2 })
        .on('error', function(err) {
          assert.ifError(err);
          done();
        });

      const writeStream = es.writeArray(function (err, array) {
        assert.deepEqual(array[0], [{ id: 1 }, { id: 2 }]);
        assert.deepEqual(array[1], [{ id: 3 }, { id: 4 }]);
        assert.deepEqual(array[2], [{ id: 5 }, { id: 6 }]);
        assert.deepEqual(array[3], [{ id: 7 }, { id: 8 }]);
        assert.deepEqual(array[4], [{ id: 9 }]);
        done();
      });

      readStream.pipe(jsonStream).pipe(writeStream);
    });
  });

  context('passed invalid JSON', () => {
    it('raises error event', (done) => {
      const readStream = fs.createReadStream(__dirname + '/fixtures/data/invalid_json.txt');
      const jsonStream = JSONTransform()
        .on('finish', function() {
          assert.isOk(false);
          done();
        })
        .on('error', function(err) {
          assert.instanceOf(err, SyntaxError);
          done();
        });

      readStream.pipe(jsonStream);
    });
  });
});
