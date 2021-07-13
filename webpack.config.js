const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
	entry: {
        init: '/assets/js/init.js'
    },
	mode: "development",
	output: {
		path: `${__dirname}/public/static/v1`,
		filename: "[name].js",
		environment: {
			arrowFunction: false
		}
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css',
		})
	],
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
			{
				test: /\.(svg|gif|png|eot|woff|ttf)$/,
				use: ["url-loader"],
			},
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
		],
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
		},
		minimize: true,
		minimizer: [
			// new TerserPlugin({
			// 	extractComments: false,
			// }),
			new UglifyJsPlugin({
				test: /\.js(\?.*)?$/i,
				sourceMap: true,
                extractComments: true,
			}),
			new OptimizeCssAssetsPlugin(),
		],
	},
};