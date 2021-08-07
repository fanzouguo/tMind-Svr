module.exports = {
	presets: [
		['@babel/preset-env', {
			modules: false
		}]
	],
	plugins: [
		'@babel/plugin-transform-modules-commonjs',
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-proposal-class-properties'
	]
};
