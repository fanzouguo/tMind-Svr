require('@babel/register')({
	presets: ['@babel/preset-env'],
	plugins: ['@babel/plugin-transform-runtime']
});

const app = require('../lib/app'); // eslint-disable-line
