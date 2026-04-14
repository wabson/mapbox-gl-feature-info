const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: 'development',
    entry: {
        'demo': './demo/index.js'
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 8080
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    plugins: [
        new Dotenv({ systemvars: true }),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            // inject: false,
            title: 'Mapbox GL JS Draw Feature Info',
            // bodyHtmlSnippet: '<div id="map"></div>',
        })
    ],
    ignoreWarnings: [
        {
            module: /mapbox-gl/,
            message: /Critical dependency: the request of a dependency is an expression/
        }
    ],
    resolve: {
        fallback: {
            fs: false
        }
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'public'),
        library: 'mapboxglFeatureInfo',
        libraryTarget: 'global',
        clean: true
    },
};
