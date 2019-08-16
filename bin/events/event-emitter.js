const EventEmitterNative = require('events');

function EventEmitter() {

}

EventEmitter.prototype = new EventEmitterNative()

module.exports = EventEmitter
