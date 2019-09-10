const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const debug = require('debug')('symbiose:express')
const express = require('express')
const logger = require('morgan')
const objectAssign = require('object-assign')
const path = require('path')

/**
 * App interface for Express
 *
 * @Class
 * @param   {object}    options     Options
 */
function AppExpress(options, config) {
  this.config = config
}


module.exports = AppExpress


AppExpress.prototype.createAppServer = function(eventEmitter) {
  const app = express()
  this.app = app

  // CSS Engine have to be the first
  registerCSSEngines.call(this, app)

  registerViewFolders.call(this, app)
  registerTemplateEngines.call(this, app)

  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())

  // TODO IMPROVE THIS
  registerStaticFolders.call(this, app)

  /**
   * Load routes
   *
   * @event Kernel#asking2loadRoutes
   */
  eventEmitter.emit('asking2loadRoutes', app)

  // >> LOAD VIEW HERE
  // >>
  // >>

  var admin = express() // TODO: use ROUTER!!!!!!!!!!

  app.get('/', (req, res) => res.send('Hello World!'))

  admin.get('/', function(req, res) {
    console.dir(admin.mountpath) // [ '/adm*n', '/manager' ]
    res.send('Admin Homepage')
  })

  var secret = express()
  secret.get('/', function(req, res) {
    console.log(secret.mountpath) // /secr*t
    res.send('Admin Secret')
  })
  admin.use('/secr*t', secret) // load the 'secret' router on '/secr*t', on the 'admin' sub app
  app.use(['/adm*n', '/manager'], admin) // load the 'admin' router on '/adm*n' and '/manager', on the parent app
  // <<
  // <<
  // <<

  // Error have to be the last
  registerError(app)

  return app
}


function registerCSSEngines(app) {
  /*
   * TODO: Replace by config loader class
   */
  const engines = this.config.get("framework.css.engines")

  if (!(engines && engines[0] instanceof Array))
    return

  engines.forEach((engine) => {
    registerCSSEngine(engine)
  })
}


function registerCSSEngine(engine) {
  let options = engine.options || {}

  /**
   * TODO: Use gulpfile instead this to compile scss/css, I think I will propose the two choices
   */

  /**
   * Same engines list that: https://github.com/expressjs/generator/blob/d1f3fcc6ccc7ab8986fb3438c82ab1a1f20dc50d/bin/express-cli.js#L248
   */

  let defaultOpt

  switch (engine.name) {
    case 'compass':
      const compass = require('node-compass')

      defaultOpt = {
        mode: 'expanded'
      }
      options = objectAssign(defaultOpt, options)

      app.use(compass(options))
      break
    case 'less':
      const lessMiddleware = require('less-middleware')

      defaultOpt = {
        src: path.join(__dirname, 'public'),
        once: false // (prod: true) TODO
      }
      options = objectAssign(defaultOpt, options)

      app.use(lessMiddleware(options.src, options))
      break
    case 'sass':
      const sassMiddleware = require('node-sass-middleware')

      defaultOpt = {
        src: path.join(__dirname, 'public'),
        dest: path.join(__dirname, 'public'),
        indentedSyntax: true, // true = .sass and false = .scss (TODO)
        sourceMap: true
        /**
         * TODO: add settings:
         * debug: true/false, (dev: true)
         * force: true/false, (dev: true)
         */
      }
      options = objectAssign(defaultOpt, options)

      app.use(sassMiddleware(options))
      break
    case 'stylus':
      const stylus = require('stylus')

      defaultOpt = {
        src: path.join(__dirname, 'public'),
        dest: path.join(__dirname, 'public')
      }
      options = objectAssign(defaultOpt, options)

      app.use(stylus.middleware(options))
      break
    default:
      console.log('bad config: css engine %s not available', program.css)

      eventEmitter.emit('onUnknownCSSEngine', app)
      process.exit(1)
      /**
       * TODO : Fire event to register other css engine
       *
       * ```
       * const cssEngine = kernel.getCSSEngine(engine.name) // (?) Kernel or CSSEngine class ?
       * if (cssEngine)
       * // ...
       * ```
       *
       * CSSEngine class seem a better choice. Idk between express middleware and gulpfile, I think I will propose the two choices
       *
       */

  }
}


function registerViewFolders(app) {
  // view engine setup
  app.set('views', path.join(__dirname, 'views'))
}


function registerTemplateEngines(app) {
  //set default
  /*
   * TODO: Replace by config loader class
   */
  const engines = this.config.get("framework.templating.engines")

  /*
   * TODO: Replace by config loader class
   */
  const extension = this.config.get("framework.templating.default")

  if (extension)
    app.set('view engine', extension)

  try {
    
  } catch (e) {}

  if (!(engines && engines[0] instanceof Array))
    return

  debug("loading template engine")
  engines.forEach((engine) => {
    debug(`loading ${engine.name} template engine`)
    const package = () => {
      try {
        return (engine.consolidate) ? cons[engine.name] : require(engine.name)
      } catch (e) {

        let advice = ""
        if (!engine.consolidate)
          advice += "- Do you forget to use \`consolidate: true\` ?\n"

        advice += "- Do you install ${engine.name} with npm install {package-name} ?"

        throw new Error(`template engine can't load ${engine.name}.\n${advice}`)
      }
    }

    const extension = engine.ext || engine.name
    app.set(extension, package)
  })
}


function registerStaticFolders(app) {
  app.use(express.static(path.join(__dirname, 'public')))
}


function registerError(app) {
  /**
   * src: https://github.com/expressjs/generator/blob/d1f3fcc6ccc7ab8986fb3438c82ab1a1f20dc50d/templates/js/app.js.ejs#L34
   */

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404))
  })

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  })
}