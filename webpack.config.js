const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const path = require('path');


module.exports = (env, options) => {

    const mode = options.mode;

    return {
        entry: './src/main.ts',
        output: {
            path: path.join(__dirname, 'dist'),
            filename: '[name].[contenthash].js',
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                            {
                                loader: "babel-loader"
                            },
                            {
                                loader: 'angular1-templateurl-loader',
                            }
                    ]
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader"
                        }

                    ]
                },
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, "css-loader"]
                },
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader:"ts-loader"
                        },
                        {
                            loader: 'angular2-template-loader',
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        "style-loader", // creates style nodes from JS strings
                        "css-loader", // translates CSS into CommonJS
                        "sass-loader" // compiles Sass to CSS, using Node Sass by default
                     ]
                },
                {
                    test: /\.less$/,
                    use: [
                        "style-loader", // creates style nodes from JS strings
                        "css-loader", // translates CSS into CommonJS
                        "less-loader" // compiles Less to CSS, using Node Less by default
                    ]
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [
                        'file-loader',
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                disable: true, // webpack@2.x and newer
                            },
                        },
                    ],
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
                    loader: 'file-loader',
                    options: {
                        outputPath: 'fonts',
                    }
                }
            ]
        },
        resolve:{
            extensions: [".ts", ".js"],
            alias: {
                "@angular/upgrade/static": "@angular/upgrade/bundles/upgrade-static.umd.js"
            }
        },
        plugins: [
            new CleanWebpackPlugin(['dist']),


            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery'
            }),

            new webpack.DefinePlugin({
                'applicationMode': JSON.stringify(mode)
            }),

            new HtmlWebPackPlugin({
                template: "./src/index.html",
                filename: "./index.html"
            }),
            new MiniCssExtractPlugin({
                filename: "[name].[contenthash].css",
                chunkFilename: "[id].css"
            }),
            new CopyWebpackPlugin([
                {
                    from: './src/config.js',
                    to: '.'
                },
                {
                    from: './src/style/theme.css',
                    to: '.'
                },
                {
                    from: './src/favicon.ico',
                    to: '.'
                },
                {
                    from: './src/style/jointjs/joint.css',
                    to: './jointjs/'
                },
                {
                    from: './src/js/jointjs/joint-min.js',
                    to: './jointjs/'
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: './src/web.config',
                    to: '.'
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: 'src/images',
                    to: 'images'
                }
            ])
        ]
    }
};



