'use strict';

const fs = require('fs');
const es = require('event-stream');
const through2 = require('through2');
const chai = require('chai');
const assert = chai.assert;

const JSONTransform = require('../lib/json_transform');


describe('JSONTransform', () => {
  context('passed valid JSON', () => {
    it('raises finish event', (done) => {
      const readStream = fs.createReadStream(__dirname + '/fixtures/data/valid_json.txt');
      const jsonStream = new JSONTransform()
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
      const jsonStream = new JSONTransform({ expandArray: true, countBy: 2 })
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

  context('highWaterMark is less than item count of 1 JSON line', () => {
    it('reads rightly', (done) => {
      const readStream = fs.createReadStream(__dirname + '/fixtures/data/data_json.txt');
      const jsonStream = new JSONTransform({ highWaterMark: 7, expandArray: true, countBy: 1 })
        .on('error', function(err) {
          assert.ifError(err);
          done();
        });

      let idValSum = 0;
      const nextStream = through2.obj({ highWaterMark: 1 },
        function(data, enc, cb) {
          idValSum += data.id;
          this.push(data);
          cb();
        },
        function(cb){
          assert.equal(idValSum, 45); // (1 + 9) * 9 / 2
          cb();
        });

      const writeStream = es.writeArray(function (err, array) {
        assert.equal(array.length, 9);
        done();
      });

      readStream.pipe(jsonStream).pipe(nextStream).pipe(writeStream);
    });
  });

  context('passed multiline JSON', () => {
    const sharedExamples = function(highWaterMark, errMsg) {
      it(`flush valid items through '${errMsg}'`, (done) => {
        const readStream = fs.createReadStream(__dirname + '/fixtures/data/multiline_json.txt', { highWaterMark });
        const jsonStream = new JSONTransform()
        const writeStream = es.writeArray(function (err, array) {
          assert.deepEqual(array[0], { color: "red", value: "#f00" });
          assert.deepEqual(array[1], { color: "green", value: "#0f0" });
          assert.deepEqual(array[2], { color: "blue", value: "#00f" });
          done();
        });

        readStream.pipe(jsonStream).pipe(writeStream);
      });
    }

    sharedExamples(4, 'Unexpected token A in JSON at position');
    sharedExamples(25, 'Unexpected end of JSON input');
    sharedExamples(36, 'Unexpected token { in JSON at position');
  });

  context('passed invalid JSON', () => {
    it('raises error event', (done) => {
      const readStream = fs.createReadStream(__dirname + '/fixtures/data/invalid_json.txt');
      const jsonStream = new JSONTransform()
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
