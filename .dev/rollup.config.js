// @ts-nocheck
/* eslint-disable */
const { tDate } = require('tmind-core');
const { babel } = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const { PathMgr } = require('tmind-builder');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const tsPlugin = require('rollup-plugin-typescript2');

const pkg = require('../package.json');
const isProd = (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production');


const basePath = process.cwd();
const banner = `/*!
* ${pkg.name} v${pkg.version}
* (c) 2021-2022  Smpoo soft Co. Shanghai China
* Released under the MIT License.
* Author: ${pkg.author}
* CreateDate: ${pkg.createAt}
* LastBuild: ${tDate().format('YYYY-MM-DD hh:mi:ss')}
*/`;

const extensions = [
	'.js',
	'.ts'
];

// 通用插件组配置
const plugins = [
	babel({
		exclude: 'node_modules/**',
		babelHelpers: 'bundled'
	}),
	commonjs(),
	resolve({
		cwd: 'babelrc',
		customResolveOptions: {
			moduleDirectory: 'node_modules'
		}
	}),
	tsPlugin({
		// 导入本地ts配置
		tsconfig: PathMgr.getPath(basePath, 'src/tsconfig.json'),
		tsconfigOverride: {
			compilerOptions: {
				module: 'ESNext'
			}
		},
		extensions
	})
];

// 基础 TS文件 配置
const baseConfTs = {
	// 入口文件
	input: PathMgr.getPath(basePath, 'src/index.ts'),
	plugins,
	// // 作用：指出应将哪些模块视为外部模块，否则会被打包进最终的代码里
	external: [
		'mysql',
		'pg',
		'node-json-db',
		'tmind-core',
		'tmind-svr',
		'ws'
	]
};

const outputConf = [{
	// 通用模块使用
	file: pkg.main,
	format: 'umd'
}, {
	// ES模块使用
	file: pkg.module,
	format: 'es'
}];

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
