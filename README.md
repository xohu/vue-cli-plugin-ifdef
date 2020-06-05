# @xohu/vue-cli-plugin-ifdef
> 此插件剥离自 uni-app，并加以改造以适应 vue-cli，更多使用详情请参考 [uni-app 官网](https://uniapp.dcloud.io/platform?id=%e6%9d%a1%e4%bb%b6%e7%bc%96%e8%af%91 "demo")

> vue-cli3 的条件编译插件

 **安装**

 ```
  vue add @xohu/ifdef
  or
  npm install @xohu/vue-cli-plugin-ifdef -D
  or
  cnpm install @xohu/vue-cli-plugin-ifdef -D
  ```

  ## 配置
可以通过 `vue.config.js` > `pluginOptions.ifdefConfig` 进行配置

``` js
// vue.config.js
module.exports = {
  pluginOptions: {
       // 以下列出了需要条件编译去验证的自定义模块
       // true：开启条件，false：关闭条件
       ifdefConfig: {
           page1: true,
           page2: true,
           page3: false,
           admin: process.env.VUE_APP_CLIENT == 'admin'
      }
   }
}
```

## 支持的文件
- `.vue`
- `.js`
- `.css`
- `各预编译语言文件，如：.scss、.less、.stylus`
```
-- 不同语法中的注释，请严格区分使用

js            使用 // 注释
css           使用 /* 注释 */
vue template  使用 <!-- 注释 -->

-- js 
// #ifdef PLATFORM
内容
// #endif

-- css 
/* #ifdef PLATFORM */
内容
/* #endif */

-- vue template 
<!-- #ifdef PLATFORM -->
内容
<!-- #endif -->
```

## 注意事项
```
使用此插件时，请检查是否有其它插件过滤掉了注释，因为条件编译的判断条件是需要注释去实现的
```
