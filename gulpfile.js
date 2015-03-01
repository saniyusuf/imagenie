/**
 * Created by Sani on 25/02/2015.
 */

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');


gulp.task('minify', function () {
    return gulp.src('src/imagenie.js')
        .pipe(uglify())
        .pipe(rename('imagenie.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('unMinified', function () {
    return gulp.src('src/imagenie.js')
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['unMinified', 'minify']);