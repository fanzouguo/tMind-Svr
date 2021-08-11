import type { LogSvr as LogSvrClass, IsvrLog } from '../../types';
import { WARN_TYPE } from '../../types';
import BaseSvr from '../base/index';
import { tDate, tEcho } from 'tmind-core';
import * as WebSocket from 'ws';
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

// 追加时保存
const saveOnPush = true;
// 是否美化输出
const humanable = false;
// 分隔符
const splitSymbo = '.';

const getFileName = () => tDate().format('YYYY-MM-DD');
const getItemKey = () => tDate().format('.YYYY年.MM月.DD日.hh时.mi分');
const getLogTime = () => tDate().format('YYYY-MM-DD hh:mi:ss.ms');

class LogSvr extends BaseSvr implements LogSvrClass {
	#dbInfo: any;
	#dbWarn: any;
	#dbErr: any;
	#logCacheInfo: IsvrLog[];
	#logCacheWarn: IsvrLog[];
	#logCacheErr: IsvrLog[];
	constructor(appDir: string) {
		super(appDir);
		const basePath = this.pathMgr.getPath('logs', `${getFileName()}`);
		this.#dbInfo = new JsonDB(new Config(`${basePath}/info.json`, saveOnPush, humanable, splitSymbo));
		this.#dbWarn = new JsonDB(new Config(`${basePath}/warn.json`, saveOnPush, humanable, splitSymbo));
		this.#dbErr = new JsonDB(new Config(`${basePath}/err.json`, saveOnPush, humanable, splitSymbo));
		this.#logCacheInfo = [];
		this.#logCacheWarn = [];
		this.#logCacheErr = [];
		const svr = new WebSocket.Server({
			host: this.config.addr,
			port: this.config.port
		});
		svr.on('connection', (ws: WebSocket) => {
			let _logFrom = '';
			ws.on('message', (msg: Object) => {
				const _obj = JSON.parse(msg.toString()) as IsvrLog;
				if (!_logFrom) {
					_logFrom = _obj.from;
				}
				_obj.datatime = getLogTime();
				if (_obj.type === 'ERR') {
					this.#logCacheErr.push(_obj);
				} else if (_obj.type === 'WARN') {
					this.#logCacheWarn.push(_obj);
				} else {
					this.#logCacheInfo.push(_obj);
				}
			});
			ws.on('close', (code: number, reason: string) => {
				this.#logCacheWarn.push({
					logId: -1,
					from: _logFrom,
					tag: 'stop',
					code: code,
					name: '',
					message: `${_logFrom}与日志服务器的连接已断开。\n${code}\n${reason || ''}`,
					datatime: getLogTime(),
					type: 'WARN',
					level: WARN_TYPE.Svr_Stoped
				});
			});
		});
	}

	async start() {
		this.setTimeTask((): void => {
			try {
				const _dtStr_ = getItemKey();
				if (this.#logCacheInfo.length) {
					this.#dbInfo.push(_dtStr_, this.#logCacheInfo.splice(0, this.#logCacheInfo.length), false);
				}
				if (this.#logCacheWarn.length) {
					this.#dbWarn.push(_dtStr_, this.#logCacheWarn.splice(0, this.#logCacheWarn.length), false);
				}
				if (this.#logCacheErr.length) {
					this.#dbErr.push(_dtStr_, this.#logCacheErr.splice(0, this.#logCacheErr.length), false);
				}
			} catch (err) {
				tEcho('日志存盘失败，详情如下：', '异常', 'ERR');
				tEcho(err, '', 'ERR');
			}
		});
		super.start();
	}
}

export default LogSvr;
