
const path = require('path')
const fs = require('fs')
const assert = require('assert')
const regexReplace = require('regex-replace-file')

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
  const patchList = []

  // filter out files like example.patch.json
  fileList = fileList.filter(filename => {
    if (filename.endsWith('patch.json')) {
      patchList.push(filename)

      return false
    }

    return true
  })

  // copy flavor file and structure
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

  // apply patches
  patchList.forEach(async file => {
    console.info(`* apply patch ${file}`)
    let data
    let targetFile
    let terms

    try {
      data = fs.readFileSync(path.join(sourceDir, file), {encoding: 'utf-8'})
      data = JSON.parse(data)

      assert(data.file, 'missing patch.file attribute')
      targetFile = path.join(targetDir, data.file)
      assert(fs.existsSync(targetFile), `missing target file ${targetFile}`)

      assert(data.replace, 'missing patch.replace attribute')
      assert(data.replace.length > 0, 'missing patch.replace content')
      terms = data.replace
    } catch (err) {
      console.error(`invalid patch file ${file}`, err)
      return
    }

    for (var i = 0; i < terms.length; i++) {
      let {search, replace} = terms[i]
      // console.log(search, replace)

      const m = /\$\((.*)\)/.exec(replace)
      if (m) {
        replace = eval(m[1])
      }

      console.log(`* replace ${search} with ${replace} within ${data.file}`)
      try {
        await regexReplace(search, replace, targetFile, {
          filenamesOnly: false,
          fileContentsOnly: true
        })
      } catch (err) {
        console.error('err > regexReplace', err)
      }
    }
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
