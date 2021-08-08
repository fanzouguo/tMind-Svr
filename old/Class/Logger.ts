import type { MSG_TYPE } from 'tmind-core';
import type { PathMgr, TimeTask, IsvrLog } from '../@types';
import { tDate, tEcho } from 'tmind-core';
const logType = require('../Enum/logType');
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
// 追加时保存
const saveOnPush = true;
// 是否美化输出
const humanable = false;
// 分隔符
const splitSymbo = '.';
// @ts-ignore
const getFileName = () => tDate().format('YYYY-MM-DD');

class Logger {
	#dbInfo: any;
	#dbWarn: any;
	#dbErr: any;
	#dateStr: string;
	#logCacheInfo: IsvrLog[];
	#logCacheWarn: IsvrLog[];
	#logCacheErr: IsvrLog[];

	constructor(currPath: PathMgr, ident: string, timeTasker: TimeTask) {
		// @ts-ignore
		this.#dateStr = tDate().format('.YYYY年.MM月.DD日.hh时.mi分');
		const basePath = currPath.getPath('logs', ident, `${getFileName()}`);
		this.#dbInfo = new JsonDB(new Config(`${basePath}/info.json`, saveOnPush, humanable, splitSymbo));
		this.#dbWarn = new JsonDB(new Config(`${basePath}/warn.json`, saveOnPush, humanable, splitSymbo));
		this.#dbErr = new JsonDB(new Config(`${basePath}/err.json`, saveOnPush, humanable, splitSymbo));
		this.#logCacheInfo = [];
		this.#logCacheWarn = [];
		this.#logCacheErr = [];

		timeTasker.prepare(false, () => {
			try {
				if (this.#logCacheInfo.length) {
					this.#dbInfo.push(this.#dateStr, this.#logCacheInfo.splice(0, this.#logCacheInfo.length), false);
				}
				if (this.#logCacheWarn.length) {
					this.#dbWarn.push(this.#dateStr, this.#logCacheWarn.splice(0, this.#logCacheWarn.length), false);
				}
				if (this.#logCacheErr.length) {
					this.#dbErr.push(this.#dateStr, this.#logCacheErr.splice(0, this.#logCacheErr.length), false);
				}
			} catch (err) {
				tEcho('日志存盘失败，详情如下：', '异常', 'ERR');
				tEcho(err, '', 'ERR');
			}
		});
	}

	setInfo(msg: string, currLogType: typeof logType, type: MSG_TYPE, reqId?: number) {
		// @ts-ignore
		this.#logCacheInfo.push({
			logId: reqId || -1,
			msg,
			code: 200,
			datatime: new Date().toString(),
			type,
			level: currLogType
		});
	}

	setWarn(msg: string, currLogType: typeof logType, reqId: number) {
		const type: MSG_TYPE = 'WARN';
		// @ts-ignore
		this.#logCacheWarn.push({
			logId: reqId,
			msg,
			code: 200,
			datatime: new Date().toString(),
			type,
			level: currLogType
		});
	}

	setErr(err: Error | string, currLogType: typeof logType, reqId?: number) {
		const type: MSG_TYPE = 'ERR';
		// @ts-ignore
		this.#logCacheErr.push({
			logId: reqId || -1,
			msg: (err instanceof Error && err.message) || (typeof err === 'string' && err) || '未知错误',
			stack: (err instanceof Error && err.stack || '') || '',
			code: 500,
			datatime: new Date().toString(),
			type,
			level: currLogType
		});
	}
}

module.exports = Logger;
