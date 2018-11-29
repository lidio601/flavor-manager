
const listCmd = require('./list')
const scan = require('./lib/scan').scan
const migrate = require('./lib/migrate').migrate

/**
 * @param {String} flavor
 * @returns {Promise<*>}
 */
async function change (flavor) {
  console.info(`Switching to flavor: ${flavor}`)

  const flavorDir = listCmd.fullpath(flavor)
  const targetDir = process.cwd()
  const flavorFiles = await scan(flavorDir)
  // console.log(`${flavorFiles.length} changes to apply`, {flavorDir, targetDir})

  migrate(flavor, flavorDir, targetDir, flavorFiles)
}

/**
 * @param {String} flavor
 * @returns {Promise<*>}
 */
async function run (flavor) {
  if (!flavor) {
    return listCmd.run(change)
  }

  if (!listCmd.validate(flavor)) {
    console.error('Invalid flavor name!')
    console.error('run flavor list to see the available flavors')
    return process.exit(1)
  }

  change(flavor)
}

module.exports = {
  change,
  run
}
