'use strict'

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';



const gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  gulpIf = require('gulp-if'),
  newer = require('gulp-newer'),
  image = require('gulp-imagemin'),
  imageJpegRecompress = require("imagemin-jpeg-recompress"),
  imagePngquant = require("imagemin-pngquant"),
  spritesmith = require('gulp.spritesmith'),
  jshint = require('gulp-jshint'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglifyes'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename'),
  postcss = require('gulp-postcss'),
  assets = require('postcss-assets'),
  autoprefixer = require('autoprefixer'),
  cssnano = require('cssnano'),

  root = '../',
	scss = root + 'sass/',
	js = root + 'js/',
	img = root + 'images/',
  languages = root + 'languages/';
  
// CSS via Sass and PostCSS
gulp.task('sprite', function () {
  let spriteData = gulp.src('images/sprite/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssFormat: 'scss',
    cssName: 'sprite.scss',
    imgPath: '../img/RAW'
  }));
  return spriteData.pipe(gulp.dest('../sprite'));
});



  gulp.task('css', () => {

    let processorsDev = [
      assets({
        loadPaths: [scss + '**'],
        relativeTo: root 
      }),
      autoprefixer('last 2 versions', '> 1%')
    ]

    let processors = [
      assets({
        loadPaths: [scss + '**'],
        relativeTo: root
      }),
      autoprefixer('last 2 versions', '> 1%'),
      cssnano
    ]

    return gulp.src(scss + 'main.scss')
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass({
      outputStyle: 'expanded', 
      indentType: 'space',
      indentWidth: '2'
    }).on('error', sass.logError))
    .pipe(gulpIf(!isDevelopment, postcss(processors)))
    .pipe(gulpIf(isDevelopment, postcss(processorsDev)))
    .pipe(rename('style.css'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(root))
  });

// Optimize images through gulp-image
  gulp.task('images', function() {
    return gulp.src(img + 'RAW/**/*.{jpg,JPG,png}')
    .pipe(newer(img))
    .pipe(image([
      imageJpegRecompress({
        progressive: true,
        max: 75,
        min: 70
      }),
      imagePngquant({quality: '75'}),
      image.svgo({plugins: [{removeViewBox: true}]})
    ]))
    .pipe(gulp.dest(img));
  });

// JavaScript

gulp.task('javascript', function() {
  return gulp.src(['../**/*.js', '!../gulp-dev/**', '!../js/**'])
	.pipe(jshint({esnext: true}))
  .pipe(jshint.reporter('default'))
  .pipe(concat('lib.js'))
  .pipe(gulp.dest(js))
  .pipe(uglify())
  .pipe(rename('lib.min.js'))
	.pipe(gulp.dest(js));
});


// Watch everything
gulp.task('watch', function() {
	browserSync.init({ 
		open: 'external',
		proxy: 'http://ires.develop/',
    port: 3000,
    reloadDelay: 1000
  });
  gulp.watch([img + 'sprite/*.png'], gulp.series('sprite'));
	gulp.watch([ scss + '**/*.scss' ], gulp.series('css'));
	gulp.watch(['../**/*.js', '!../gulp-dev/**', '!../js/**'], gulp.series('javascript'));
	gulp.watch(img + 'RAW/**/*.{jpg,JPG,png}', gulp.series('images'));
	gulp.watch(root + '**/*').on('change', browserSync.reload);
});


gulp.task('default', gulp.series('watch'));