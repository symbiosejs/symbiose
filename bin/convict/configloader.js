const debug = require('debug')('symbiose:configloader')
const error = require('debug')('symbiose:configloader:error')
const Convict = require('./bin/index.js')
const path = require('path')
const YAML = require('yaml')
const fs = require('fs')

/**
 * Loader for `config.yml` files.
 *
 * @class
 */
function ConfigLoader(paths) {
  debug('Start to load config:')

  if (paths && typeof paths === "string") {
    paths = [ paths ]
  }

  if (paths && (paths instanceof Array) === false) {
    debug('`options.config` key is optionnal but if it declared should be an array or a string in: `new Kernal(options)`.')
    process.exit(1)
  }

  if (!paths) {
    debug('Symbiose will load on the default config because no config file is/are selected.')
  }

  const $$ = Convict(path.resolve(__dirname, 'schema', 'config.yml'))


  /**
   * Convict
   *
   * @name $$
   * @memberOf ConfigLoader
   */
  Object.defineProperty(this, "$$", {
    value: $$
  })

  paths.forEach((path) => {
    debug(' - Loading %s', path)
    $$.loadFile(path)
  })

  fs.mkdirSync(path.resolve($$.get('path.cache')), { recursive: true })
  const data = new Uint8Array(Buffer.from(JSON.stringify($$.getProperties(), null, 2)))

  const filepath = path.resolve($$.get('path.cache'), 'config.yml.json')
  fs.writeFileSync(filepath, data)
  debug('Cache file created: %s', filepath)

  try {
    $$.validate()
  } catch (err) {
    error('Check your configuration you have an invalid value :')
    error(err.message)
    process.exit(1)
  }
}

module.exports = ConfigLoader

ConfigLoader.prototype.get = function (property) {
  return this.$$.get(property)
}
