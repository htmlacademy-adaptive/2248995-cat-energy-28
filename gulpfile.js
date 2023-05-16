import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
// import csso from 'postcss-csso';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
// import del from 'del';
import rename from 'gulp-rename';
import squoosh from 'gulp-libsquoosh';
// import browser from 'browser-sync';

const { dest, src } = gulp;

// Styles

export const styles = () => {
  return src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
export const html = () => {
  return src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('build'))
}

//Scripts
export const scripts = () => {
  return src('source/js/*.js')
    .pipe(terser())
    .pipe(dest('build/js'))
}

// Images

export const optimizeImages = () => {
  return src('sourсe/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(dest('build/img'))
}

export const copyImages = () => {
  return src('sourсe/img/**/*.{jpg,png}')
    .pipe(dest('build/img'))
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

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}


export default gulp.series(
  images, html, styles, server, watcher
);
