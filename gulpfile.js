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
    watch(['lib/**', 'reve.js'], function () {
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
            },
            module: {
                preLoaders: [
                    {
                        test: /\.js$/, // include .js files
                        exclude: /node_modules/, // exclude any and all files in the node_modules folder
                        loader: "jshint-loader"
                    }
                ],
            },
            jshint: {
                // set emitErrors to true to display them as errors
                emitErrors: false,
                // set failOnHint to true
                failOnHint: false,
                "browser": true,
                "esnext": true,
                "globals": {
                    console: true
                },
                "globalstrict": true,
                "quotmark": false,
                "undef": true,
                "unused": true,
                "asi": true,
                "strict": false,
                "sub": true,
                "shadow": true,
                "eqeqeq": false,
                "expr": true,
                "laxbreak": true,
                "newcap": false
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
