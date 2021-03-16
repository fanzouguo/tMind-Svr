const shelljs = require('shelljs');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const pkg = fs.readJsonSync('./package.json');

const pathUser = process.env.HOME || process.env.USERPROFILE || '';
const color = {
  bold: ['\x1B[1m', '\x1B[22m'],
  blue: ['\x1B[34m', '\x1B[39m'],
  green: ['\x1B[32m', '\x1B[39m'],
  yellow: ['\x1B[33m', '\x1B[39m'],
  red: ['\x1B[31m', '\x1B[39m'],
  blueBG: ['\x1B[44m', '\x1B[49m'],
  greenBG: ['\x1B[42;30m', '\x1B[49m'],
  yellowBG: ['\x1B[43;30m', '\x1B[49m'],
  redBG: ['\x1B[41m', '\x1B[49m'],
  end: ['\x1B[0m']
};

const msgColor = {
  INFO: ['信息', color.blueBG[0], color.blueBG[1], color.blue[0], color.blue[1]],
  SUCC: ['成功', color.greenBG[0], color.greenBG[1], color.green[0], color.green[1]],
  WARN: ['警告', color.yellowBG[0], color.yellowBG[1], color.yellow[0], color.yellow[1]],
  ERR: ['错误', color.redBG[0], color.redBG[1], color.red[0], color.red[1]]
};

const msgFunc = {
  INFO: console.log, // eslint-disable-line
  SUCC: console.log, // eslint-disable-line
  WARN: console.warn, // eslint-disable-line
  ERR: console.error // eslint-disable-line
};

const echo = (msg, title, type) => {
  const _func = msgFunc[type] || null;
  if (_func && typeof _func === 'function') {
    const [a, b, c, d, e] = msgColor[type] || ['', '', '', '', ''];
    _func(`${b} ${title || a} ${c} ${d} ${msg} ${e}`);
  }
};

const echoLine = () => console.log('\n----------------------------------------------------------------------------\n');

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
	const urlStr = (pkg && pkg.repository && (pkg.repository.url || '')) || '';
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
	return _arr;
};

// 1、提交gitHub
const pushToGithub = async () => {
	echo('准备提交 GITHUB', '步骤1', 'INFO');
	try {
		const { commitMemo } = await inquirer.prompt({
			type: 'input',
			message: '请输入提交备注',
			name: 'commitMemo'
		});
		const { tagThis } = await inquirer.prompt({
			type: 'confirm',
			message: '是否根据该版本创建 tag 标签',
			name: 'tagThis',
			default: false
		});
		const _arr = getGitCmd(commitMemo, pkg, tagThis);
		for (const v of _arr) {
			shelljs.exec(v);
		}
		echo('GITHUB 提交成功!', 'Done', 'SUCC');
		echoLine();
	} catch (err) {
		echo(err, 'GITHUB-提交失败', 'ERR');
		echoLine();
	}
};

// 2、发布到 NpmJs
const publishToNpm = async () => {
	echo('准备发布 NPM', '步骤2', 'INFO');
	try {
		const missPrivateDef = (typeof pkg.private === 'undefined');
		const allowPublish = (!missPrivateDef && !pkg.private);
		if (missPrivateDef) {
			/* eslint-disable no-console */
			console.log('项目的 package.json 未指定 private 字段，若需要提交 NpmJs，请先配置该字段');
		} else {
			if (allowPublish) {
				shelljs.exec('yarn publish');
				echo('NPM 发布成功!', 'Done', 'SUCC');
			} else {
				echo('项目的 package.json 中 private 字段已申明为： false，该项目不允许发布到 npm.', 'NPM-发布被拒绝', 'WARN');
			}
		}
		echoLine();
	} catch (err) {
		echo(err, 'NPM-发布失败', 'ERR');
		echoLine();
	}
};

// 3、将本次提交 NPM 的最新版重新安装到根仓库中
const reInstallLastVerInRootRepo = async () => {
	echo('准备以NPM的当前最新版更新根仓库', '步骤3', 'INFO');
	try {
		if (pathUser) {
			const fData = fs.readFileSync(path.resolve(pathUser, '.tMind'), {
				encoding: 'utf-8'
			});
			const lines = fData.split(/\r?\n/);
			let pathRepo = '';
			for (const v of lines) {
				if (v.startsWith('ROOT_REPO')) {
					const [a, b] = v.split('=');
					if (a && b) {
						pathRepo = b;
					}
				}
			}
			if (pathRepo && pkg.name) {
				console.log(pathRepo);
				shelljs.cd(pathRepo);
				const pkgName = pkg.name;
				shelljs.exec(`yarn add ${pkgName}`);
				echo('从NPM更新本地根仓库成功!', 'Done', 'SUCC');
				echoLine();
				echo(`当前根仓库上安装的${pkgName}版本号如下：`, '最新版', 'SUCC');
				shelljs.exec(`yarn list ${pkgName}`);
			} else {
				echo('tMind-cli配置文件无效', '未找到根仓库路径', 'ERR');
			}
		}
	} catch (err) {
		echo(err, '从NPM更新本地根仓库失败', 'ERR');
	}
};

/* eslint-disable no-unused-vars */
const execBuild = (async () => {
	await pushToGithub();
	await publishToNpm();
	await reInstallLastVerInRootRepo();
})();
