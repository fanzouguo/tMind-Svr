// import inquirer from 'inquirer';
const shelljs = require('shelljs');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const pkg = fs.readJsonSync('./package.json');
const { ncp } = require('ncp');
const { promisify } = require('util');
const { tDate, tEcho } = require('tmind-core');

const pathUser = process.env.HOME || process.env.USERPROFILE || '';

const echoLine = () => console.log('\n----------------------------------------------------------------------------\n');

const frm = (str, len = 2) => {
	return `${str}`.padStart(len, '0');
};

const getGitCmd = (memo, pkg, tagThis = false, branch = 'main') => {
	const urlStr = (pkg && pkg.repository && (pkg.repository.url || '')) || '';
	const _arr = ['git add .'];

	if (tagThis) {
		_arr.push(`git tag -a v${pkg.version} -m "${memo}"`);
	}
	_arr.push(`git commit -m "(${tDate().format('YYYY-MM-DD hh:mi:ss')})${memo}"`);

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
	tEcho('准备提交 GITHUB', '步骤1', 'INFO');
	try {
		const _buildRoot = process.cwd();
		await promisify(ncp)(path.resolve(_buildRoot, 'src/@types'),  path.resolve(_buildRoot, 'lib/@types/'));

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
		tEcho('GITHUB 提交成功!', 'Done', 'SUCC');
		echoLine();
	} catch (err) {
		tEcho(err, 'GITHUB-提交失败', 'ERR');
		echoLine();
	}
};

// 2、发布到 NpmJs
const publishToNpm = async () => {
	tEcho('准备发布 NPM', '步骤2', 'INFO');
	try {
		const missPrivateDef = (typeof pkg.private === 'undefined');
		const allowPublish = (!missPrivateDef && !pkg.private);
		if (missPrivateDef) {
			/* eslint-disable no-console */
			console.log('项目的 package.json 未指定 private 字段，若需要提交 NpmJs，请先配置该字段');
		} else {
			if (allowPublish) {
				shelljs.exec('yarn publish');
				tEcho('NPM 发布成功!', 'Done', 'SUCC');
			} else {
				tEcho('项目的 package.json 中 private 字段已申明为： false，该项目不允许发布到 npm.', 'NPM-发布被拒绝', 'WARN');
			}
		}
		echoLine();
	} catch (err) {
		tEcho(err, 'NPM-发布失败', 'ERR');
		echoLine();
	}
};

// 3、将本次提交 NPM 的最新版重新安装到根仓库中
const reInstallLastVerInRootRepo = async () => {
	tEcho('准备以NPM的当前最新版更新根仓库', '步骤3', 'INFO');
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
				tEcho('从NPM更新本地根仓库成功!', 'Done', 'SUCC');
				echoLine();
				tEcho(`当前根仓库上安装的${pkgName}版本号如下：`, '最新版', 'SUCC');
				shelljs.exec(`yarn list ${pkgName}`);
			} else {
				tEcho('tMind-cli配置文件无效', '未找到根仓库路径', 'ERR');
			}
		}
	} catch (err) {
		tEcho(err, '从NPM更新本地根仓库失败', 'ERR');
	}
};

/* eslint-disable no-unused-vars */
const execBuild = (async () => {
	await pushToGithub();
	await publishToNpm();
	await reInstallLastVerInRootRepo();
})();
