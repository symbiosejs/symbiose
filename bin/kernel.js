const debug = require('debug')('symbiose:kernel')
const EventEmitter = require('./event/bin/index.js');
const fs = require('fs')
const createRequire = require('module').createRequire || require('module').createRequireFromPath
const path = require('path')
const objectAssign = require('object-assign')

const Http = require('./http.js')
const App = require('./app-express.js')

const configLoader = require('./convict/configloader.js')
const Symbiont = require('symbiont')

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
  Object.defineProperty(Kernel.prototype, "config", {
    value: new configLoader(arg.config)
  })

  if (arg.symbionts && arg.symbionts instanceof Array) {
    debug('loading symbionts...')

    const requireSymbiont = createRequire('./')

    const ErrorWithSymbiont = function (message) {
      debug(message)
      return new Error(message)
    }

    arg.symbionts.forEach((symbiontName, key) => {
      // symbiontName must be a string
      if (typeof symbiontName !== "string") {
        const message = `ERROR: Invalid parameter for new Kernel(arg), arg.symbionts[${key}] should be a string`
        throw new ErrorWithSymbiont(message)
      }

      debug(`loading '${symbiontName}'...`)

      // symbiont (module) must be found
      const symbiont = (() => {
        try {
          return requireSymbiont(symbiontName)
        } catch (err) {
          const message = `ERROR: Invalid parameter for new Kernel(arg.symbionts[${key}]), cannot find module '${symbiontName}'`
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

      console.log(symbiont.getPrivateStorage().controllers.home && symbiont.getPrivateStorage().controllers.home.test())
    })
  } else {
    debug('No symbiont registered to load with Symbiose, check `new Kernel(arg.symbionts)`.')
    //TODO: Fire an error.
  }
}

module.exports = Kernel


Object.defineProperty(Kernel, "env", {
  value: getCurrentEnv()
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