'use strict';

var grunt = require('grunt');
var fs = require('fs');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.cache_invalidate = {

    setUp: function (done) {
        done();
    },
    default_options: function (test) {
        var actual = grunt.file.read('tmp/sample.html');
        var expected = grunt.file.read('test/expected/sample.html');
        var json = JSON.parse(grunt.file.read("test/expected/files.json"));
        test.expect(1 + json.length);
        test.equal(actual, expected, 'test if the cached bursted file is the same.');
        for (var i in json) {
            test.equal(true, fs.existsSync("tmp/" + json[i]));
        }
        test.done();
    }
};