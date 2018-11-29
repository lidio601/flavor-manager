
const listCmd = require('./list')
const rollbackLib = require('./lib/rollback')

/**
 * @returns {Boolean}
 */
async function rollback () {
  const flavor = rollbackLib.currentFlavor()

  if (!flavor) {
    console.warn(`No rollback needed. No such flavor applied`)
    return false
  }

  console.info(`Rolling back from flavor: ${flavor}`)
  return rollbackLib.rollback()
}

/**
 * @returns {Promise<*>}
 */
async function run () {
  rollback()
}

module.exports = {
  run
}
