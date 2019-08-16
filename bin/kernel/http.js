const http = require('http')
const debug = require('debug')('symbiose:http')
const error = require('debug')('symbiose:http:error')


/**
 * HTTP interface
 *
 * @Class
 */
function Http() {
}


module.exports = Http


/**
 * Following code inspired by : www of express-generator
 * src: https://github.com/expressjs/generator/blob/d1f3fcc6ccc7ab8986fb3438c82ab1a1f20dc50d/templates/js/www.ejs
 */


/**
 * create HTTP Server
 *
 * @param   {object}    app     Express app
 * @param   {number}    port    Port number
 */
Http.prototype.createHttpServer = function(app, port) {
  /**
   * Create HTTP server.
   */
  const server = http.createServer(app)

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port)
  server.on('error', onError)
  server.on('listening', () => {
    const addr = server.address()
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port
    debug('Listening on ' + bind)
  })
}


/**
 * Event listener for HTTP server 'error' event.
 *
 * @param   {object}    error   Error object
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}
