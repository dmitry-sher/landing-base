var gulp = require('gulp'),
    sass = require('gulp-sass'),
    neat = require('node-neat').includePaths,
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    fileinclude = require('gulp-file-include'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    clean = require('gulp-clean'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel');

var buildParams = {
    appStyles: 'css',
    appImg: 'img',
    appFonts: 'fonts',
    appScripts: 'scripts',
    appFav: 'fav',
    appHtml: 'html',
    appVendorJs: 'scripts/vendor',
    buildDir: 'dist',
    buildStyles: 'dist/css',
    buildImg: 'dist/img',
    buildFonts: 'dist/fonts',
    buildScripts: 'dist/scripts',
    buildFav: 'dist/'
}

// build tasks
gulp.task('copyFav', ['cleanUp'], function() {
    gulp
        .src(buildParams.appFav + "/*")
        .pipe(gulp.dest(buildParams.buildFav));
});

gulp.task('copyStyles', ['cleanUp', 'sass'], function() {
    gulp
        .src(buildParams.appStyles + "/*.min.css")
        .pipe(gulp.dest(buildParams.buildStyles));
});

gulp.task('copyFonts', ['cleanUp'], function() {
    gulp
        .src(buildParams.appFonts + "/*")
        .pipe(gulp.dest(buildParams.buildFonts));
});

gulp.task('copyVendorJs', ['cleanUp'], function() {
    gulp
        .src(buildParams.appVendorJs + "/*")
        .pipe(gulp.dest(buildParams.buildScripts));
});

gulp.task('copyImg', ['cleanUp'], function() {
    gulp
        .src(buildParams.appImg + "/*")
        .pipe(gulp.dest(buildParams.buildImg));

    gulp
        .src(buildParams.appImg + "/*/*")
        .pipe(gulp.dest(buildParams.buildImg));

    gulp
        .src(buildParams.appImg + "/*/*/*")
        .pipe(gulp.dest(buildParams.buildImg));
});

gulp.task('copyScripts', ['cleanUp'], function() {
    var uglify = false;
    if (!uglify) {
        gulp
            .src(buildParams.appScripts + "/*")
            .pipe(concat('scripts.js'))
            .pipe(babel())
            .pipe(gulp.dest(buildParams.buildScripts));
        return;
    }
    gulp
        .src(buildParams.appScripts + "/*")
        .pipe(concat('scripts.min.js'))
        .pipe(sourcemaps.init({
            loadMaps: true,
            identityMap: true,
            debug: true
        }))
        .pipe(babel())
        // .pipe(gulp.dest(buildParams.buildScripts))
        // .pipe(rename('scripts.min.js'))
        .pipe(uglify('scripts.min.js'))
        .pipe(sourcemaps.write({
            addComment: true,
            includeContent: true,
            destPath: buildParams.buildScripts,
            debug: true
        }))
        .pipe(gulp.dest(buildParams.buildScripts));
});

gulp.task('cleanUp', function() {
    return gulp
        .src(buildParams.buildDir + '/*', { read: false })
        .pipe(clean());
});

gulp.task('build', ['cleanUp', 'html', 'sass', 'copyVendorJs', 'copyStyles', 'copyImg', 'copyScripts', 'copyFonts', 'copyFav'], function() {});

gulp.task('serve', ['cleanUp', 'html', 'sass', 'copyVendorJs', 'copyStyles', 'copyImg', 'copyScripts', 'copyFonts', 'copyFav'], function() {
    browserSync.init({
        server: "./dist"
    });

    gulp.watch("scss/*", ['build', 'reload']);
    gulp.watch("pages/*", ['build', 'reload']);
    gulp.watch("scripts/*", ['build', 'reload']);
    gulp.watch("img/*", ['build', 'reload']);
    gulp.watch("fav/*", ['build', 'reload']);
    gulp.watch("fonts/*", ['build', 'reload']);
});

// dev tasks
gulp.task('sass', ['cleanUp'], function() {
    return gulp.src('scss/style.scss')
        .pipe(sass({
            includePaths: ['styles'].concat(neat)
        }))
        .pipe(gulp.dest('css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('css'));
});

gulp.task('html', ['cleanUp'], function() {
    gulp.src(['pages/index.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(buildParams.buildDir));
});

gulp.task('reload', ['build'], function() {
    reload();
});

gulp.task('default', ['serve']);