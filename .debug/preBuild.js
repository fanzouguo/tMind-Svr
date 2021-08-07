// import inquirer from 'inquirer';
// import fs from 'fs-extra';
// import path from 'path';
// import tmind from 'tmind-core';

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const pkg = fs.readJsonSync('./package.json');
const { tDate } = require('tmind-core');

const resetVer = (async () => {
	const VER_POLICY = {
		major: 0,
		minor: 1,
		build: 2
	};

	const { verPolicy } = await inquirer.prompt([{
		name: 'verPolicy',
		type: 'list',
		message: '请选择版本更新策略',
		default: 'build',
		choices: [
			'major',
			'minor',
			'build'
		],
		filter(val) {
			return val.toLowerCase();
		}
	}]);

	const _offset = VER_POLICY[verPolicy];
	const _arr = (pkg.version || '1.0.0').split('.').map((v, k) => {
		if (k === _offset) {
			v = parseInt(v) + 1;
			return v;
		} else {
			return v || '0';
		}
	});
	pkg.version = _arr.join('.');
	pkg.lastBuild = tDate().format('YYYY-MM-DD hh:mi:ss.ms');
	fs.writeFileSync(path.resolve(process.cwd(), 'package.json'), JSON.stringify(pkg, null, 2));
	console.clear();
	console.log(`本次构建版本号为：${pkg.version}`);
})();
