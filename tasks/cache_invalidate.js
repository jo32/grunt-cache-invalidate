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
    var CACHE_REGEX = /([\w\.\/-]+?\.[\w-]+)#grunt-cache-invalidate/g;
    var FILE_FORMAT_REGEX = /^(.+?)\.(\w+?)$/;

    function isPathEqual(p1, p2) {
        return path.normalize(p1) === path.normalize(p2);
    }

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

    function getRename(realPath, destRelativePath) {

        var r = FILE_FORMAT_REGEX.exec(realPath);
        var shortHash = getShortHash(realPath);
        var newPath = path.join(destRelativePath, path.basename(r[1] + '.' + shortHash + '.' + r[2]));
        return newPath;
    }

    function recursiveInvalidateCache(f, tasks, fileRemap, pathes) {

        if (pathes.length <= 0) {
            return;
        }

        var subFilesToCheck = [];

        function getRenameAndUpdateFile(_path) {

            var realPath = path.normalize(path.join(path.dirname(filepath), _path));
            subFilesToCheck.push(realPath);
            console.log("locate file '" + _path + "' in " + realPath);

            var renamedPath = getRename(realPath, path.dirname(_path));
            var relativePath = path.relative(
                path.dirname(f.src), path.dirname(realPath)
            );

            tasks[realPath] = path.normalize(
                path.join(f.dest, relativePath, path.basename(renamedPath))
            );

            console.log(path.basename(realPath) + " ==> " + path.basename(renamedPath));

            var replacement = _path.replace(path.basename(_path), path.basename(renamedPath));
            fileContent = fileContent.replace(
                new RegExp(escapeRegExp(_path + "#grunt-cache-invalidate"), "g"), replacement
            );
        }

        for (var i in pathes) {

            var filepath = pathes[i];
            // to break the circuler references
            if (filepath in fileRemap) {
                continue;
            }

            console.log("Processing: " + filepath);
            var fileContent = grunt.file.read(filepath);
            var files = getFilePathInFile(fileContent, true);

            console.log("Found files: ");
            console.log(files);

            files.forEach(getRenameAndUpdateFile);

            var basename = path.basename(filepath);
            var destPath = path.normalize(path.join(f.dest, basename));
            if (files.length <= 0) {
                continue;
            }
            grunt.file.write(destPath, fileContent);
            fileRemap[filepath] = destPath;
        }

        return recursiveInvalidateCache(f, tasks, fileRemap, subFilesToCheck);
    }

    grunt.registerMultiTask('cache_invalidate', 'Invalidating cache by appending hash in file name', function () {

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {

            var tasks = {};
            var fileRemap = {};

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

                var pathes = [filepath];

                recursiveInvalidateCache(f, tasks, fileRemap, pathes);

            });

            for (var task in tasks) {

                var srcPath = task;
                if (task in fileRemap) {
                    srcPath = fileRemap[task];
                }

                grunt.file.copy(
                    srcPath, tasks[task]
                );
                if(f.move){
                    grunt.file.delete(srcPath);
                }
            }

            for (var i in fileRemap) {
                if (!isPathEqual(i, f.src)) {
                    grunt.file.delete(fileRemap[i], {
                        force: true
                    });
                }
            }

        });

    });

};
