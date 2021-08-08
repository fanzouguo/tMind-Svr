import type * as KoaApp from 'koa';
import type { IconfSvr, IconfUnit, Logger as TLogger, PathMgr as TPathMgr, Isvr, TimeTask as TtimeTask } from '../../@types';
const { tDate, tEcho } = require('tmind-core');
const Koa = require('koa');
const http2 = require('http2');
const koaCors = require('koa2-cors');
const koaBody = require('koa-body');
const Logger = require('../../Class/Logger');
const PathMgr = require('../../Class/PathMgr');
const TimeTask = require('../../Class/TimeTask');
const logType = require('../../Enum/logType');
const preConf = require('../../Util/preConf');
const terminat = require('../../Util/terminat');
const bootWelcome = require('../../Util/bootWelcome');
const preRouter = require('./preRouter');
const HttpException = require('../../Class/HttpException');
const { formatOk, formatErr } = require('../../Util/preData');

// const preReq = require('../../Util/middleware/preReq');

class Svr extends Koa implements Isvr {
	#app: KoaApp;
	#logger: TLogger;
	#conf: IconfSvr;
	// 当前服务实例的标识（区别于 this.#conf.ident 代表的工程标识）
	#ident: string;
	#isPause: boolean;
	#pathMgr: TPathMgr;
	#timeTask: TtimeTask;

	/** 调用文件的 __dirname
	 *
	 * @param appPath 引用本引擎的主程序文件
	 * @param app 本引擎的共享APP实例，如果为空，则独享新实例
	 */
	constructor(appPath: string, app?: KoaApp) {
		super();
		// 路径管理器，必须紧接 super()下一句
		this.#pathMgr = new PathMgr(appPath);
		// if (!process.env.NODE_ENV) {
		// 	terminat('未识别到环境变量，请使用package.json文件脚本命令执行启动.', 2);
		// }
		this.#app = app || new Koa();
		this.#ident = this.#pathMgr.svrForlder;
		// 初始化配置参数
		this.#conf = preConf(this.#pathMgr);
		this.#isPause = false;

		this.#timeTask = new TimeTask(this.#pathMgr, this.#conf);
		this.#logger = new Logger(this.#pathMgr, this.#ident, this.#timeTask);

		this.#app.context.resOk = (ctx: KoaApp.Context, data: any, currLogType?: typeof logType) => {
			console.log(this); // eslint-disable-line
			ctx.body = formatOk(ctx.reqId, data, this.#logger, currLogType || logType.normal);
		};

		/** 注入异常抛出函数
		 */
		this.#app.context.resErr = (err: Error | string, errCode?: number, codeType?: number): typeof HttpException => {
			throw new HttpException(err, errCode, codeType);
		};

		// 全局异常捕获
		this.#app.use(async (ctx: KoaApp.Context, next: KoaApp.Next) => {
			try {
				await next();
			} catch (err) {
				return ctx.body = formatErr(ctx.reqId, err);
			}
		})

		// 初始化请求
		.use(async (ctx: KoaApp.Context, next: KoaApp.Next) => {
			ctx.reqId = tDate().toNumber();

			// 处理服务端暂停状态
			if (this.#isPause) {
				// ctx.body = formatOk(ctx.reqId, '服务端');
				ctx.resErr('系统维护中...', 1001, 500);
				// 屏蔽favicon请求
			} else if (ctx.originalUrl === '/favicon.ico') {
				ctx.res.end();
			} else {
				await next();
			}
		});

		const svrConf = this.#conf.unit[this.#ident] as IconfUnit;
		if (svrConf.corsed) {
			// 跨域处理
			this.#app.use(koaCors({
				// 待加入白名单处理
				origin: function (ctx: KoaApp.Context) { // eslint-disable-line
					return '*';
				},
				exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
				maxAge: 5,
				// 待恢复为 true，调试期间开启该参数会导致不允许 origin return '*'
				// credentials: true,
				// 待补充从对应的服务配置文件中导入
				allowMethods: ['PUT', 'POST', 'GET', 'DELETE', 'OPTIONS'],
				// 待补充从对应的服务配置文件中导入
				allowHeaders: [
					'Content-Type',
					'Authorization',
					'Accept',
					'Origin',
					'Content-Type',
					'Content-Length',
					'X-Requested-With',
					'Accept-Encoding',
					'Access-Control-Allow-Origin',
					'Access-Control-Allow-Credentials',
					'x-access-token',
					'x-access-userid',
					'x-fendside',
					...svrConf.appendCorsHeader
				]
			}));
		}

		// 请求初始化
		// this.#app.use(preReq({}))
		// 请求体中间件
		this.#app.use(koaBody({
			// 配置参考：http://www.ptbird.cn/koa-body.html
			multipart: true, // 支持文件上传
			encoding: 'gzip'
			// formidable:{
			//   // 设置文件上传目录
			//   uploadDir: path.join(__dirname,'public/upload/'),
			//   // 保持文件的后缀
			//   keepExtensions: true,
			//   // 文件上传大小
			//   maxFieldsSize:2 * 1024 * 1024,
			//   // 文件上传前的设置
			//   onFileBegin:(name: string, file: any) => {
			//     /* eslint-disable no-console */
			//     console.log(`name: ${name}`);
			//     console.log(file);
			//   }
			// }
		}))

		// 初始化处理
		// 1、数据库连接
		// 2、服务发现或服务注册
		// 3、服务心跳

		// 响应正常状态的数据返回
		.use(async (ctx: KoaApp.Context, next: KoaApp.Next) => {
			// @ts-ignore
			if (!ctx.body?.data) {
				ctx.body = formatOk(ctx.reqId, ctx.body, this.#logger, logType.normal);
			}
			await next();
		});
		// 路由预处理
		preRouter(this.#pathMgr, this.getConfig, this.#app);
	}

	/** 获取当前实例的对应配置项
	 */
	get getConfig(): IconfUnit {
		return this.#conf[this.#ident] || {};
	}

	/** 获取本服务的总体配置清单
	 */
	get getConfigAll(): IconfSvr {
		return this.#conf;
	}

	/** 获取服务实例的地址信息集合
	 */
	get pathInfo(): TPathMgr {
		return this.#pathMgr;
	}

	/** 启动服务实例
	 *
	 */
	start() {
		const _portVal_ = this.#conf.unit[this.#ident]?.port || 0;
		if (_portVal_) {
			let svrMode = '';
			if (this.#conf.cert.key) {
				const server = http2.createSecureServer(this.#conf.cert, this.#app.callback());
				server.listen(_portVal_, (err: Error) => {
					tEcho(err, '启动失败', 'err');
				});
				svrMode = '/S';
			} else {
				this.#app.listen(_portVal_);
			}
			this.#timeTask.start();
			bootWelcome(svrMode, _portVal_);
		} else {
			tEcho('启动失败', '异常', 'err');
			terminat('启动失败');
		}
	}

	/** 暂停服务实例
	 *
	 */
	pause() {
		this.#isPause = true;
		this.#timeTask.stop();
	}

	/** 停止服务实例
	 *
	 */
	stop() {
		this.#timeTask.stop();
		process.exit(2);
	}

	restart() {
		this.#timeTask.stop();
		process.exit(2);
	}
}

module.exports = Svr;
