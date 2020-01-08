#!/usr/bin/env node

const Commander = require('commander')
const path = require('path')
const glob = require('glob')
const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

const { isDirectory, copyR, downloadGitrRepo: download, generatorPackageJson } = require('../lib')

Commander
  .option('-y --yes', 'init prompt by default')
  .option('-r --router', 'init react-router')
  //  TODO: add router

Commander.usage('<project-name>').parse(process.argv)
Commander.parse(process.argv)

let { yes } = Commander

let projectName = Commander.args[0]

if (!projectName) {
  inquirer.prompt([
    {
      name: 'projectName',
      message: 'please enter project name'
    }
  ]).then(ans => {
    projectName = ans.projectName

    init()
  })
}

const hasSameProject = (files, filename) => {
  let filterdFiles = files.filter(file => {
    const name = path.resolve(process.cwd(), path.join('.', file))

    const isDir = isDirectory(name)

    return file.indexOf(filename) !== -1 && isDir
  })

  return filterdFiles.length !== 0
}

const promptDetails = () => {
  return new Promise((resolve, reject) => {
    if (yes) {
      resolve({
        projectVersion: '1.0.0',
        projectDescription: 'a react + typescript project',
      })

      return
    }

    inquirer.prompt([
      {
        name: 'projectVersion',
        message: 'the version of your project',
        default: '1.0.0'
      }, {
        name: 'projectDescription',
        message: 'description for your project',
        default: 'a react + typescript project...'
      }
    ]).then(ans => resolve({...ans}))
      .catch(reject)
  })
}

const initDir = (dir) => {
  promptDetails()
    .then(ans => {
      console.info('\nhere is some details of your project...\n')
      console.info(`projectName: ${projectName}`)

      for (let item of Object.keys(ans)) {
        console.info(`${item}: ${ans[item]}`)
      }

      console.info()

      download(dir)
        .then(file => {
          let downloadPath = path.resolve(process.cwd(), path.join('.', file))
          let targetPath = path.resolve(process.cwd(), path.join('.', dir))
          
          const spinnerCopy = ora('is copying template files to local...')

          try {
            spinnerCopy.start()

            copyR(downloadPath, targetPath)

            spinnerCopy.succeed()
          } catch (e) {
            spinnerCopy.fail(e.message)

            console.error(logSymbols.error, chalk.red(`copy files failed... ${e.message}`))

            return;
          }

          const spinnerGenerator = ora('is generating your package.json and html...')

          try {
            spinnerGenerator.start()

            generatorPackageJson(path.join('.', dir), {...ans, projectName}, path.resolve(process.cwd(), path.join('.', dir)), ['package.json', 'public/index.html'])

            spinnerGenerator.succeed()
          } catch (e) {
            spinnerGenerator.fail(e.message)

            console.error(logSymbols.error, chalk.red(`generate package.json & index.html failed... ${e.message}`))

            return
          }

          console.info(logSymbols.success, chalk.green(`init ${projectName} success!`))
          console.info()

          console.info(chalk.green(`cd ${dir} \nnpm install --- to install package...\nnpm run dev --- to start dev-server on 3000...\nnpm run build --- to build project on /dist...`))
        })
        .catch(err => console.error(logSymbols.error, chalk.red(`downloading template failed... ${err.message}`)))
    })
  
}

const init = () => {
  const list = glob.sync('*')
  let dir = path.basename(process.cwd())

  if (list.length) {
    if (hasSameProject(list, projectName)) {
      console.error(`has same project already named ${projectName}`)

      return
    }

    dir = projectName
  } else if (dir === projectName) {
    dir = '.'
  } else {
    dir = projectName
  }

  initDir(dir)
}

projectName && init()