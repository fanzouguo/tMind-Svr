// import type { IpreErr, IResData, PathMgr as TpathMgr } from '../../types';
// import type * as KoaApp from 'koa';
// const Koa = require('koa');
// const EventEmitter = require('events');
// const { tEcho } = require('tmind-core');
// const bootTask = require('./bootTask');

// class SvrBase extends EventEmitter {
// 	#app: KoaApp;
// 	#isPause: boolean;
// 	#pathMgr: TpathMgr;
// 	constructor(appDir: string, shareApp?: KoaApp) {
// 		super();
// 		this.#isPause = false;
// 		const app: KoaApp = shareApp || new Koa();

// 		// 基于请求的输出响应数据格式化
// 		app.context.resAll = (data: any): IResData => {
// 			return {
// 				reqId: app.context.reqId,
// 				code: 200,
// 				data,
// 				isOk: true
// 			};
// 		};

// 		const preErr: IpreErr = (err: Error | string, code?: number): IResData => {
// 			return {
// 				reqId: app.context.reqId,
// 				// @ts-ignore
// 				code: (err instanceof Error && (err.code ?? code ?? 500)) || (code ?? 500),
// 				msg: (err instanceof Error) ? err.message : err,
// 				isOk: true
// 			};
// 		};
// 		// 面向请求响应的异常信息格式化
// 		app.context.resErr = preErr;

// 		// 非请求响应的异常处理
// 		app.on('error', (err: Error) => {
// 			tEcho('异常监听，详情如下：', '错误', 'ERR');
// 			console.error('server error', err); // eslint-disable-line
// 		});

// 		// 基于请求响应的异常处理
// 		app.use(async (ctx: KoaApp.Context, next: KoaApp.Next) => {
// 			try {
// 				await next();
// 			} catch (err) {
// 				ctx.resErr(err);
// 			}
// 		});

// 		// 响应服务端暂停状态
// 		app.use(async (ctx: KoaApp.Context, next: KoaApp.Next) => {
// 			if (this.#isPause) {
// 				ctx.resErr('系统维护中...', 1000);
// 			} else {
// 				await next();
// 			}
// 		});

// 		app.use(bootTask(appDir));

// 		this.#app = app;
// 	}

// 	get app(): KoaApp {
// 		return this.#app;
// 	}

// 	start() {}

// 	stop() {}

// 	pause() {
// 		this.#isPause = true;
// 	}

// 	resume() {
// 		this.#isPause = false;
// 	}
// }

// module.exports = (appDir: string, shareApp?: KoaApp): KoaApp => {
// 	return new SvrBase(appDir, shareApp).app;
// };
