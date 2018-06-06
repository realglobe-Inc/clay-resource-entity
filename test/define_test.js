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
    const driver = clayDriverMemory({})
    const Org = fromDriver(driver, 'Org')
    const User = fromDriver(driver, 'User')

    User.policy({
      name: {
        type: 'STRING',
        unique: true
      }
    })

    const UserEntity = define(User)
    const OrgEntity = define(Org)

    const org01 = new OrgEntity(await Org.create({name: 'org01'}))
    const user01 = new UserEntity(await User.create({name: 'user01', org: org01}))

    equal(user01.get('name'), 'user01')

    await User.update(user01.id, {vr: 2})

    user01.set({tested: true})

    await user01.sync()

    equal(user01.get('vr'), 2)
    equal(user01.tested, true)

    await user01.update({name: user01.name, foo: 'bar'})

    equal(user01.foo, 'bar')

    ok(user01.is(`User#${user01.id}`))
    ok(!user01.is(`Org#${user01.id}`))
    ok(user01.is({$ref: `User#${user01.id}`}))
    ok(!user01.is(null))
    ok(user01.is({$$as: 'User', id: user01.id}))
    ok(!user01.is({$$as: 'Org', id: user01.id}))

    user01.baz = 'This is baz'

    await user01.save()
    await user01.resave()

    equal(user01.toRef(), `User#${user01.id}`)

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

    ok(user01.toObject())
    equal(typeof user01.toObject().id, 'string')
  })
})

/* global describe, before, after, it */
