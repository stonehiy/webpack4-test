//config/webpack.dev.js
// mac 权限问题 npm i --unsafe -perm
//当前应用安装 npm i --save-dev

const path = require("path")
//JS压缩.虽然uglifyjs是插件，但是webpack版本里默认已经集成，不需要再次安装
const uglify = require('uglifyjs-webpack-plugin');
//打包HTML文件
const htmlPlugin = require('html-webpack-plugin');
//css分离
const extractTextPlugin = require("extract-text-webpack-plugin");
//消除未使用的CSS
const glob = require('glob');
const PurifyCSSPlugin = require("purifycss-webpack");
// 清除文件 每次打包后，dist目录都有无用文件残留，最好每次打包前都清空dist目录
const {CleanWebpackPlugin} = require('clean-webpack-plugin');


var website = {
    publicPath: "http://localhost:8888/"
    // publicPath:"http://192.168.1.103:8888/"
}

module.exports = {
    //入口（一个或多个）
    entry: {
        //main:["other.js","./src/main.js"]//配置多页面的两种方法
        main: "./src/main.js",
        main2: "./src/main2.js", //这里新添加一个入口文件
    },
    //打包环境：development & production
    mode: "development",
    //出口只有一个
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "../dist"),
        publicPath: website.publicPath,  //publicPath：主要作用就是处理静态文件路径的。
    },
    //模块:例如解读css,图片如何转换，压缩
    module: {
        rules: [
            //css loader
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                }),
                // css分离后这里需要重新配置，下面就注释了
                // use:[
                //     {loader: "style-loader"},
                //     {loader:"css-loader"}
                // ]
            },
            //图片 loader
            {
                test: /\.(png|jpg|gif|jpeg)/,  //是匹配图片文件后缀名称
                use: [{
                    loader: 'url-loader', //是指定使用的loader和loader的配置参数
                    options: {
                        limit: 500, //是把小于500B的文件打成Base64的格式，写入JS
                        outputPath: 'images/',  //打包后的图片放到images文件夹下
                    }
                }]
            },
            {
                test: /\.(htm|html)$/i,
                use: ['html-withimg-loader']
            },
            //babel 配置
            {
                test: /\.(jsx|js)$/,
                use: {
                    loader: 'babel-loader',
                },
                exclude: /node_modules/
            }
        ]
    },
    //插件：用于生产模板h和各项功能
    plugins: [
        //js压缩
        new uglify(),
        //打包HTML文件
        new htmlPlugin({
            minify: { //是对html文件进行压缩
                removeAttributeQuotes: true  //removeAttrubuteQuotes是却掉属性的双引号。
            },
            hash: true, //为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
            template: "./src/index.html" //是要打包的html模版路径和文件名称。

        }),
        new extractTextPlugin("css/[name].css?[hash:8]"),
        new PurifyCSSPlugin({
            //这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了。
            paths: glob.sync(path.join(__dirname, '../src/*.html')),
        }),
        // 删除文件 保留新文件
        new CleanWebpackPlugin(),
    ],
    //配置webpack开发服务器
    devServer: {
        //设置基本目录结构
        contentBase: path.resolve(__dirname, "../dist"),
        //设置服务器的地址,可以使用ip或者localhost
        host: "localhost",
        //服务端压缩是否开启
        compress: true,
        //服务端口好
        port: "8888"
    }

}