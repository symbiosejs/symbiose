const debug = require('debug')('interpreter:routes'),
  YAML = require('yaml')

/**
 * Interpreter for `routes.yml` files.
 *
 * @class
 */
function RoutesInterpreter(filepath) {
  debug('loading %s', filepath)

  const routes = () => {
    try {
      return YAML.parse(filepath)
    } catch (err) {
      console.error(`Error: cannot parse the YAML of ${filepath}.`)
      console.error(err)
      return false
    }
  }

  routes.each(route);

}

module.exports = RoutesInterpreter

function route(key, val) {
  console.log(key, val)
}

convict.addFormat({
  name: 'string-extension',
  validate: function(val) {
    if (!val.test(/^[A-z0-9]+$/)) {
      throw new Error('must contain only letter and number');
    }
  },
  coerce: function(val) {
    return "" + val;
  }
})
