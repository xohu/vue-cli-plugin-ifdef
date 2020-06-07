const init = require('./lib')

module.exports = (api, options) => {
    api.chainWebpack(config => init(config, options))
}