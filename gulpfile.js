const gulp = require('gulp'), //господин гульп
  open = require('gulp-open'), //что бы сразу открывать в браузере
  connect = require('gulp-connect'), //web-server, включает livereload  (https://www.npmjs.com/package/gulp-connect)
  autoprefixer = require('gulp-autoprefixer'), //автоматически добавляет вендорные префиксы к CSS свойствам
  uglify = require('gulp-uglify'), //сжимает JS
  sourcemaps = require('gulp-sourcemaps'), //js, css sourscemaps
  imagemin = require('gulp-imagemin'), //для сжатия картинок
  pngquant = require('imagemin-pngquant'), //для лучшего сжатия png картинок
  rimraf = require('rimraf'), //rm -rf
  sass = require('gulp-sass'), //для scss (https://www.npmjs.com/package/gulp-sass)
  fileinclude = require('gulp-file-include');

sass.compiler = require('node-sass'); //компилятор для scss

var path = { //пути до всего в одном месте
  build: { //сюда складываем готовый проект
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    fonts: 'build/fonts/'
  },
  src: { // исходники
    html: 'src/*.html',
    js: 'src/js/main.js',
    sass: 'src/sass/main.scss',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  watch: { // смотрим за изменениями этих объектов
    html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    sass: 'src/sass/**/*.scss',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  base: "./build"
}

var serverParams = { //параметры нашего сервера
  root: path.base,
  port: 9000,
  keepalive: true,
  livereload: true
}

gulp.task('connect', function(){ //стартуем сервер
  connect.server(serverParams);
});

gulp.task('app', function(){
  let options = {
    uri: 'http://localhost:'+serverParams.port,
    app: 'Google Chrome'
  };

  gulp.src('./').pipe(open(options));
});

gulp.task('html', function(){
  return gulp.src([path.src.html])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(path.build.html))
    .pipe(connect.reload()); //И перезагрузим наш сервер для обновлений
});

gulp.task('sass', function(){
  return gulp.src(path.src.sass) // собираем сасы
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError)) //компилим
    .pipe(autoprefixer()) //Добавим вендорные префиксы
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css)) //запихуеваем куда надо
    .pipe(connect.reload()); //И перезагрузим наш сервер для обновлений
});

gulp.task('js', function(){
  return gulp.src(path.src.js) //Найдем наш main файл
    .pipe(sourcemaps.init()) //Инициализируем sourcemap
    .pipe(uglify()) //Сожмем наш js
    .pipe(sourcemaps.write()) //Пропишем карты
    .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
    .pipe(connect.reload()); //И перезагрузим сервер
});

gulp.task('images', function () {
  return gulp.src(path.src.img) //Выберем наши картинки
    .pipe(imagemin({ //Сожмем их
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img)) //И бросим в build
    .pipe(connect.reload());
});

gulp.task('fonts', function() {
  return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
});

gulp.task('watch', function(){
  gulp.watch(path.watch.html, gulp.series('html'));
  gulp.watch(path.watch.sass, gulp.series('sass'));
  gulp.watch(path.watch.js, gulp.series('js'));
  gulp.watch(path.watch.img, gulp.series('images'));
  gulp.watch(path.watch.fonts, gulp.series('fonts'));
});

gulp.task('clean', function (cb) {
  rimraf(path.base, cb);
});

gulp.task('default', gulp.parallel('html', 'sass', 'js', 'images', 'fonts', 'watch', 'connect', 'app'));