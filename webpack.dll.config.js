const webpack = require('webpack');
const path = require('path');

const vendors = [
	'react',
	'react-dom',
	'react-router',
	'lodash',
	'echarts'
	// ...其它库
];

module.exports = {
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		library: '[name]',
	},
	entry: {
		"lib": vendors
	},
	plugins: [
		new webpack.DllPlugin({
			path: './dist/manifest.json',
			name: '[name]',
			context: path.resolve(__dirname, 'dist'),
		}),
	],
};