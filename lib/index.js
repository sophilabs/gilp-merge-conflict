'use strict';
const util = require('util');
const gutil = require('gulp-util');
const gilpUtil = require('gilp-util');
const through = require('through2');

function gilpMergeConflict (opts) {
  opts = opts || {};

  return through.obj(function (file, enc, cb) {
    if (!gilpUtil.isInMerge() || file.isNull()) {
      cb(null, file);
      return;
    } else if (file.isStream()) {
      cb(new gutil.PluginError('gilp-merge-conflict', 'Streaming not supported'));
      return;
    }
    file.mergeConflict = { errors: [] };
    const pattern = /^(<<<<<<<|=======\s|=======\n|>>>>>>>)/gm;
    const contents = file.contents.toString();
    let match = pattern.exec(contents);
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
}

gilpMergeConflict.failOnError = function () {
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
