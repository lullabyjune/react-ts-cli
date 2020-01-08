const metalsmith = require('metalsmith')
const handlebars = require('handlebars')

const generatorPackageJson = (src, metadata = {}, dest = '.', templateFiles) => {
  if (!src) {
    return Promise.reject(new Error(`invalid source as ${src}`))
  }

  return new Promise((resolve, reject) => {
    metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
      .use((files, metalsmith, done) => {
        const meta = metalsmith.metadata()

        for (let key of Object.keys(files)) {
          if (!templateFiles.includes(key)) continue

          const value = files[key].contents.toString()

          files[key].contents = Buffer.from(handlebars.compile(value)(meta))
        }

        done()
      }).build(err => {
        err ? reject(err) : resolve()
      })
  })
}

module.exports = {
  generatorPackageJson
}