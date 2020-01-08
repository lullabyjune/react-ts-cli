const fs = require('fs')

const isDirectory = (path) => fs.statSync(path).isDirectory()

module.exports = {
  isDirectory
}