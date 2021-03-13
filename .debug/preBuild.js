const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const pkg = fs.readJsonSync('./package.json');

const resetVer = (async () => {
	const getDate = () => {
		const frm = (str, len = 2) => {
			return `${str}`.padStart(len, '0');
		};

		const _dt = new Date();
		const _y = _dt.getFullYear();
		const _m = frm(_dt.getMonth() + 1);
		const _d = frm(_dt.getDate());
		const _hh = frm(_dt.getHours());
		const _mi = frm(_dt.getMinutes());
		const _ss = frm(_dt.getSeconds());
		const _sss = frm(_dt.getMilliseconds());
		return `${_y}-${_m}-${_d} ${_hh}:${_mi}:${_ss}.${_sss}`;
	};

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
	pkg.lastBuild = getDate();
	fs.writeFileSync(path.resolve(process.cwd(), 'package.json'), JSON.stringify(pkg, null, 2));
	console.clear();
	console.log(`本次构建版本号为：${pkg.version}`);
})();
