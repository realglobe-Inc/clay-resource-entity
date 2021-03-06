/**
 * Define entity for resource
 * @function define
 * @param {ClayResource} - Resource to bind
 * @returns {function} Resource entity class
 */
'use strict'

const {Entity} = require('clay-entity')
const clayResourceName = require('clay-resource-name')
const {refTo} = require('clay-resource-ref')

const assertEntityNotGone = (entity) => {
  if (entity.$$gone) {
    throw new Error(`The entity seems to be gone: "${entity.$$as}#${entity.id}"`)
  }
}

const toPlainObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((obj) => toPlainObject(obj))
  }
  const isEntity = !!obj && obj.$$entity
  if (isEntity) {
    return Object.assign({},
      ...[
        ...Object.keys(obj)
          .filter((name) => !/^\$\$/.test(name))
          .map((name) => ({
            [name]: toPlainObject(obj[name])
          })),
        {id: String(obj.id)}
      ],
    )
  }
  return obj
}

/** @lends define */
function define (resource) {
  const resourceName = clayResourceName(resource)

  class ResourceEntity extends Entity {
    static get resourceName () {
      return resourceName
    }

    static get resource () {
      return resource
    }

    /**
     * Set attributes to this entity
     * @param {Object} attributes
     */
    set (attributes) {
      Object.assign(this, attributes)
    }

    /**
     * Get attribute value
     * @param {string} name - Name of attribute
     * @returns {*} Found attribute
     */
    get (name) {
      return this[name]
    }

    /**
     * Save current attributes
     * @param {boolean} [force=false]
     * @returns {Promise}
     */
    async save (force = false) {
      assertEntityNotGone(this)
      const {id} = this
      const attributes = Object.keys(this)
        .filter((name) => name !== 'id')
        .filter((name) => !/^\$\$/.test(name))
        .reduce((attributes, name) => Object.assign(attributes, {
          [name]: this[name]
        }), {})
      await resource.update(id, attributes, {
        allowReserved: force,
      })
      await this.sync({
        ignoreCached: true
      })
      return this
    }

    /**
     * Sync and save again
     * @returns {Promise<void>}
     */
    async resave () {
      await this.sync({ignoreCached: true})
      await this.save()
    }

    /**
     * Sync from resource
     * @param {Object} [options={}] - Optional settings
     * @returns {Promise}
     */
    async sync (options = {}) {
      const {
        ignoreCached = false
      } = options
      assertEntityNotGone(this)
      const {id} = this
      const one = new ResourceEntity(await resource.one(id, {
        ignoreCached,
        strict: true
      }))
      this.set(one)
      return this
    }

    /**
     * Update this entity
     * @param {Object} attributes - Attributes to update
     * @param {Object} [options={}] - Optional settings
     * @returns {Promise}
     */
    async update (attributes, options = {}) {
      assertEntityNotGone(this)
      if (!attributes) {
        return
      }
      const {id} = this
      const changedAttributes = Object.assign({},
        ...Object.keys(attributes)
          .filter((name) => attributes[name] !== this[name])
          .map((name) => ({[name]: attributes[name]}))
      )
      await resource.update(id, changedAttributes, options)
      await this.sync({
        ignoreCached: true
      })
      return this
    }

    /**
     * Destroy this entity
     * @param {Object} [options={}] - Optional settings
     * @returns {Promise.<number>}
     */
    async destroy (options = {}) {
      assertEntityNotGone(this)
      const {id} = this
      const destroyed = await resource.destroy(id, options)
      this.$$gone = true
      return destroyed
    }

    /**
     * Create a copy without refs
     * @returns {Object}
     */
    toObject () {
      return toPlainObject(this)
    }

    /**
     * Convert to ref string
     * @returns {string} - Ref string
     */
    toRef () {
      return refTo(resource, this.id)
    }

    /**
     * Compare with entity
     * @param {ClayResourceEntity|string} entity
     * @returns {Boolean}
     */
    is (entity) {
      if (!entity) {
        return null
      }
      if (typeof entity === 'string') {
        return this.toRef() === entity
      }
      if (typeof entity.$ref === 'string') {
        return this.toRef() === entity.$ref
      }
      const {id, $$as} = entity
      const otherResource = $$as && ($$as !== this.$$as)
      if (otherResource) {
        return false
      }
      if (typeof id === 'undefined') {
        return false
      }
      return entity.id === this.id
    }
  }

  return ResourceEntity
}

module.exports = define
