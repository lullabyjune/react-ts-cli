const fs = require('fs')
const path = require('path')
const glob = require('glob')

const { isDirectory, rmDirectory } = require('./directory-utils')

const copyR = (dir, to, igonreList) => {
  const list = glob.sync(`${dir}/*`, {
    dot: true
  })

  for (let name of list) {
    let lastPath = name.split('/').pop()
    let nextTo = path.join(to, lastPath)

    if (igonreList.includes(name)) {
      rmDirectory(name)

      continue
    }

    if (isDirectory(name)) {
      fs.mkdirSync(nextTo)

      copyR(name, nextTo, igonreList)

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