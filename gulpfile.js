'use strict';

// Include gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('dist/scripts/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

// Concatenate and minify JavaScript
gulp.task('scripts', function () {
  var sources = ['./dist/scripts/main.js'];
  return gulp.src(sources)
    .pipe($.concat('main.min.js'))
    .pipe($.uglify({preserveComments: 'some'}))
    // Output files
    .pipe(gulp.dest('dist/scripts'))
    .pipe($.size({title: 'scripts'}));
});

gulp.task('watch', function(){
  gulp.watch(['dist/scripts/*.js'], ['scripts']);
});

// Build production files, the default task
gulp.task('default', function (cb) {
  runSequence(
    'jshint',
    'scripts', cb);
});