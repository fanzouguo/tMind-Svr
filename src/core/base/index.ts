import type { Isvr, PathMgr as TpathMgr, IconfSvr, IconfUnit, IsvrRequestOption, httpMethod } from '../../types';
import type { MSG_TYPE, IObj } from 'tmind-core';
import { tEcho } from 'tmind-core';
import Terr from '../../class/Terr';
import { ERR_TYPE } from '../../enum';
const EventEmitter = require('events');
const PathMgr = require('./PathMgr');
const preConf = require('./preConf');
const bootWelcome = require('./bootWelcome');
const rq = require('request-promise');

class SvrBase extends EventEmitter implements Isvr {
	#ident: string;
	#pathMgr: TpathMgr;
	#config: IconfSvr;
	// 是否处于暂停状态
	#isPause: boolean;
	// 是否采用了 SSL 协议
	#isHttps: boolean;
	constructor(appDir: string) {
		super();
		this.#pathMgr = new PathMgr(appDir);
		this.#ident = this.#pathMgr.svrForlder;
		this.#config = preConf(this.#pathMgr);
		this.#isPause = false;
		this.#isHttps = !!(this.#config.cert.key);

		// 非请求响应的异常处理
		this.on('error', (err: Error) => {
			this.echo('监听到异常，详情如下：', '错误', 'ERR');
			this.echo(err);
		});
	}

	get pathMgr(): TpathMgr | IObj<any> {
		return this.#pathMgr || {};
	}

	get config(): IconfUnit | IObj<any> {
		return this.#config.unit[this.#ident] || {};
	}

	get configAll(): IconfSvr | IObj<any> {
		return this.#config || {};
	}

	get status(): boolean {
		return this.#isPause;
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

	// preErr() {
	// 	Terr
	// }

	/** 启动服务
	 *
	 */
	start() {
		try {
			bootWelcome(this.#isHttps, this.config.port, this.config.namezh);
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
		tEcho(msg || '已停止服务端', '手动', 'WARN');
		process.exit(0);
	}

	/** 暂停服务
	 */
	pause(): void {
		this.#isPause = true;
		this.echo('服务已暂停', '警告！', 'WARN');
	}

	/** 恢复服务
	 */
	resume(): void {
		this.#isPause = false;
		this.echo('服务已恢复', '信息', 'INFO');
	}

	/** 强制终止服务端启动
	 *
	 * @param msg 控制台提示信息
	 * @param code 终止码
	 */
	exit(msg?: string, code?: number): void {
		tEcho(msg || `[${this.config.namezh}]服务端无法启动`, '启动异常', 'ERR');
		process.exit(code ?? 1);
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
			this.emit('error', new Terr(err, ERR_TYPE.svrHttpRequestErr, true));
		}
	}

	// 服务端定时任务处理器

	// 异常处理
}

module.exports = SvrBase;
