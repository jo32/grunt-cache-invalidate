/*
 * grunt-cache-invalidate
 * https://github.com/jo32/grunt-cache-invalidate
 *
 * Copyright (c) 2014 jo32
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks
    var crypto = require('crypto');
    var path = require('path');
    var CACHE_REGEX = /([\w-]+?\.[\w-]+)#grunt-cache-invalidate/g;
    var FILE_FORMAT_REGEX = /^(.+?)\.(\w+?)$/;

    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    function getFilePathInFile(src, isNotPath) {

        var content = src;
        if (!isNotPath) {
            content = grunt.file.read(src);
        }

        var files = [];
        var match;
        while (match = CACHE_REGEX.exec(content)) {
            files.push(match[1]);
        }

        return files;
    }

    function getShortHash(src, isNotPath) {

        var content = src;
        if (!isNotPath) {
            src = src.replace(/\\/g, "/");
            content = grunt.file.read(src);
        }

        var md5Digest = crypto.createHash('md5').update(content).digest('hex');
        return md5Digest.slice(0, 9);

    }

    function getRename(_path) {

        var r = FILE_FORMAT_REGEX.exec(_path);
        var shortHash = getShortHash(_path);
        var newPath = r[1] + '.' + shortHash + '.' + r[2];
        return newPath;
    }

    grunt.registerMultiTask('cache_invalidate', 'Invalidating cache by appending hash in file name', function () {

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {

            var tasks = {};

            // Concat specified files.
            f.src.filter(function (filepath) {

                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }

            }).map(function (filepath) {


                console.log("Processing: " + filepath);
                var fileContent = grunt.file.read(filepath);
                var files = getFilePathInFile(fileContent, true);

                files.forEach(function (_path) {

                    var realPath = path.normalize(path.join(path.dirname(filepath), _path));

                    var newPath = getRename(realPath);
                    tasks[realPath] = newPath;

                    console.log(path.basename(realPath) + " ==> " + path.basename(newPath));

                    var replacement = _path.replace(path.basename(_path), path.basename(newPath));
                    fileContent = fileContent.replace(
                        new RegExp(escapeRegExp(_path + "#grunt-cache-invalidate"), "g"), replacement
                    );
                });

                var basename = path.basename(filepath);
                grunt.file.write(path.normalize(path.join(f.dest, basename)), fileContent);

            });

            for (var task in tasks) {
                grunt.file.copy(
                    task, path.normalize(
                        path.join(f.dest, path.basename(tasks[task]))
                    )
                );
            }
        });

    });

};