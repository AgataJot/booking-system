/* jshint unused: false */
var gulp = require('gulp')
  , stylus = require('gulp-stylus')
  , nib = require('nib')

var resourcesPath = '.'

var defaultPaths = {
  stylus: [
    resourcesPath + '/stylus/**/**/*.styl'
  , resourcesPath + '/stylus/**/*.styl'
  , resourcesPath + '/stylus/*.styl'
  ]
}

var stylusOptions =
  { set: ['compress']
  , use: [nib()]
  , import: ['nib']
  , linenos: true
  }


gulp.task('stylus-watch', function () {

  // Render development version
  stylusOptions.compress = false
  gulp.src([ resourcesPath + '/stylus/main.styl' ])
    .pipe(stylus(stylusOptions).on('error', handleError))
    .pipe(gulp.dest(''))

})

gulp.task('watch', function() {
  // gulp.watch(defaultPaths.stylus, ['stylus'])
  gulp.watch(defaultPaths.stylus, ['stylus-watch'])
})

function handleError(err) {
  console.log(err.toString())
  this.emit('end')
}

// watch
gulp.task('w', ['stylus-watch', 'watch'])
