import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgostore from 'gulp-svgstore';
import { deleteAsync } from 'del';
import browser from 'browser-sync';

const { dest, src } = gulp;

// Styles

const styles = () => {
  return src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
const html = () => {
  return src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('build'))
}

//Scripts
const scripts = () => {
  return src('source/js/*.js')
    .pipe(terser())
    .pipe(dest('build/js'))
}

// Images

const optimizeImages = () => {
  return src('source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(dest('build/img'))
}

const copyImages = () => {
  return src('source/img/**/*.{jpg,png}')
    .pipe(dest('build/img'))
}

// Webp

const createWebp = () => {
  return src('source/img/**/*.{jpg,png}')
    .pipe(squoosh({ webp: {} }))
    .pipe(dest('build/img'))
}

//Svg

const svg = (done) => {
  src(['source/img/**/*.svg', '!source/img/icons/*.svg'])
    .pipe(svgo())
    .pipe(dest('build/img'));
  done();
}

const sprite = () => {
  return src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgostore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(dest('build/img'));
}

// Copy

const copy = (done) => {
  src([
    'source/fonts/**/*.{woff2, woff}',
    'source/*.ico',
    'source/manifest.json',
  ], {
    base: 'source'
  })
    .pipe(dest('build'))
  done();
}

// Clean

const clean = () => {
  return deleteAsync('build');
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
  gulp.watch('source/img/icons/*.svg', gulp.series(svg, reload));
}

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    sprite,
    svg,
    createWebp,
    html,
  ));

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    sprite,
    svg,
    createWebp,
    copyImages,
    html
  ),
  gulp.series(
    server,
    watcher
  ));
