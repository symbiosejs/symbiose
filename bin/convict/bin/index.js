const convict = require('convict');
const yaml = require('yaml')

convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.parse });

convict.addFormat({
  name: 'source-array',
  validate: function(sources, schema) {
    if (!sources instanceof Array) {
      throw new Error('must be of type Array');
    }

    sources.forEach((source) => {
      convict(schema.children).load(source).validate();
    })
  }
});

convict.addFormat({
  name: 'array[String]',
  validate: function(strings, schema) {
    if (!Array.isArray(strings)) {
      throw new Error('must be an Array');
    }

    strings.forEach((string, key) => {
      if (typeof string !== 'string') {
        throw new TypeError(`Array [${key}] is not a string`);
      }
    })
  }
});

module.exports = convict;

// @todo   Make a PR to change convict and scope global variable
/*function new_require(packageName) {
  const path = require.resolve(packageName)
  const before = require.cache[path] || false
  const newModule = require(packageName)

  delete require.cache[path]

  if (before) {
    require.cache[path] = before
  }

  return newModule
}*/
