const debug = require('debug')('symbiose:kernel')
const EventEmitter = require('./event/bin/index.js');
const fs = require('fs')
const path = require('path')
const objectAssign = require('object-assign')

const Http = require('./http.js')
const App = require('./app-express.js')

const configLoader = require('./convict/configloader.js')
const Symbiont = require('symbiont')

/* require in parent directory work context */
const createRequire = require('module').createRequire || require('module').createRequireFromPath
const requireSymbiont = createRequire('./')


/**
 * Kernel of Symbiose
 *
 * @Class
 * @param   {object}    arg     Object
 */
function Kernel(arg) {
  /**
   * Config Storage
   *
   * @name config
   * @memberOf Kernel
   */
  Object.defineProperty(this, "config", {
    value: new configLoader(arg.config)
  })

  /**
   * Event Emitter
   *
   * @name eventEmitter
   * @memberOf Kernel
   */
  Object.defineProperty(this, "eventEmitter", {
    value: new EventEmitter()
  })

  if (arg.symbionts && arg.symbionts instanceof Array) {
    debug('loading symbionts...')

    arg.symbionts.forEach((val, key) => symbiontLoader.call(this, val, key))
  } else {
    debug('No symbiont registered to load with Symbiose, check `new Kernel(arg.symbionts)`.')
    //TODO: Fire an error.
  }
}


module.exports = Kernel


Object.defineProperty(Kernel, "env", {
  value: getCurrentEnv()
})


/**
 * Symbionts { <symbiontName>: <symbiontClass> }
 *
 * @name symbionts
 * @memberOf Kernel
 */
Object.defineProperty(Kernel.prototype, "symbionts", {
  value: {}
})


Kernel.prototype.launchServer = function() {
  const mdw = new App(null, this.config),
    http = new Http()

  const app = mdw.createAppServer()

  const port = this.config.get("http.port")

  app.set('port', port)

  http.createHttpServer(app, port)

  this.app = app
  this.http = http
  this.mdw = mdw
}


Kernel.prototype.start = function(envName, filename) {
  this.launchServer()
}


function getCurrentEnv() {
  const argv = require('yargs-parser')(process.argv.slice(2))

  let env = "dev"

  const pick = [
    (argv["env"] && typeof argv["env"] === "string") ? argv["env"] : false,
    (argv["dev"]) ? "dev" : false,
    (argv["prod"]) ? "prod" : false
  ].filter((env) => env)

  if (pick.length === 0) {
    debug('Symbiose starts with the default environment: %s', env)
  } else {
    env = pick[0]
    debug('Symbiose starts with %s environment.', env)
  }

  return env
}


function symbiontLoader(symbiontName, key) {
  const ErrorWithSymbiont = function(message) {
    debug(message)
    return new Error(message)
  }

  // symbiontName must be a string
  if (typeof symbiontName !== "string") {
    const message = `ERROR: Invalid parameter for arg.symbionts[${key}] in new Kernel(arg) should be a string`
    throw new ErrorWithSymbiont(message)
  }

  debug(`loading '${symbiontName}'...`)

  // symbiont (module) must be found
  const symbiont = (() => {
    try {
      return requireSymbiont(symbiontName)
    } catch (err) {
      const message = `ERROR: Invalid parameter for arg.symbionts[${key}]) in new Kernel(arg) cannot find module '${symbiontName}'`
      throw new ErrorWithSymbiont(message)
    }
  })()

  // module must be a symbiont
  if (symbiont.constructor.name !== Symbiont.name ||
    symbiont.constructorNameString !== Symbiont.name ||
    typeof symbiont.versionSymbiontConstructor !== "string") {
    const message = `ERROR: Invalid parameter for new Kernel(arg.symbionts[${key}]), module '${symbiontName}' is not a symbiont`
    throw new ErrorWithSymbiont(message)
  }

  // module must be a symbiont
  if (this.symbionts[key]) {
    const message = `ERROR: arg.symbionts[${key}] is already defined, you can't rewrite`
    throw new ErrorWithSymbiont(message)
  }

  /* Only store controllers */
  Object.defineProperty(this.symbionts, key, {
    value: symbiont.getPrivateStorage().controllers
  })
}
