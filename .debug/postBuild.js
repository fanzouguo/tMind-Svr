const shelljs = require('shelljs');
const inquirer = require('inquirer');
const fs = require('fs-extra');

const frm = (str, len = 2) => {
	return `${str}`.padStart(len, '0');
};

const getDate = () => {
	const _dt = new Date();
	const _y = _dt.getFullYear();
	const _m = frm(_dt.getMonth() + 1);
	const _d = frm(_dt.getDate());
	const _hh = frm(_dt.getHours());
	const _mi = frm(_dt.getMinutes());
	const _ss = frm(_dt.getSeconds());
	return `${_y}-${_m}-${_d} ${_hh}:${_mi}:${_ss}`;
};

const getGitCmd = (memo, pkg, tagThis = false, branch = 'main') => {
	let urlStr = (pkg && pkg.repository && (pkg.repository.url || '')) || '';
	const _arr = ['git add .'];

	if (tagThis) {
		_arr.push(`git tag -a v${pkg.version} -m "${memo}"`);
	}
	_arr.push(`git commit -m "(${getDate()})${memo}"`);

	if (tagThis) {
		_arr.push('git push origin --tags');
	}

	if (urlStr) {
		_arr.push(`git push -u origin ${branch}`);
	}
	const missPrivateDef = (typeof pkg.private === undefined);
	const allowPublish = (!missPrivateDef && !pkg.private);
	if (missPrivateDef) {
		console.log('项目的 package.json 未指定 private 字段，若需要提交 NPM，请先配置该字段');
	} else {
		if (allowPublish) {
			// _arr.push('npm login');
			// _arr.push('npm publish');
			console.log('请输入 npm publish 开始发布');
		} else {
			console.log('项目的 package.json 中 private 字段已申明为： false，该项目不允许发布到 npm.');
		}
	}
	return _arr;
};

const execBuild = (async () => {
	const { commitMemo } = await inquirer.prompt({
		type: 'input',
		message: '请输入提交备注',
		name: 'commitMemo',
	});
	const { tagThis } = await inquirer.prompt({
		type: 'confirm',
		message: '是否忽略创建 tag 标签',
		name: 'tagThis'
	});
	const _arr = getGitCmd(commitMemo, pkg, !tagThis);
	for (const v of _arr) {
		shelljs.exec(v);
		// console.log(v);
	}
})();
