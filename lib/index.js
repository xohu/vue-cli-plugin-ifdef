const semver = require('semver')
const resolve = path => require.resolve(path)

module.exports = function (config, options) {
    options = (options.pluginOptions && options.pluginOptions.ifdefConfig) || {}

    if (options.context && Object.keys(options.context).length) {
        const { check = true, log = false, css = check, js = check, html = check, file = check } = { ...options }
        
        js && config.module.rule('js').use('ifdef-loader-jsx').loader(resolve('./run')).options({ type: 'js', ...options })
        html && config.module.rule('ifdef-loader-html').resourceQuery(/vue&type=template/).use('ifdef-loader-html').loader(resolve('./run')).options({ type: 'html', ...options })
        js && config.module.rule('ifdef-loader-js').resourceQuery(/vue&type=script/).use('ifdef-loader-js').loader(resolve('./run')).options({ type: 'js', ...options })

        if (css) {
            const loaders = {
                'scss': 'sass-loader',
                'sass': 'sass-loader',
                'less': 'less-loader',
                'stylus': 'stylus-loader'
            }

            const cssLang = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']
            const cssTypes = ['vue-modules', 'vue', 'normal-modules', 'normal']
            const cssPreprocessOptions = { type: 'css', ...options }

            cssLang.forEach(lang => {
                const langRule = config.module.rule(lang)

                const loader = loaders[lang]
                cssTypes.forEach(type => {
                    langRule.oneOf(type).use(`ifdef-preprocss`).loader(resolve('./run')).options(cssPreprocessOptions).before('css-loader') // 在 css-loader 之后条件编译一次，避免 import 进来的 css 没有走条件编译

                    // 在 scss,less,stylus 之前先条件编译一次
                    if (loader) {
                        langRule.oneOf(type).use(`ifdef-preprocss-` + lang).loader(resolve('./run')).options(cssPreprocessOptions).after(loader)
                    }
                })
            })

            let sassLoaderVersion
            try {
                sassLoaderVersion = semver.major(require('sass-loader/package.json').version);
            } catch (e) { }

            if (sassLoaderVersion >= 8) {
                cssTypes.forEach(type => {
                    config.module.rule('sass').oneOf(type).use('sass-loader').tap(options => {
                        if (options.indentedSyntax) {
                            if (!options.sassOptions) {
                                options.sassOptions = {}
                            }
                            options.sassOptions.indentedSyntax = true
                            delete options.indentedSyntax
                        }
                        return options
                    })
                })
            }
        }

        file && config.plugin('copy').tap(args => {
            if (args[0].length) {
                const { context } = options;

                Object.keys(context).forEach(platform => {
                    !context[platform] && args[0][0].ignore.push(`**/${platform}/**/*`)
                })
            }

            return args
        })

        config.module.rule('vue').use('vue-loader').tap(args => {
            Object.assign(args, { cacheDirectory: false, cacheIdentifier: false })

            return args
        })

        config.module.rule('js').uses.delete('cache-loader')
        config.module.rule('vue').uses.delete('cache-loader')
    }
}