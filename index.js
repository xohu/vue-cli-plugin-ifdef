const semver = require('semver')
const resolve = (path) => require.resolve(path)

module.exports = (api, options) => {
    options = (options.pluginOptions && options.pluginOptions.ifdefConfig) || {}
    options = {
        context: { ...options }
    }

    api.chainWebpack(config => {
        const loaders = {
            'scss': 'sass-loader',
            'sass': 'sass-loader',
            'less': 'less-loader',
            'stylus': 'stylus-loader'
        };

        const cssLang = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']
        const cssTypes = ['vue-modules', 'vue', 'normal-modules', 'normal']
        const cssPreprocessOptions = { type: 'css', ...options }

        cssLang.forEach(lang => {
            const langRule = config.module.rule(lang)

            const loader = loaders[lang]
            cssTypes.forEach(type => {
                langRule.oneOf(type).use(`ifdef-preprocss`).loader(resolve('./lib')).options(cssPreprocessOptions).before('css-loader') // 在 css-loader 之后条件编译一次，避免 import 进来的 css 没有走条件编译

                // 在 scss,less,stylus 之前先条件编译一次
                if (loader) { 
                    langRule.oneOf(type).use(`ifdef-preprocss-` + lang).loader(resolve('./lib')).options(cssPreprocessOptions).after(loader)
                }
            })
        });

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
            });
        }

        config.module.rule('js').use('ifdef-loader-jsx').loader(resolve('./lib')).options({ type: 'js', ...options });
        config.module.rule('ifdef-loader-html').resourceQuery(/vue&type=template/).use('ifdef-loader-html').loader(resolve('./lib')).options({ type: 'html', ...options });
        config.module.rule('ifdef-loader-js').resourceQuery(/vue&type=script/).use('ifdef-loader-js').loader(resolve('./lib')).options({ type: 'js', ...options });

        config.plugin('copy').tap(args => {
            if (args[0].length) {
                const { context } = options;

                Object.keys(context).forEach(platform => {
                    !context[platform] && args[0][0].ignore.push(`**/${platform}/**/*`)
                })
            }

            return args
        })
    })
}