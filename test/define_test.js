/**
 * Test case for define.
 * Runs with mocha.
 */
'use strict'

const define = require('../lib/define.js')
const { fromDriver } = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')
const { equal, ok } = require('assert')
const co = require('co')

describe('define', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Define', () => co(function * () {
    let driver = clayDriverMemory({})
    let Org = fromDriver(driver, 'Org')
    let User = fromDriver(driver, 'User')

    let UserEntity = define(User)
    let OrgEntity = define(Org)

    let org01 = new OrgEntity(yield Org.create({ name: 'org01' }))
    let user01 = new UserEntity(yield User.create({ name: 'user01', org: org01 }))

    equal(user01.get('name'), 'user01')

    yield User.update(user01.id, { vr: 2 })

    user01.set({ tested: true })

    yield user01.sync()

    equal(user01.get('vr'), 2)
    equal(user01.tested, true)

    yield user01.update({ foo: 'bar' })

    equal(user01.foo, 'bar')

    yield user01.destroy()

    ok(!(yield User.one(user01.id)))
  }))
})

/* global describe, before, after, it */
