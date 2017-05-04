/**
 * Define entity for resource
 * @function define
 * @param {ClayResource} - Resource to bind
 * @returns {function} Resource entity class
 */
'use strict'

const co = require('co')
const { Entity } = require('clay-entity')
const clayResourceName = require('clay-resource-name')

const assertEntityNotGone = (entity) => {
  if (entity.$$gone) {
    throw new Error(`The entity seems to be gone: "${entity.$$as}#${entity.id}"`)
  }
}

/** @lends define */
function define (resource) {
  let resourceName = clayResourceName(resource)
  class ResourceEntity extends Entity {
    static get resourceName () {
      return resourceName
    }

    /**
     * Set attributes to this entity
     * @param {Object} attributes
     */
    set (attributes) {
      const s = this
      Object.assign(s, attributes)
    }

    /**
     * Get attribute value
     * @param {string} name - Name of attribute
     * @returns {*} Found attribute
     */
    get (name) {
      const s = this
      return s[ name ]
    }

    /**
     * Save current attributes
     * @returns {Promise}
     */
    save () {
      const s = this
      assertEntityNotGone(s)
      let { id } = s
      let attributes = Object.keys(s)
        .filter((name) => name !== 'id')
        .filter((name) => !/^\$\$/.test(name))
        .reduce((attributes, name) => Object.assign(attributes, {
          [name]: s[ name ]
        }), {})
      return co(function * () {
        yield resource.update(id, attributes)
        yield s.sync()
        return s
      })
    }

    /**
     * Sync from resource
     * @returns {Promise}
     */
    sync () {
      const s = this
      assertEntityNotGone(s)
      let { id } = s
      return co(function * () {
        let one = new ResourceEntity(yield resource.one(id, { strict: true }))
        s.set(one)
        return s
      })
    }

    /**
     * Update this entity
     * @param {Object} attributes - Attributes to update
     * @returns {Promise}
     */
    update (attributes) {
      const s = this
      assertEntityNotGone(s)
      let { id } = s
      return co(function * () {
        yield resource.update(id, attributes)
        yield s.sync()
        return s
      })
    }

    /**
     * Destroy this entity
     * @returns {Promise.<number>}
     */
    destroy () {
      const s = this
      assertEntityNotGone(s)
      let { id } = s
      return co(function * () {
        let destroyed = yield resource.destroy(id)
        s.$$gone = true
        return destroyed
      })
    }
  }

  return ResourceEntity
}

module.exports = define
