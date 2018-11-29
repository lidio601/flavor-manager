
const fs = require('fs')
const path = require('path')

function mkdirSync (targetDir) {
  const initDir = path.isAbsolute(targetDir) ? path.sep : ''
  const baseDir = '.'

  return targetDir.split(path.sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir)

    try {
      fs.mkdirSync(curDir)
    } catch (err) {
      if (err.code === 'EEXIST') { // curDir already exists!
        return curDir
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`)
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1
      if (!caughtErr || (caughtErr && curDir === path.resolve(targetDir))) {
        throw err // Throw if it's just the last created dir.
      }
    }

    return curDir
  }, initDir)
}

/**
 * @exports
 * @param {String} dirname
 * @returns {{created: Boolean, first: String}}
 */
exports.mkdirs = dirname => {
  let created = false
  let first = null
  let exist
  let temp = dirname

  while (temp !== '/' && !(exist = fs.existsSync(temp))) {
    if (!exist) {
      first = temp
    }

    temp = path.dirname(temp)
  }

  if (fs.existsSync(dirname)) {
    return Promise.resolve({created, first})
  }

  mkdirSync(dirname)
  created = true

  return {created, first}
}
