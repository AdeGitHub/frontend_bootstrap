//引入gulp和gulp插件
const gulp = require('gulp'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    clean = require('gulp-clean'),
    cleanCSS = require('gulp-clean-css'),
    babel = require('gulp-babel'),
    cached = require('gulp-cached');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const path = require("path");
const connect = require('gulp-connect');

//环境变量
let envUtil = require("./env_util");


//定义css、js源文件路径
const cssSrc = ['src/**/*.css'],
    jsSrc = ['src/**/*.js'],
    rootSrc = ['src/**/*.*'];


//监控文件变化
function watch() {
    gulp.watch(rootSrc, {delay: 500}, gulp.series(
        gulp.parallel(revCSS, revJs),
        revHtml
    ));
}


function httpServer() {
    connect.server({
        root: 'dist',
        livereload: true
    });
}


//清空目标文件
function cleanDst() {
    return gulp.src(['dist'], {read: false, allowEmpty: true})
        .pipe(clean());
}


//CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
function revCSS() {

    return gulp.src(cssSrc)
        .pipe(cached("css.cache"))
        // 压缩css
        .pipe(cleanCSS({
            "rebase": false,
            format: envUtil.isDevelopment() ? 'beautify' : '' // formats output in a really nice way
        }))
        .pipe(rev())
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest({
            base: 'dist/rev/css',
            path: 'dist/rev/css/rev-manifest.json',
            merge: true
        }))
        .pipe(gulp.dest('dist/rev/css'));

}


//js生成文件hash编码并生成 rev-manifest.json文件名对照映射
function revJs() {

    return gulp
        .src(jsSrc)
        // .pipe(cached("js.src.cache"))
        //编译es6语法
        .pipe(babel({
            presets: [["@babel/preset-env",
                {
                    targets: {
                        "chrome": "40",
                        "ie": "11"
                    },
                    corejs: "2",
                    useBuiltIns: 'usage'
                }
            ]]
        }))
        .pipe(named(function (file) {
            //webpack使用了file.named属性作为entry，所以这里设置一下file.named
            return file.relative;
        }))
        .pipe(webpack({
            config: require('./webpack.config.js')
        }))
        .pipe(rev())
        // .pipe(cached("js.dist.cache"))
        .pipe(gulp.dest('dist'))
        //生成rev-manifest.json
        .pipe(rev.manifest({
            base: 'dist/rev/js',
            path: 'dist/rev/js/rev-manifest.json',
            merge: true
        }))
        .pipe(gulp.dest('dist/rev/js'));

}


//Html替换css、js文件版本
function revHtml() {
    return gulp.src(['dist/rev/**/*.json'
        , 'src/**/*.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(cached('page.cache'))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
}


// 将非js、非css移动到目标目录
function mvNotDealAsset(cb) {
    cb();
}

const defaultTask =
    gulp.series(
        cleanDst,
        gulp.parallel(revCSS, revJs),
        gulp.parallel(revHtml, mvNotDealAsset),
        gulp.parallel(watch, httpServer)
    );

const build =
    gulp.series(
        cleanDst,
        gulp.parallel(revCSS, revJs),
        gulp.parallel(revHtml, mvNotDealAsset),
    );

exports.revJs = revJs;
exports.cleanDst = cleanDst;
exports.default = defaultTask;
exports.mvNotDealAsset = mvNotDealAsset;
exports.revHtml = revHtml;
exports.revCSS = revCSS;
exports.watch = watch;
exports.httpServer = httpServer;
exports.build = build;

