'use strict';
var util = require('util');
var path = require('path');
var gutil = require('gulp-util');
var gilpUtil = require('gilp-util');
var through = require('through2');
var cp = require('child_process');


function gilpMergeConflict(opts) {
  opts = opts || {};

  return through.obj(function (file, enc, cb) {
    if (!gilpUtil.isInMerge() || file.isNull()) {
      cb(null, file);
      return;
    } else if (file.isStream()) {
      cb(new gutil.PluginError('gilp-merge-conflict', 'Streaming not supported'));
      return;
    }
    file.mergeConflict = {errors: []};
    var pattern = new RegExp('^(<<<<<<<|=======\s|=======\n|>>>>>>>)', 'gm');
    var contents = file.contents.toString();
    var match = pattern.exec(contents);
    while (match != null) {
      file.mergeConflict.errors.push(util.format(
        'Conflict mark "%s" found at position %s.',
        match[0],
        match.index
      ));
      match = pattern.exec(contents);
    }
    cb(null, file);
  });
};

gilpMergeConflict.failOnError = function() {
  return through.obj(function (file, enc, cb) {
    if (!file.mergeConflict || !file.mergeConflict.errors) {
      cb(null, file);
      return;
    }
    cb(new gutil.PluginError(
      'gilp-merge-conflict',
      {
        name: 'MergeConflictError',
        message: file.mergeConflict.errors.join('\n')
      }
    ));
  });
};

module.exports = gilpMergeConflict;
