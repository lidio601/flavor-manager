
const path = require('path')
const scandir = require('scandir')

/**
 * @export
 * @param {String} baseDir
 * @returns {Promise<String[]>}
 */
exports.scan = baseDir =>
  new Promise((resolve, reject) => {
    try {
      let result = []

      const s = scandir.create()

      s.on('error', err =>
        console.error('scandir :: error', err))

      s.on('file', file => {
        const rFile = path.relative(baseDir, file)

        result.push(rFile)
      })

      s.on('end', () =>
        resolve(result))

      s.scan({
        dir: baseDir,
        recursive: true,
        filter: /.*/
      })
    } catch (err) {
      reject(err)
    }
  })
