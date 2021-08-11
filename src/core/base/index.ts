import type { Isvr,
	PathMgr as TpathMgr,
	IconfSvr,
	IconfUnit,
	IsvrRequestOption,
	httpMethod,
	Terr,
	TimeTask as TtimeTask
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
	#TimeTask: TtimeTask;
	// 是否处于暂停状态
	#isPause: boolean;
	#timTaskStoped: boolean;
	#logger: WebSocket;
	constructor(appDir: string) {
		super();
		this.pathMgr = new PathMgr(appDir);
		this.ident = this.pathMgr.svrForlder.replace(/Svr/, '');
		this.configAll = preConf(this.pathMgr);
		this.config = this.configAll.unit[this.ident];
		this.#TimeTask = new TimeTask(this.pathMgr, this.configAll);
		this.#isPause = false;
		this.onSSL = !!(this.configAll.cert.key);
		this.#timTaskStoped = false;

		// 非请求响应的异常处理
		this.on('error', (err: Error) => {
			this.echo('监听到异常，详情如下：', '错误', 'ERR');
			this.echo(err);
		});

		process.on('uncaughtException', (err: Error) => {
			this.echo('监听到异常，详情如下：', '未捕获的异常', 'ERR');
			this.echo(err);
		});

		process.on('unhandledRejection', (err: Error) => {
			this.echo('监听到异常，详情如下：', '未捕获的Reject', 'ERR');
			this.echo(err);
		});

		this.#logger = new WebSocket(this.configAll.loggerUrl);
		this.#logger.on('open', () => {
			this.setLog('INFO', `[${this.config.namezh}]服务已启动`, INFO_TYPE.Svr_Boot, -1, '启动');
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

	get paused(): boolean {
		return this.#isPause;
	}

	get addr(): string {
		return (this.config.addr || this.configAll.addr)[this.configAll.isDev ? 0 : 1];
	}

	get port(): number {
		return this.config.port;
	}

	/** 为服务端实例预置定时任务
	 *
	 * @param taskUnit 定时任务集合
	 */
	setTimeTask(...taskUnit: void[] | void[][]) {
		this.#TimeTask.prepare(...taskUnit);
	}

	/** 输出服务端控制台回显
	 *
	 * @param msg 要显示的信息正文
	 * @param title 要显示的标题名称
	 * @param msgType 要显示的信息类型
	 */
	echo(msg: any, title?: string, msgType?: MSG_TYPE): void {
		const isErr = msg instanceof Error;
		if (!title) {
			if (isErr) {
				console.error(msg); // eslint-disable-line
			} else {
				console.log(msg); // eslint-disable-line
			}
		} else {
			tEcho(msg, title, msgType);
		}
	}

	/** 异常处理器
	 *
	 * @param msg 异常信息文本
	 */
	preErr(msg: string): void;
	/** 异常处理器
	 *
	 * @param err JS/TS的 Error 对象
	 */
	preErr(err: Error): void;
	/** 异常处理器
	 *
	 * @param msg 异常信息文本
	 * @param errCode 基于 tFrameV9平台定义的错误码
	 */
	preErr(msg: string, errCode: ERR_TYPE): void;
	/** 异常处理器
	 *
	 * @param err JS/TS的 Error 对象
	 * @param errCode 基于 tFrameV9平台定义的错误码
	 */
	preErr(err: Error, errCode: ERR_TYPE): void;
	/** 异常处理器
	 *
	 * @param msg 异常信息文本
	 * @param errCode 基于 tFrameV9平台定义的错误码
	 * @param toConsole 是否输出到控制台
	 */
	preErr(msg: string, errCode: ERR_TYPE, toConsole: boolean): void;
	/** 异常处理器
	 *
	 * @param err JS/TS的 Error 对象
	 * @param errCode 基于 tFrameV9平台定义的错误码
	 * @param toConsole 是否输出到控制台
	 */
	preErr(err: Error, errCode: ERR_TYPE, toConsole: boolean): void;
	preErr(a: string | Error, b?: ERR_TYPE | boolean, c?: boolean): void {
		const _errObj: Terr = (((typeof a === 'string') && new Error(a)) || a) as Terr;
		const isBoolB = typeof b === 'boolean';
		if (b) {
			_errObj.code = !isBoolB ? (b as ERR_TYPE) : ERR_TYPE.Unkown_ERR;
		} else {
			_errObj.code = ERR_TYPE.Unkown_ERR;
		}
		if (isBoolB || c) {
			tEcho(typeof a === 'string' ? a : (a as Error).message, '异常', 'ERR');
		}
		this.emit('error', _errObj);
	}

	/** 创建日志
	 * @param msgType 日志消息或
	 * @param msg 日志消息或
	 * @param currLogType 日志消息或
	 * @param reqId 日志消息或
	 * @param tag 日志消息或
	 */
	setLog(msgType: MSG_TYPE, msg: string | Error, currLogType: INFO_TYPE | WARN_TYPE | ERR_TYPE, reqId?: number, tag?: string) {
		if (this.#logger) {
			this.#logger.send(JSON.stringify({
				msgType,
				msg,
				currLogType,
				reqId: reqId || -1,
				tag
			}), (err: Error | undefined) => {
				if (err) {
					this.exit('日志写入失败，服务已终止，请确保日志服务运行正常');
				}
			});
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
			tEcho(`配置指向：${this.addr}`, '', 'INFO');
			const _svrNameStr = !this.config.namezh ? '' : `[${this.config.namezh}]`;
			tEcho(`${_svrNameStr}服务端已启动......\n\n    Enjoy it!\n\n`, `HTTP${this.onSSL ? '/s' : ''}：${this.config.port}`, 'SUCC');
		} catch (err) {
			this.echo((err as Error).message, '启动失败');
			this.echo(err);
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
		this.echo('服务已暂停', '警告！', 'WARN');
	}

	/** 恢复服务
	 */
	resume(): void {
		if (this.#timTaskStoped) {
			this.#TimeTask.start();
		}
		this.#isPause = false;
		this.echo('服务已恢复', '信息', 'INFO');
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
