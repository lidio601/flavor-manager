
const fs = require('fs')
const path = require('path')

const mkdirs = require('./mkdirs').mkdirs
const rmrdir = require('./rmrdir').rmrdir

const cwd = process.cwd()
const rollbackDir = path.join(cwd, '.rollback')
let localCache

/**
 * @returns {Boolean}
 */
function rollback () {
  const data = read()
  let {files, folders, restore} = data

  // filter to work on existing files only
  files = (files || []).filter(file =>
    fs.existsSync(path.join(cwd, file)))
  folders = (folders || []).filter(folder =>
    fs.existsSync(path.join(cwd, folder)))
  restore = (restore || []).filter(file =>
    fs.existsSync(path.join(rollbackDir, file)))

  // sum up the involved changes
  console.log(`[${files.length}] files to remove`)
  console.log(`[${folders.length}] folders to remove`)
  console.log(`[${restore.length}] files to restore`)

  files.forEach(file => {
    console.info(`* remove flavor ${file}`)
    fs.unlinkSync(file)
  })

  folders.forEach(folder => {
    console.info(`* remove flavor ${folder}/`)
    rmrdir(folder)
  })

  restore.forEach(file => {
    console.info(`* restore ${file}`)
    fs.renameSync(
      path.join(rollbackDir, file),
      path.join(cwd, file)
    )
  })

  console.info(`* remove rollback folder: .rollbac`)
  rmrdir(rollbackDir)

  return true
}

/**
 * @returns {String}
 */
function rollbackFile () {
  const basedir = rollbackDir
  const rollbackFile = path.join(basedir, 'rollback.json')

  const result = mkdirs(basedir)
  if (result.created) {
    console.info(`* create ${path.relative(cwd, result.first)}/`)
  }

  return rollbackFile
}

/**
 * @returns {String|false}
 */
function currentFlavor () {
  const data = read()

  if (!data) {
    // no flavor applied
    return false
  }

  return data.flavor
}

/**
 * @param {String} targetFlavor
 * @returns {Boolean}
 */
function shouldRollback (targetFlavor) {
  // only if:
  // a rollback record is present
  // the current flavor is different than the requested one
  if (!currentFlavor()) {
    return false
  }

  return currentFlavor() !== targetFlavor
}

/**
 * @param {String} flavor
 * @returns {{appendFile: Function, appendFolder: Function, appendBackup: Function, close: Function}}
 */
function create (flavor) {
  return new function () {
    const files = []
    const folders = []
    const restore = []

    this.appendFolder = folder =>
      folders.push(folder)

    this.appendFile = file =>
      files.push(file)

    this.appendBackup = file =>
      restore.push(file)

    this.close = () =>
      write(flavor, files, folders, restore)
  }()
}

/**
 * @param {String} flavor
 * @param {Array<String>} files
 * @param {Array<String>} folders
 * @param {Array<String>} restore
 * @returns {Boolean}
 */
function write (flavor, files, folders, restore) {
  // convert paths to relative
  files = files.map(filename =>
    path.relative(cwd, filename))
  folders = folders.map(dirname =>
    path.relative(cwd, dirname))
  restore = restore.map(filename =>
    path.relative(cwd, filename))

  // produce the output object
  const data = {
    flavor,
    files,
    folders,
    restore
  }
  // console.log('rollback data', data)

  // write rollback.json
  const outputFilename = rollbackFile()
  console.info(`* write ${path.relative(cwd, outputFilename)}`)
  fs.writeFileSync(outputFilename, JSON.stringify(data, null, '  '))

  return true
}

/**
 * @returns {Object}
 */
function read () {
  if (localCache !== undefined) {
    return localCache
  }

  localCache = null
  const inputFilename = rollbackFile()

  if (fs.existsSync(inputFilename)) {
    try {
      localCache = JSON.parse(fs.readFileSync(inputFilename))
    } catch (err) {}
  }

  return localCache
}

module.exports = {
  rollback,
  rollbackDir,
  rollbackFile,
  currentFlavor,
  shouldRollback,
  create,
  write,
  read
}
