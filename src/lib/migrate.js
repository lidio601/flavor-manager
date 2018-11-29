
const path = require('path')
const fs = require('fs')

const rollback = require('./rollback')
const mkdirs = require('./mkdirs').mkdirs

const cwd = process.cwd()

/**
 * @param {String} flavor
 * @param {String} sourceDir
 * @param {String} targetDir
 * @param {Array<String>} fileList
 * @returns {Boolean}
 */
function apply (flavor, sourceDir, targetDir, fileList) {
  const r = rollback.create(flavor)

  fileList.forEach(async file => {
    const sourceFile = path.join(sourceDir, file)
    const targetFile = path.join(targetDir, file)

    const result = mkdirs(path.dirname(targetFile))
    if (result.created) {
      console.info(`* create ${path.relative(cwd, path.dirname(targetFile))}/`)
      r.appendFolder(result.first)
    }

    if (fs.existsSync(targetFile)) {
      const backupDir = path.join(rollback.rollbackDir, path.dirname(path.relative(cwd, targetFile)))
      const backupFile = path.join(backupDir, path.basename(targetFile))

      if (!fs.existsSync(backupFile)) {
        console.info(`* backup ${path.relative(cwd, targetFile)}`)
        mkdirs(backupDir)
        fs.renameSync(targetFile, backupFile)
      }

      r.appendBackup(targetFile)
    }

    console.info(`* copy ${path.relative(cwd, targetFile)}`)
    fs.copyFileSync(sourceFile, targetFile)
    r.appendFile(targetFile)
  })

  return r.close()
}

/**
 * @param {String} targetFlavor
 * @param {String} sourceDir
 * @param {String} targetDir
 * @param {String} fileList
 * @returns {Boolean}
 */
function migrate (targetFlavor, sourceDir, targetDir, fileList) {
  if (rollback.shouldRollback(targetFlavor)) {
    rollback.rollback()
  }

  return apply(targetFlavor, sourceDir, targetDir, fileList)
}

module.exports = {
  migrate
}
