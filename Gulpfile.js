const path = require('path')

const del = require('del')
const gulp = require('gulp')
const jsdoc = require('gulp-jsdoc3')

const normalizeSEP = (str) => str.replace(/\//g, path.sep)

process.chdir(path.resolve(__dirname))

const docFolder = path.resolve(__dirname, '.doc')

const cleanDoc = () => del([
  docFolder
])

const src = [
  './bin/**/*.js'
].map(normalizeSEP)

const generateDoc = () => 
  gulp.src(src, {read: false})
    .pipe(jsdoc(require('./jsdoc.json')))

gulp.task('doc', gulp.series(cleanDoc, generateDoc))
