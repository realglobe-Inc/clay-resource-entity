/**
 * Define entity for resource
 * @function define
 * @param {ClayResource} - Resource to bind
 * @returns {function} Resource entity class
 */
'use strict'

const {Entity} = require('clay-entity')
const clayResourceName = require('clay-resource-name')

const assertEntityNotGone = (entity) => {
  if (entity.$$gone) {
    throw new Error(`The entity seems to be gone: "${entity.$$as}#${entity.id}"`)
  }
}

/** @lends define */
function define (resource) {
  const resourceName = clayResourceName(resource)

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
      return s[name]
    }

    /**
     * Save current attributes
     * @returns {Promise}
     */
    async save () {
      const s = this
      assertEntityNotGone(s)
      const {id} = s
      const attributes = Object.keys(s)
        .filter((name) => name !== 'id')
        .filter((name) => !/^\$\$/.test(name))
        .reduce((attributes, name) => Object.assign(attributes, {
          [name]: s[name]
        }), {})
      await resource.update(id, attributes)
      await s.sync()
      return s
    }

    /**
     * Sync from resource
     * @returns {Promise}
     */
    async sync () {
      const s = this
      assertEntityNotGone(s)
      const {id} = s
      const one = new ResourceEntity(await resource.one(id, {strict: true}))
      s.set(one)
      return s
    }

    /**
     * Update this entity
     * @param {Object} attributes - Attributes to update
     * @param {Object} [options={}] - Optional settings
     * @returns {Promise}
     */
    async update (attributes, options = {}) {
      const s = this
      assertEntityNotGone(s)
      if (!attributes) {
        return
      }
      const {id} = s
      const changedAttributes = Object.assign({},
        ...Object.keys(attributes)
          .filter((name) => attributes[name] !== s[name])
          .map((name) => ({[name]: attributes[name]}))
      )
      await resource.update(id, changedAttributes, options)
      await s.sync()
      return s
    }

    /**
     * Destroy this entity
     * @param {Object} [options={}] - Optional settings
     * @returns {Promise.<number>}
     */
    async destroy (options = {}) {
      const s = this
      assertEntityNotGone(s)
      const {id} = s
      const destroyed = await resource.destroy(id, options)
      s.$$gone = true
      return destroyed
    }
  }

  return ResourceEntity
}

module.exports = define
