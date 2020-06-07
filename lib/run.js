const path = require('path')
const semver = require('semver')
const utils = require('loader-utils')
const { writeFile } = require('../utils')

const isWin = /^win/.test(process.platform)
const normalizePath = path => (isWin ? path.replace(/\\/g, '/') : path)

const preprocessor = require('./preprocess')

const outputLog = function (resourcePath, type) {
  let logs = {};
  try {
    logs = require(path.resolve(process.cwd(), './ifdef'))
  } catch (e) { }

  logs = Object.assign(logs, { [resourcePath]: type })
  writeFile(path.join(process.cwd(), './'), 'ifdef.json', JSON.stringify(logs, null, 4))
}

const ERRORS = {
  'html': `条件编译失败,参考示例(注意 ifdef 与 endif 必须配对使用):
<!--  #ifdef  %PLATFORM% -->
模板代码
<!--  #endif -->
`,
  'js': `条件编译失败,参考示例(注意 ifdef 与 endif 必须配对使用):
// #ifdef  %PLATFORM%
js代码
// #endif
`,
  'css': `条件编译失败,参考示例(注意 ifdef 与 endif 必须配对使用):
/*  #ifdef  %PLATFORM%  */
css代码
/*  #endif  */
`
}

const TAGS = {
  'html': 'template',
  'js': 'script',
  'css': 'style'
}

module.exports = function (content, map) {
  this.cacheable && this.cacheable()

  let { type, log, context } = utils.getOptions(this) || {}

  let types = type

  const resourcePath = this.resourcePath

  if (!Array.isArray(types)) {
    types = [types]
  }

  log && outputLog(resourcePath, type)

  types.forEach(type => {
    try {
      content = preprocessor.preprocess(content, context, {
        type
      })
    } catch (e) {
      if (~['.vue'].indexOf(path.extname(resourcePath))) {
        console.error(`${TAGS[type]}节点 ${ERRORS[type]} at ` + normalizePath(path.relative(resourcePath)) + ':1')
      } else {
        console.error(`${ERRORS[type]} at ` + normalizePath(path.relative(resourcePath)) + ':1')
      }
    }
  })
  this.callback(null, content, map)
}
