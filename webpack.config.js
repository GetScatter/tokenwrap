const path = require('path');
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const fs = require('fs');


const getPackagePath = x => `./packages/${x}/lib/${x}.js`;
const PACKAGE_NAMES = fs.readdirSync('./packages');
const entry = PACKAGE_NAMES.reduce((o, file) => Object.assign(o, {[`${file}.min.js`]: getPackagePath(file)}), {});

module.exports = {
	entry,
	output: {
		path: path.resolve(__dirname, './bundles'),
		filename: '@tokenwrap/[name]'
	},
	resolve: {
		modules:[ "node_modules" ]
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env'
						],
						plugins:[
							'@babel/plugin-transform-runtime'
						]
					}
				},
				exclude: /node_modules/
			}
		],
	},
	plugins: [
		// new UglifyJsPlugin()
	],
	stats: { colors: true },
	devtool: false,
	// devtool: 'inline-source-map',
	externals: {
		'@tokenwrap/core': 'TokenWrap'
	}
}