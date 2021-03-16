// @ts-nocheck
/* eslint-disable */
const resolve = require('rollup-plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const dts = require('rollup-plugin-dts').default;
// const commonjs = require('rollup-plugin-commonjs');
// const jsonPlugin = require('@rollup/plugin-json');
const pkg = require('./package.json');

const { getPathSpec } = require('./.debug/getPath');
const getDate = require('./.debug/getDate');
const basePath = process.cwd();

const banner = `/*!
* tMind-Cli v1.0.0
* (c) 2021-2022  Smpoo soft Co. Shanghai China
* Released under the MIT License.
* Author: David
* CreateDate: 2021-03-05
* LastBuild: ${getDate()}
*/`;

export default [{
	// 入口文件
	// input: getPathSpec(basePath, 'src/index.ts'),
	input: getPathSpec(basePath, '.debug/dist/index.js'),
	// 出口文件
	output: {
		// file: getPathSpec(basePath, 'lib', 'index.js'),
		file: getPathSpec(basePath, pkg.main),
		format: 'commonjs',
		name: 'Tmind',
		banner
	},
	// // 作用：指出应将哪些模块视为外部模块，否则会被打包进最终的代码里
	external: [],
	plugins: [
		babel({
			exclude: 'node_modules/**',
			babelHelpers: 'bundled'
		}),
		// commonjs(),
		resolve({
			customResolveOptions: {
				moduleDirectory: 'node_modules'
			}
		}),
		// jsonPlugin(),
		terser()
	]
},
// 生成 .d.ts 类型声明文件
{
	// input: getPathSpec(basePath, 'src/index.ts'),
	input: getPathSpec(basePath, '.debug/dist/index.js'),
	output: {
		file: getPathSpec(basePath, pkg.typings),
		// format: 'es'
		format: 'commonjs'
	},
	plugins: [dts()]
}];
