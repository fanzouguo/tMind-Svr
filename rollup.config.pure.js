const {
	outputConf,
	isProd,
	banner,
	baseConfTs
} = require('./rollup.base') ;
const { terser } = require('rollup-plugin-terser');

const TsConf = outputConf.map(v => {
	if (isProd) {
		baseConfTs.plugins.push(terser());
		v.banner = banner;
	}
	return Object.assign({}, baseConfTs, {
		output: {
			name: 'tmindSvr',
			...v
		}
	});
});

export default TsConf;
