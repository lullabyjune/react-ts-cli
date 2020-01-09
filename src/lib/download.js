const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')

const downloadGitrRepo = (filePath) => {
  filePath = path.join(filePath || '.', '.download-temp')

  return new Promise((resolve, reject) => {
    const url = 'https://github.com:lullabyjune/template-for-cli#master'
    const spinner = ora(`is downloading project template... template url is: ${url}`)

    spinner.start()

    download(url, filePath, {clone: true}, err => {
      if (err) {
        spinner.fail()
        
        reject(err)
      }
      spinner.succeed()

      resolve(filePath)
    })
  })
}

module.exports = {
  downloadGitrRepo
}