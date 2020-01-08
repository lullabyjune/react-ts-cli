const fs = require('fs')
const glob = require('glob')

const isDirectory = (path) => fs.statSync(path).isDirectory()

const rmDirectory = (dir) => {
  if (isDirectory(dir)) {
    const list = glob.sync(`${dir}/*`)

    for (let path of list) {
      rmDirectory(path)
    }

    fs.rmdirSync(dir)

    return
  }

  fs.unlinkSync(dir)
}

module.exports = {
  isDirectory,
  rmDirectory
}