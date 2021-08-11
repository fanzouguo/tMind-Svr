import type { Isvr,
	PathMgr as TpathMgr,
	IconfSvr,
	IconfUnit,
	IsvrRequestOption,
	httpMethod,
	TimeTask as TtimeTask,
	IsvrLog
} from '../../types';
import type { MSG_TYPE, IObj } from 'tmind-core';
import { tEcho, tDate, smpoo } from 'tmind-core';
import { INFO_TYPE, WARN_TYPE, ERR_TYPE } from '../../types';
import preConf from './preConf';
import PathMgr from './PathMgr';
import TimeTask from './TimeTask';
import SvrUtil from './SvrUtil';
import WebSocket from 'ws';

const EventEmitter = require('events');
const rq = require('request-promise');

class SvrBase extends EventEmitter implements Isvr {
	readonly ident: string;
	readonly pathMgr: TpathMgr;
	readonly config: IconfUnit;
	readonly configAll: IconfSvr;
	readonly onSSL: boolean;
	/** 在终端控制台实时显示日志输出
	 */
	public showLog: boolean;
	#TimeTask: TtimeTask;
	// 是否处于暂停状态
	#isPause: boolean;
	#timTaskStoped: boolean;
	#logger?: WebSocket;
	constructor(appDir: string) {
		super();
		this.showLog = false;
		this.pathMgr = new PathMgr(appDir);
		this.ident = this.pathMgr.svrForlder.replace(/Svr/, '');
		this.configAll = preConf(this.pathMgr);
		this.config = this.configAll.unit[this.ident];
		this.#TimeTask = new TimeTask(this.pathMgr, this.configAll);
		this.#isPause = false;
		this.onSSL = !!(this.configAll.cert.key);
		this.#timTaskStoped = false;

		process.on('SIGINT', (e: any) => {
			const msg = `${this.config.namezh}服务已被强制终止`;
			if (this.config.ident !== 'log') {
				this.setWarn(msg, WARN_TYPE.Svr_Stoped, -1, 'stop');
			}
			tEcho(msg, '警告！', 'WARN');
			process.exit(0);
		});

		// 非请求响应的异常处理
		this.on('error', (err: Error) => {
			this.setErr(err, ERR_TYPE.Svr_Catch_Err, -1, '监听到异常');
		});

		process.on('uncaughtException', (err: Error) => {
			this.setErr(err, ERR_TYPE.Svr_UnCatch_Err, -1, '未捕获的异常');
		});

		process.on('unhandledRejection', (err: Error) => {
			this.setErr(err, ERR_TYPE.Svr_UnHandled_Reject, -1, '未捕获的Reject');
		});

		// 建立与日志服务器的连接
		if (this.ident !== 'log') {
			this.#logger = new WebSocket(this.configAll.loggerUrl);
			this.#logger.on('open', () => {
				this.setLogInfo('日志服务已连接', INFO_TYPE.Svr_Boot, -1, 'boot');
			});
			this.#logger.on('close', () => {
				this.exit('日志服务已终止，本服务也将随之终止.');
			});
			this.#logger.on('error', (err: IObj<any>) => {
				if (err.code === 'ECONNREFUSED') {
					this.exit('由于日志服务连接失败，服务终止了启动');
				}
				this.exit('日志写入失败，本服务也将随之终止.');
			});
		}
	}

	get paused(): boolean {
		return this.#isPause;
	}

	/** 为服务端实例预置定时任务
	 *
	 * @param taskUnit 定时任务集合
	 */
	setTimeTask(...taskUnit: any[]) {
		this.#TimeTask.prepare(...taskUnit);
	}

	/** 创建INFO类日志
	 * @param msg 要写入日志的信息文本
	 * @param currLogType 当前日志信息的自定义类型
	 * @param reqId 触发该日志的请求ID
	 * @param tag 日志标签
	 * @param title 控制台显示时采用的标题
	 */
	setInfo(msg: any, currLogType: INFO_TYPE, reqId?: number, tag?: string, title?: string, msgType: MSG_TYPE = 'INFO') {
		if (this.ident !== 'log') {
			if (msgType === 'INFO' || msgType === 'SUCC') {
				if (this.#logger) {
					const _infoObj: IsvrLog = {
						logId: reqId || -1,
						from: this.config.namezh,
						tag: tag || '',
						name: '',
						message: msg,
						type: msgType,
						level: currLogType || INFO_TYPE.Normal_Info
					};

					this.#logger.send(JSON.stringify(_infoObj), (err: Error | undefined) => {
						if (err) {
							this.exit('日志写入失败，服务已终止，请确保日志服务运行正常');
						}
					});
					if (this.showLog) {
						tEcho(msg, title || '信息', msgType);
					}
				}
			} else {
				tEcho('setInfo的msgType类型取值只能为：INFO | SUCC', '代码级错误', 'ERR');
			}
		} else {
			tEcho('日志服务器不支持 setInfo 方法', '警告！', 'WARN');
		}
	}

	/** 创建WARN类日志
	 * @param msg 要写入日志的信息文本
	 * @param currLogType 当前日志信息的自定义类型
	 * @param reqId 触发该日志的请求ID
	 * @param tag 日志标签
	 */
	setWarn(msg: any, currLogType: WARN_TYPE, reqId?: number, tag?: string) {
		if (this.ident !== 'log') {
			if (this.#logger) {
				const _warnObj: IsvrLog = {
					logId: reqId || -1,
					from: this.config.namezh,
					tag: tag || '',
					name: '',
					message: msg,
					type: 'WARN',
					level: currLogType || WARN_TYPE.Normal_Warn
				};
				this.#logger.send(JSON.stringify(_warnObj), (err: Error | undefined) => {
					if (err) {
						this.exit('日志写入失败，服务已终止，请确保日志服务运行正常');
					}
				});
				if (this.showLog) {
					tEcho(msg, '警告', 'WARN');
				}
			}
		} else {
			tEcho('日志服务器不支持 setWarn 方法', '警告！', 'WARN');
		}
	}

	/** 创建ERR类日志
	 * @param msg 要写入日志的信息文本
	 * @param currLogType 当前日志信息的自定义类型
	 * @param reqId 触发该日志的请求ID
	 * @param tag 日志标签
	 */
	setErr(err: string | Error, currLogType?: ERR_TYPE, reqId?: number, tag?: string) {
		if (this.ident !== 'log') {
			if (this.#logger) {
				const isErr = err instanceof Error;
				const _errObj: IsvrLog = {
					logId: reqId || -1,
					from: this.config.namezh,
					tag: tag || '',
					// @ts-ignore
					code: isErr ? err.code : '',
					name: isErr ? (err as Error).name : '',
					message: isErr ? (err as Error).message : err as string,
					stack: isErr ? (err as Error).stack : '',
					type: 'ERR',
					level: currLogType || ERR_TYPE.Unkown_ERR
				};
				this.#logger.send(JSON.stringify(_errObj), (err: Error | undefined) => {
					if (err) {
						this.exit('日志写入失败，服务已终止，请确保日志服务运行正常');
					}
				});
				this.emit('error', _errObj);
				if (this.showLog) {
					tEcho(_errObj, `${tag || ''}异常`, 'ERR');
				}
			}
		} else {
			tEcho('日志服务器不支持 setErr 方法', '警告！', 'WARN');
		}
	}

	/** 服务端发起远程 HTTP 协议请求器
	 *
	 * @param opt HTTP 请求配置对象
	 */
	async http(opt: IsvrRequestOption): Promise<any>;
	/**  服务端发起远程 HTTP 协议请求器
	 * @param url 目标远程URL地址
	 * @param method 远程请求方法
	 */
	async http(url: string, method?: httpMethod): Promise<any>;
	/** 服务端发起远程 HTTP 协议请求器
	 *
	 * @param url 目标远程URL地址
	 * @param opt HTTP 请求配置对象
	 */
	async http(url: string, opt?: IsvrRequestOption): Promise<any>;
	async http(urlOrOpt: string | IsvrRequestOption, optOrMethod?: IsvrRequestOption | httpMethod): Promise<any> {
		const _typeAIsUrl = typeof urlOrOpt === 'string';
		const _typeBIsMethod = optOrMethod && (typeof optOrMethod !== 'object');
		const _obj: IsvrRequestOption = {
			uri: (_typeAIsUrl && urlOrOpt as string) || (urlOrOpt as IsvrRequestOption).uri,
			json: true
		};
		const qs = (!_typeAIsUrl && (urlOrOpt as IsvrRequestOption)?.qs) || (!_typeBIsMethod && (optOrMethod as IsvrRequestOption)?.qs);
		const headers = (!_typeAIsUrl && (urlOrOpt as IsvrRequestOption)?.headers) || (!_typeBIsMethod && (optOrMethod as IsvrRequestOption)?.headers);
		const method: httpMethod = (_typeBIsMethod && (optOrMethod as httpMethod)) || (!_typeAIsUrl && ((urlOrOpt as IsvrRequestOption)?.method)) || 'GET';
		if (qs) _obj.qs = qs;
		if (headers) _obj.headers = headers;
		if (method && method !== 'GET') _obj.method = method;

		try {
			return await rq(_obj);
		} catch (err) {
			this.preErr(err, ERR_TYPE.Svr_Http_Request_Err);
		}
	}

	/** 启动服务
	 *
	 */
	start() {
		try {
			this.#TimeTask.start();
			this.#timTaskStoped = false;
			const { appCopy, consoleStr } = smpoo();
			// @ts-ignore
			tEcho(consoleStr(), '', 'INFO');
			tEcho(appCopy, '', 'INFO');
			tEcho('-----------------------------------------------------------', '', 'INFO');
			tEcho(`${tDate().format('YYYY-MM-DD hh:mi:sss')}\n\n`, '', 'INFO');
			tEcho(`物理IP：${SvrUtil.getSvrIp().Main}`, '', 'INFO');
			tEcho(`配置指向：${this.config.addr}`, '', 'INFO');
			const _svrNameStr = !this.config.namezh ? '' : `[${this.config.namezh}]`;
			tEcho(`${_svrNameStr}服务端已启动......\n\n    Enjoy it!\n\n`, `HTTP${this.onSSL ? '/s' : ''}：${this.config.port}`, 'SUCC');
			this.setInfo(`[${this.config.namezh}] Server is start at ${this.config.addr}:${this.config.port} in ${tDate().format('YYYY-MM-DD hh:mi:ss.ms')}`, INFO_TYPE.Svr_Boot, -1, 'boot', '', 'SUCC');
		} catch (err) {
			tEcho(err, '启动失败', 'ERR');
			process.exit(1);
		}
	}

	/** 停止服务
	 *
	 * @param msg 控制台消息
	 */
	stop(msg?: string) {
		this.#timTaskStoped = true;
		this.#TimeTask.stop();
		tEcho(msg || '已停止服务端', '手动', 'WARN');
		process.exit(0);
	}

	/** 暂停服务
	 * @param timeTaskAlso 同时停止本实例的定时任务
	 */
	pause(timeTaskAlso: boolean): void {
		if (timeTaskAlso) {
			this.#TimeTask.stop();
			this.#timTaskStoped = true;
		}
		this.#isPause = true;
		tEcho('服务已暂停', '警告！', 'WARN');
	}

	/** 恢复服务
	 */
	resume(): void {
		if (this.#timTaskStoped) {
			this.#TimeTask.start();
		}
		this.#isPause = false;
		tEcho('服务已恢复', '信息', 'INFO');
	}

	/** 强制终止服务端启动
	 *
	 * @param msg 控制台提示信息
	 * @param code 终止码
	 */
	exit(msg?: string, code?: number): void {
		this.#TimeTask.stop();
		tEcho(msg || `[${this.config.namezh}]服务端无法启动`, '启动异常', 'ERR');
		process.exit(code ?? 1);
	}
}

export default SvrBase;
