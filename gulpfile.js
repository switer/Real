'use strict';

var gulp = require('gulp')
var webpack = require('gulp-webpack')
var uglify = require('gulp-uglifyjs')
var header = require('gulp-header')
var meta = require('./package.json')
var watch = require('gulp-watch')

var banner = ['/**',
              '* Real v${version}',
              '* (c) 2015 ${author}',
              '* Released under the ${license} License.',
              '*/',
              ''].join('\n')
var bannerVars = { 
        version : meta.version,
        author: meta.author,
        license: meta.license
    }

gulp.task('watch', function () {
    watch(['lib/*.js', 'reve.js'], function () {
        gulp.start('default')
    })
});

gulp.task('default', function() {
    return gulp.src('reve.js')
        .pipe(webpack({
            output: {
                library: 'Reve',
                libraryTarget: 'umd',
                filename: 'real.js'
            }
        }))
        .pipe(header(banner, bannerVars))
        .pipe(gulp.dest('dist/'))
        .pipe(uglify('real.min.js', {
            mangle: true,
            compress: true
        }))
        .pipe(header(banner, bannerVars))
        .pipe(gulp.dest('dist/'))
});
