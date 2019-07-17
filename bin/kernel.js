const debug = require('debug')('symbiose:kernel')
const fs = require('fs')
const path = require('path')
const objectAssign = require('object-assign')

const Http = require('./http.js')
const App = require('./app-express.js')

function Kernel() {
  this.config = loadConfigFile('config.yml') || {}
}

module.exports = Kernel

Kernel.prototype.loadEnv = function(varName) {
  if (!process.env[varName]) {
    console.error(`Error: \$${varName} variable is not set.`)
    return false
  }

  const file = `config_${process.env[varName]}.yml`,
    data = loadConfigFile(file)

  if (data === false)
    return false

  try {
    objectAssign(this.config, data)
  } catch (err) {
    console.error('Error: impossible to merge config.')
    console.error(err)
    return false
  }

  return true
}

function loadConfigFile(file) {
  const path = `./app/config/${file}`
  debug(`loading ${path}`)
  try {
    config = fs.readFileSync(path).toString()
  } catch (err) {
    console.error(`Error: cannot read or access to ${file} (maybe the config file doesn't exist).`)
    console.error(err)
    return false
  }

  try {
    config = YAML.parse(config)
  } catch (err) {
    console.error('Error: cannot parse the YAML of ${file}.')
    console.error(err)
    return false
  }

  return config
}

Kernel.prototype.launchServer = function(port) {
  const mdw = new App(this.config),
    http = new Http()

  const app = mdw.createAppServer()

  mdw.set('port', port)

  http.createHttpServer(app, port)

  this.app = app
  this.http = http
  this.mdw = mdw
}

Kernel.prototype.start = function() {
  const port = getPortNumber()

  this.launchServer(port)
}

function getPortNumber() {
  const config = this.config

  /*
   * TODO: Replace by config loader class
   */
  const port = (() => {
    try {
      return config.http.port
    } catch (err) {
      config.http = { port: process.env.PORT || 3000 }
      return config.http.port
    }
  })()

  return normalizePort(port)
}

/**
 * Normalize a port into a number, string, or false.
 * src: https://github.com/expressjs/generator/blob/d1f3fcc6ccc7ab8986fb3438c82ab1a1f20dc50d/templates/js/www.ejs#L36
 */

function normalizePort(val) {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}
