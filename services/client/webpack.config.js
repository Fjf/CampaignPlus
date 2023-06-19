const path = require('path');

module.exports = {
    watch: true,
    entry: './src/index.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, "public/static"),
        publicPath: '/static/',
        filename: "index.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }, {
                // test: /\.(png|svg|jpe?g|gif|ico)$/,
                // use: [
                //     'file-loader?name=./images/[name].[ext]'
                // ],
                // options: {
                //     outputPath: './images/',
                //     name: '[name].[ext]'
                // }
            // }, {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            }, {
                test: /\.css$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                ],
            }, {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    }
};