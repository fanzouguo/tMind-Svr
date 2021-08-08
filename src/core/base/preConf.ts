import type { IObj } from 'tmind-core';
import type { IconfSvr, IconfUnit, PathMgr } from '../../types';
import terminat from '../../util/terminat';
const fs = require('fs-extra');

const LICENSE_PATH = '.license';
const MSG_TERMINATE = '配置缺失';
const MSG_BOOT_ERR = '启动失败';
const KEYS: IObj<number> = {
	G: 0,
	K: 1,
	A: 2,
	Z: 3,
	H: 4,
	J: 5,
	E: 6,
	Y: 7,
	Q: 8,
	X: 9
};

const checkLicense = (currPath: PathMgr, ident: string): boolean => {
	try {
		const _strLicense = fs.readFileSync(currPath.getPath('license', 'key')).toString();
		if (!_strLicense) terminat(MSG_TERMINATE, MSG_BOOT_ERR, 0);
		return (_strLicense.split(/\r\n|\n/)[0].split(':')[1].split('0IO').map((v: string) => parseInt(v.split('').map(vKey => KEYS[vKey]).join('')))).decodeToStr() === ident;
	} catch (err) {
		terminat(MSG_TERMINATE, MSG_BOOT_ERR, 0);
		return false;
	}
};

const getUintConf = (): IconfUnit => {
	return {
		id: -1,
		ident: '',
		namezh: '',
		memo: '',
		addr: ['', ''],
		port: -1,
		prefix: false,
		corsed: false,
		appendCorsHeader: [],
		disableMethods: [],
		corsWhiteList: [],
		schedule: '* * * * * *'
	};
};

/** 初始化服务配置清单
 */
export default (currPath: PathMgr): IconfSvr | IObj<any> => {
	try {
		const rootPath = currPath.getPath('conf');
		const _arr: string[] = fs.readdirSync(rootPath);
		if (!_arr.includes(LICENSE_PATH)) {
			terminat('授权文件缺失', MSG_BOOT_ERR, 0);
			return {};
		} else {
			const pjIdent = currPath.rootForlder;
			checkLicense(currPath, pjIdent);
			const _obj: IconfSvr = {
				id: '',
				ident: '',
				namezh: '',
				cert: {
					key: '',
					pem: ''
				},
				secretKey: '',
				ver: '1.0.0',
				isDev: (process.env.NODE_ENV || '').toLowerCase() === 'dev',
				unit: {}
			};
			let i = 1;
			let tempObj: IObj<string> | null = {};
			for (const v of _arr) {
				if (v.endsWith('.js')) {
					const objFile = require(`${rootPath}/${v}`);
					if (v === '.index.js') {
						_obj.id = objFile.id;
						_obj.ident = pjIdent;
						_obj.namezh = objFile.namezh || terminat('工程名称配置项不允许为空', MSG_BOOT_ERR, 1);
						_obj.secretKey = objFile.secretKey || terminat('加盐码不能为空', MSG_BOOT_ERR, 1);
					} else {
						const _objUnit = getUintConf();
						const { id, ident, namezh, memo, addr, port, prefix, corsed, appendCorsHeader, disableMethods, corsWhiteList, schedule, ...otherConf } = objFile;
						_objUnit.id = (!id || tempObj[`${id}`]) ? i : parseInt(objFile.id);
						_objUnit.ident = `svr${v.replace(/\.js|\.conf/g, '')}`;
						_objUnit.namezh = namezh;
						_objUnit.memo = memo;
						_objUnit.addr = addr || ['', ''];
						_objUnit.port = port || 3000;
						_objUnit.prefix = prefix ?? false;
						_objUnit.corsed = corsed ?? false;
						_objUnit.appendCorsHeader = appendCorsHeader || [];
						_objUnit.disableMethods = disableMethods || [];
						_objUnit.corsWhiteList = corsWhiteList || [];
						_objUnit.schedule = schedule || '* * * * * *';
						for (const kConf in otherConf) {
							_objUnit[kConf] = otherConf[kConf];
						}

						_obj.unit[_objUnit.ident] = _objUnit;
						tempObj[`${_objUnit.id}`] = ident;
						i++;
					}
				} else if (v === '.cert') {
					const _arrCert: string[] = fs.readdirSync(currPath.getPath('cert'));
					for (const vCert of _arrCert) {
						const fPath = currPath.getPath('cert', vCert);
						if (vCert.startsWith('local')) {
							_obj.cert.ca = [fs.readFileSync(fPath)];
						} else if (vCert.includes('key')) {
							_obj.cert.key = fs.readFileSync(fPath);
						} else if (vCert.includes('cert')) {
							_obj.cert.cert = fs.readFileSync(fPath);
						}
					}
				}
			}
			tempObj = null;
			return _obj;
		}
	} catch (err) {
		terminat('服务端私有配置文件丢失或读取异常', MSG_BOOT_ERR, 1);
		return {};
	}
};
