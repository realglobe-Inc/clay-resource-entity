/**
 * Entity exetensions for Clay-Resource
 * @module clay-resource-entity
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get define () { return d(require('./define')) }
}
