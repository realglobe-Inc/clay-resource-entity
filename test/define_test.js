/**
 * Test case for define.
 * Runs with mocha.
 */
'use strict'

const define = require('../lib/define.js')
const {fromDriver} = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')
const {equal, ok} = require('assert')

describe('define', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Define', async () => {
    let driver = clayDriverMemory({})
    let Org = fromDriver(driver, 'Org')
    let User = fromDriver(driver, 'User')

    User.policy({
      name: {
        type: 'STRING',
        unique: true
      }
    })

    let UserEntity = define(User)
    let OrgEntity = define(Org)

    let org01 = new OrgEntity(await Org.create({name: 'org01'}))
    let user01 = new UserEntity(await User.create({name: 'user01', org: org01}))

    equal(user01.get('name'), 'user01')

    await User.update(user01.id, {vr: 2})

    user01.set({tested: true})

    await user01.sync()

    equal(user01.get('vr'), 2)
    equal(user01.tested, true)

    await user01.update({foo: 'bar'})

    equal(user01.foo, 'bar')

    user01.baz = 'This is baz'

    await user01.save()

    await user01.destroy()

    ok(!(await User.one(user01.id)))

    {
      let caught
      try {
        await user01.update({foo: 'bar'})
      } catch (e) {
        caught = e
      }
      ok(caught)
    }
  })
})

/* global describe, before, after, it */
