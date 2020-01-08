const fs = require('fs')
const path = require('path')
const glob = require('glob')

const { isDirectory } = require('./is-directory')

const copyR = (dir, to) => {
  const list = glob.sync(`${dir}/*`, {
    dot: true
  })

  for (let name of list) {
    let lastPath = name.split('/').pop()
    let nextTo = path.join(to, lastPath)

    if (isDirectory(name)) {
      fs.mkdirSync(nextTo)
      copyR(name, nextTo)

      continue
    }

    fs.copyFileSync(name, nextTo)
    fs.unlinkSync(name)
  }

  fs.rmdirSync(dir)
}

module.exports = {
  copyR
}