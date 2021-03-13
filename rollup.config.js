// @ts-nocheck
	import resolve from 'rollup-plugin-node-resolve';
	import babelPlugin from 'rollup-plugin-babel';
	import commonjs from 'rollup-plugin-commonjs';
	import jsonPlugin from '@rollup/plugin-json';
	import { terser } from 'rollup-plugin-terser';
	const { getCurrPath } = require('./lib/util/getPath');
	const { getFromat } = require('./lib/util/getDate');
	const isProd = (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production');

	const banner = `/*!
	* tMind-Cli v1.0.0
	* (c) 2021-2022  Smpoo soft Co. Shanghai China
	* Released under the MIT License.
	* Author: David
	* CreateDate: 2021-03-05
	* LastBuild: ${getFromat('yyyy-mm-dd hh:mi:ss.ms')}
	*/`;

	const outForlder = isProd ? ['lib'] : ['.debug', 'tryNow', 'lib'];

	const _objConf = {
		// 入口文件
		input: getCurrPath('dist', 'index.js'),
		// 出口文件
		output: {
			file: getCurrPath(...outForlder, 'index.js'),
			format: 'umd',
			name: 'tmind',
			banner
		},
		// // 作用：指出应将哪些模块视为外部模块，否则会被打包进最终的代码里
		external: [
			'inquirer',
			'fs-exta',
			'glob-all'
		]
	};

	if (isProd) {
		_objConf.plugins = [
			commonjs(),
			resolve({
				customResolveOptions: {
					moduleDirectory: 'node_modules'
				}
			}),
			jsonPlugin(),
			terser()
		];
	} else {
		_objConf.plugins = [
			commonjs(),
			resolve({
				customResolveOptions: {
					moduleDirectory: 'node_modules'
				}
			}),
			babelPlugin({
				// 只编译源码
				exclude: 'node_modules/**'
			}),
			jsonPlugin()
			// 使用开发服务插件
			// serve({
			// 	port: 3000,
			// 	// 设置 exmaple的访问目录和dist的访问目录
			// 	contentBase: [getCurrPath('.debug', 'tryNow'), getCurrPath(...outForlder)]
			// })
		];
	}

	export default _objConf;
