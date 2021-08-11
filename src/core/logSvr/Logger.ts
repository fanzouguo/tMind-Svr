import type { MSG_TYPE } from 'tmind-core';
import type { PathMgr, TimeTask, IsvrLog } from '../../types';
import { tDate, tEcho } from 'tmind-core';
import { INFO_TYPE, WARN_TYPE, ERR_TYPE } from '../../types';
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
// const { Worker, isMainThread, parentPort } = require('worker_threads');
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

	/** 初始化
	 *
	 * @param currPath 日志记录器所挂载的服务实例的路径管理器
	 * @param ident 日志记录器挂载的服务实例的标识
	 * @param timeTasker 日志记录器挂载的服务实例的定时任务控制器
	 */
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

		timeTasker.prepare(() => {
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

	/** 写入基本日志记录信息
	 *
	 * @param msg 要写入日志的信息文本
	 * @param currLogType 当前日志信息的自定义类型
	 * @param reqId 触发该日志的请求ID
	 * @param tag 日志标签
	 */
	setInfo(msg: string, currLogType: INFO_TYPE, reqId?: number, tag?: string) {
		const type: MSG_TYPE = 'INFO';
		// @ts-ignore
		this.#logCacheInfo.push({
			logId: reqId || -1,
			tag: tag || '',
			msg,
			code: 200,
			datatime: new Date().toString(),
			type,
			level: currLogType
		});
	}

	/** 写入警告信息
	 *
	 * @param msg 要写入的警告信息文本
	 * @param currLogType 当前警告信息的自定义类型
	 * @param reqId 触发该警告信息的请求ID
	 * @param tag 日志标签
	 */
	setWarn(msg: string, currLogType: WARN_TYPE, reqId?: number, tag?: string) {
		const type: MSG_TYPE = 'WARN';
		// @ts-ignore
		this.#logCacheWarn.push({
			logId: reqId || -1,
			tag: tag || '',
			msg,
			code: 200,
			datatime: new Date().toString(),
			type,
			level: currLogType
		});
	}

	/** 写入异常日志
	 *
	 * @param err 要写入的异常 Error 对象，或异常信息文本
	 * @param currLogType 当前异常的自定义类型
	 * @param reqId 触发异常的请求ID
	 * @param tag 日志标签
	 */
	setErr(err: Error | string, currLogType?: ERR_TYPE, reqId?: number, tag?: string) {
		const type: MSG_TYPE = 'ERR';
		// @ts-ignore
		this.#logCacheErr.push({
			logId: reqId || -1,
			tag: tag || '',
			msg: (err instanceof Error && err.message) || (typeof err === 'string' && err) || '未知错误',
			stack: (err instanceof Error && err.stack || '') || '',
			code: 500,
			datatime: new Date().toString(),
			type,
			level: currLogType || ERR_TYPE.Unkown_ERR
		});
	}
}

export default Logger;
