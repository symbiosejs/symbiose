const debug = require('debug')('symbiose:kernel')
const fs = require('fs')
const path = require('path')
const objectAssign = require('object-assign')

const Http = require('./http.js')
const App = require('./app-express.js')

const configLoader = require('./../lib/convict/configloader.js')

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
  });

  if (arg.symbionts && arg.symbionts instanceof Array) {
    debug('loading symbionts...')
    arg.symbionts.forEach((symbiont) => {
      loadSymbiont(symbiont)
    })
  } else {
    require('debug')('symbiose:warn')('No symbiont registered to load with Symbiose, check `new Kernel(arg.symbionts)`.')
  }
}

module.exports = Kernel


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


function loadSymbiont(packageName) {
  console.log(packageName)
}