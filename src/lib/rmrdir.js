
const fs = require('fs')
const path = require('path')

function rmrdir (dirname) {
  if (fs.existsSync(dirname)) {
    fs.readdirSync(dirname).forEach(file => {
      const curPath = path.join(dirname, file)

      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        return rmrdir(curPath)
      }

      // delete file
      fs.unlinkSync(curPath)
    })

    // finally delete this folder
    fs.rmdirSync(dirname)
  }
}

module.exports = {
  rmrdir
}
