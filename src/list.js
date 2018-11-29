
const path = require('path')
const fs = require('fs')
const readline = require('readline')

let cachedList = false
const flavorDir = path.join(process.cwd(), 'recipe')

/**
 * @returns {Array<String>}
 */
function list () {
  if (cachedList) {
    return cachedList
  }

  if (!fs.existsSync(flavorDir)) {
    console.info('Creating recipe directory at ' + flavorDir)
    fs.mkdirSync(flavorDir)
    return []
  }

  cachedList = fs.readdirSync(flavorDir)

  return cachedList
}

/**
 * @param {String} flavor
 * @returns {Boolean}
 */
const validate = flavor =>
  list().indexOf(flavor) !== -1

/**
 * @param {String} flavor
 * @returns {String}
 */
const fullpath = flavor =>
  path.join(flavorDir, flavor)

/**
 * @param {String} choosenFlavorCb
 */
function run (choosenFlavorCb) {
  console.info('Available flavors:')
  const flavors = list();

  flavors.forEach(function (flavor, index) {
    console.info(`${index}) ${flavor}`)
  })

  if (choosenFlavorCb) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Choose a flavor: ', index => {
      index = parseInt(index)

      rl.close()

      if (index < 0 || index >= flavors.length) {
        process.exit(1)
      }

      choosenFlavorCb(flavors[index])
    })
  }
}

module.exports = {
  list,
  validate,
  fullpath,
  run
}
