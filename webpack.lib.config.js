const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    externals: {
        'mapbox-gl': {
            commonjs: 'mapbox-gl',
            commonjs2: 'mapbox-gl',
            amd: 'mapbox-gl',
            root: 'mapboxgl'
        },
        '@mapbox/mapbox-gl-draw': {
            commonjs: '@mapbox/mapbox-gl-draw',
            commonjs2: '@mapbox/mapbox-gl-draw',
            amd: '@mapbox/mapbox-gl-draw',
            root: 'MapboxDraw'
        }
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
        new MiniCssExtractPlugin({
            filename: 'index.css'
        }),
    ],
    resolve: {
        fallback: {
            fs: false
        }
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'mapboxglFeatureInfo',
            type: 'umd'
        },
        globalObject: 'this',
        clean: true
    },
};
