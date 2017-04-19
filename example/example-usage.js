'use strict'

const { define } = require('clay-resource-entity')
const { fromDriver } = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')

async function tryExample () {
  let driver = clayDriverMemory({})
  let Org = fromDriver(driver, 'Org')
  let User = fromDriver(driver, 'User')

  let UserEntity = define(User)
  let OrgEntity = define(Org)

  let org01 = new OrgEntity(await Org.create({ name: 'org01' }))
  let user01 = new UserEntity(await User.create({ name: 'user01', org: org01 }))

  await user01.update({ vr: 2 }) // UserEntity has connection with user resource
}

tryExample.catch((err) => console.error)
