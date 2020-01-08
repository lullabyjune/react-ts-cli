#!/usr/bin/env node

const Commander = require('commander')

Commander
  .command('init', 'init a new project')

Commander.parse(process.argv)

module.exports = {
  Commander
}