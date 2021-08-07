module.exports = {
	presets: [
		['@babel/preset-env', {
			targets: {node: 'current'},
			modules: false
		}]
	],
	plugins: [
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-proposal-class-properties'
	]
};
