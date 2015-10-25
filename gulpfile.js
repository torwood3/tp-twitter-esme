'use strict';

// Include gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('dist/scripts/main.js')
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

// Concatenate and minify CSS
gulp.task('css', function () {
  gulp.src('dist/styles/styles.css')
      .pipe($.csso())
      .pipe($.concat('styles.min.css'))
      .pipe(gulp.dest('dist/styles/'))
      .pipe($.size({title: 'css'}));

});

gulp.task('watch', function() {
  gulp.watch("dist/scripts/main.js", ['scripts']);
  gulp.watch("dist/styles/styles.css", ['css']);
});

// Build production files, the default task
gulp.task('default', function (cb) {
  runSequence(
    'jshint',
    'scripts', 'css', cb);
});