const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    /**
     * 官方建议
     * development: cheap-module-eval-source-map
     * product: cheap-module-source-map
     */
    devtool: "cheap-module-source-map",

    // externals: {
    //     "react": 'react',
    //     "react-dom": 'react-dom',
    //     "react-router": 'react-router',
    //     "lodash": "lodash",
    //     "echarts": "echarts"
    // },
    
    /**
     * 如果是字符串，output输出的名字是 ‘main’
     * 如果是object，output输出的名字是 key的名称
     */
    entry: {
        app: './src/index.js',
        print: './src/print.js',
        vendor: ['react', 'react-redux', 'react-dom', 'lodash']
    },
    /**
     * [name]     : 使用入口名称
     * [id]       : 使用内部 chunk id
     * [hash]     : 使用每次构建过程中，唯一的 hash 生成
     * [chunkhash]: 使用基于每个 chunk 内容的 hash
     * 
     * [hash] 和 [chunkhash] 的长度可以使用 [hash:16]（默认为20）来指定。
     * 或者，通过指定output.hashDigestLength 在全局配置长度。
     */
    output: {
        /**
         * filename:每个输出 bundle 的名称 -- 相对路径
         */
        filename: 'js/[name].[hash:8].bundle.js',
        /**
         * path: 存放bundle的目录路径
         */
        path: path.resolve(__dirname, 'dist'),
        /**
         * chunkFilename:按需加载的文件命名 -- 相对路径
         */
        chunkFilename: 'js/[name].[chunkhash:6].chunk.js',
        /**
         * 指定output directory在浏览器中的url
         */
        publicPath: '/',
        /**
         * 指定编译产生的'.map'文件的存放位置
         * [file] 原始文件的文件名 eg: css文件产生的.map 原始文件名为 ExtractTextPlugin 中的filename
         * 
         * 建议只使用 [file] 占位符，因为其他占位符在非 chunk 文件生成的 SourceMap 时不起作用
         */
        sourceMapFilename: "sourceMap/[file].map"
    },

    resolve: {
        /**
         * 创建 import 或 require 的别名，来确保模块引入变得更简单
         */
        alias: {
            src: path.resolve(__dirname, 'src')
        },
        /**
         * 自动解析确定的扩展,能够使用户在引入模块时不带扩展
         */
        extensions: ['.js', '.json'],
        /**
         * 解析目录时要使用的文件名??
         */
        mainFiles: ['index'],
        /**
         * 告诉 webpack 解析模块时应该搜索的目录。
         * node_modules 为默认，如果不设置，会报代码中找不到引用的第三方库
         * eg:Error: Can't resolve 'lodash' in 'F:\workspace\test\webpackTest\webpackDemo1\src'
         */
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        /**
         * 在解析模块（例如，loader）时尝试使用的扩展
         * 如果想要不带 -loader 后缀使用 loader，可使用如下配置
         */
        moduleExtensions: ['-loader']
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                  fallback: "style-loader",
                  use: "css-loader"
                })
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,           //大于8192字节的图片正常打包，小于8192字节的图片以 base64 的方式引用，
                            // name: 'imgs/[name]',
                        }
                    }
                ]
            }
        ]
    },

    plugins: [
        /**
         * 默认生成 index.html 文件,将原先的index.html文件替换掉
         */
        new HtmlWebpackPlugin({
            title: 'Output Management111',
            template: path.resolve(__dirname, './src/index.tpl.html'),
        }),
        /**
         * 在每次构建前清理 /dist 文件夹
         */
        new CleanWebpackPlugin(['dist'],  {
            exclude: [
                'lib.js',
                'manifest.json',
            ]
        }),
        /**
         * 启用 HMR
         */
        new webpack.HotModuleReplacementPlugin(),
        /**
         * 压缩文件
         * 注：不同的sourceMap会导致压缩后的文件大小不同
         */
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: this.devtool && (this.devtool.indexOf("sourcemap") >= 0 || this.devtool.indexOf("source-map") >= 0)
        }),
        /**
         * 查找和替换 ‘process.env.NODE_ENV’
         * 注：在webpack.config.js中无效
         */
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        /**
         * 将多个入口起点之间共享的公共模块，生成为一些 chunk，
         * 并且分离到单独的 bundle 中,避免重复打包。
         * 在最开始的时候加载，并放入到缓存中，其他页面访问时，就不需要重新加载。
         * 注：这个公共模块如果太大，会导致首屏渲染时间变长
         */
        new webpack.optimize.CommonsChunkPlugin({
            names: ['common'],
            chunks: ['app', 'print']
        }),
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest'],
            chunks: ['vendor']
        }),
        /**
         * 将所有的入口 chunk(entry chunks)中引用的 *.css，移动到独立分离的 CSS 文件
         * 多个入口情况：
         *   1.多个入口有公用的部分，且有CommonsChunkPlugin插件，会分离到common的css文件中
         *   2.不是公共的部分（import 后必须要在应用才有效）会根据 入口文件 来分离到相应的[name].css 文件中
         *   3.多个入口 文件名字需要用 [name] 来设置
         * 
         * filename: 文件名称 -- 相对路径
         * 可以用 [contenthash] 来获取提取文件的 hash
         * （既不是 [hash] 也不是 [chunkhash]）
         */
        new ExtractTextPlugin({
            filename: "css/initial.[name].[contenthash:6].css"
        }),

        // new webpack.DllReferencePlugin({
		// 	context: path.resolve(__dirname, 'dist'),
		// 	manifest: './dist/manifest.json',
		// }),
    ],
    devServer: {
        /**
         * 告诉 dev-server 我们在使用 HMR
         */
        hot: true,
        contentBase: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        compress: true
    }
};