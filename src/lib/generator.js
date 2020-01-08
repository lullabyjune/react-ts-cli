const metalsmith = require('metalsmith')
const handlebars = require('handlebars')
const latestVersion = require('latest-version')

const generateDeps = async (packageStr) => {
  try {
    const data = JSON.parse(packageStr)
    let { dependencies: deps, devDependencies: devDeps} = data

    const requests = []

    for (let [key, value] of Object.entries(deps)) {
      if (value === '' || value === 'false') {
        delete deps[key]
      }

      if (value === 'true') {
        requests.push(key)
      }
    }

    for (let [key, value] of Object.entries(devDeps)) {
      if (value === '' || value === 'false') {
        delete devDeps[key]
      }

      if (value === 'true') {
        requests.push(key)
      }
    }

    let versions = await Promise.all(requests.map(latestVersion))

    for (let [index, name] of requests.entries()) {
      if (deps[name] === 'true') {
        deps[name] = versions[index]
      } else {
        devDeps[name] = versions[index]
      }
    }

    return JSON.stringify(
      {
        ...data,
        dependencies: deps,
        devDependencies: devDeps
      }, null, 2
    )
  } catch (e) {
    throw new Error('unexpoected error in generate dependencies...')
  }
}

const generatorPackageJson = (src, metadata = {}, dest = '.', templateFiles) => {
  if (!src) {
    return Promise.reject(new Error(`invalid source as ${src}`))
  }

  return new Promise(async (resolve, reject) => {
    metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
      .use(async (files, metalsmith, done) => {
        const meta = metalsmith.metadata()

        for (let key of Object.keys(files)) {
          if (!templateFiles.includes(key)) continue

          const value = files[key].contents.toString()
          const compileStr = handlebars.compile(value)(meta)

          const contentStr = key === 'package.json' ? 
            await generateDeps(compileStr)
             : 
            compileStr
          
          files[key].contents = Buffer.from(contentStr)
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