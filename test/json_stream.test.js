'use strict';

const fs = require('fs');
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
