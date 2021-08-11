import type { ParsedPath } from 'path';
import type { IObj, MSG_TYPE } from 'tmind-core';
import type * as KoaApp from 'koa';

declare namespace tmindSvr {
	export declare type pathType = 'conf' | 'logs' | 'script' | 'cert' | 'license' | 'router' | 'task' | 'any';

	export declare type httpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

	/* eslint-disable no-unused-vars */
	export declare const enum INFO_TYPE {
		/** 通用信息
		 */
		Normal_Info = 11000,
		/** 服务已启动
		 */
		Svr_Boot = 11101,
		/** 服务已恢复
		 */
		Svr_Resumed = 11102,
		/** 未标识的网络接入请求
		 */
		Req_In = 11201,
		/** 输出未标识的网络请求响应
		 */
		Req_Out = 11302,
		/** 接口请求
		 */
		Req_Io = 11401,
		/** 数据库操作
		 */
		Exec_Db = 11501
	}

	export declare const enum WARN_TYPE {
		/** 通用警告
		 */
		Normal_Warn = 12000,
		/** 服务已停止
		 */
		Svr_Stoped = 12001,
		/** 服务已暂停
		 */
		Svr_Paused = 12002
	}

	export declare const enum ERR_TYPE {
		/** 未定义的异常
		 */
		Unkown_ERR = 13000,
		/** 服务端启动异常
		 */
		Boot_Err = 13001,
		/** 服务端 Licese 异常
		 */
		License_Err = 13002,
		/** 服务端 SSL 文件异常
		 */
		Cert_Err = 13003,
		/** 服务端配置异常
		 */
		Config_Err = 13004,
		/** 服务端HTTP请求异常
		 */
		Svr_Http_Request_Err = 13005,
		/** 服务端内全局捕获的异常
		 */
		Svr_Catch_Err = 13006,
		/** 服务端代码内未捕获的异常
		 */
		Svr_UnCatch_Err = 13007,
		/** 服务端未处理的 Reject
		 */
		Svr_UnHandled_Reject = 13008,

		/** 数据库启动异常
		 */
		Db_Boot_Err = 13010,
		/** SQL语句执行异常
		 */
		Sql_Err = 13011,
		/** 接口连接异常
		 */
		Io_Link_Err = 13020,
		/** 接口执行异常
		 */
		Io_Exec_Err = 13021,
		/** 日志服务连接异常
		 *
		 */
		Log_Link_Err = 13031,
		/** 日志服务写入异常
		 *
		 */
		Log_Write_Err = 13032
	}

	/** 请求响应成功的返回数据格式
	 */
	export declare interface IResData {
		// 原始请求 ID
		reqId: number,
		// 响应状态码
		code: number,
		// 返回数据
		data?: any,
		// 响应提示
		msg?: string,
		// 本次请求及响应是否已成功执行完毕（不包含诸如通讯、网络等原因造成的请求失败，仅代表基于请求的响应函数执行状态）
		isOk?: boolean,
		// 与 isOk 互斥，主要以 isOk 为主，isErr 仅从三方开发或接口角度的多样适配性考虑。
		isErr?: boolean
	}

	/** 支持的 SSL 文件类型
	 */
	export declare interface Icert {
		key: string,
		pem?: string,
		ca?: string[],
		cert?: string
	}

	/** 服务单元配置模型
	 */
	export declare interface IconfUnit {
		// 服务索引序号
		id: number,
		/** 服务端实例标识
		 */
		ident: string,
		/** 服务显示名称
		 */
		namezh: string,
		/** 服务描述信息
		 */
		memo: string,
		/** 服务地址，配置管理器初始化时会自动根据 isDev ，从配置文件中该项的元组列表中判断有效的值
		 */
		addr: string,
		/** 服务端口
		 */
		port: number,
		/** 是否将本服务识别标识（ident）作为访问路由的一级前缀
		 */
		prefix?: boolean,
		/** 本服务是否支持跨域
		 */
		corsed?: boolean,
		/** 额外添加的跨域响应头
		 */
		appendCorsHeader: string[],
		/** 禁用的 http 方法，
		 */
		disableMethods: string[],
		/** 跨域白名单
		 */
		corsWhiteList: string[],
		/** 计划任务定时器
		 */
		schedule: string,
		/** 本服务实例是否访问主业务DB服务(true为是，false表示不访问)
		 */
		linkToDb: boolean,
		[k: string]: any
	}

	/** 实例配置
	 */
	export declare interface IconfSvr {
		/** 工程对应的平台蓝图根节点ID
		 */
		id: string,
		/** 工程识别标识
		 */
		ident: string,
		/** 工程名称
		 */
		namezh: string,
		/** 工程级默认服务地址，适用于子服务非分布式部署时的默认值
		 *  工程级服务地址，若是下属各子服务具备独立地址，则需在子服务配置文件中单独指明
		 */
		addr: string,
		/** SSL 验证文件
		 */
		cert: Icert,
		/** token 加盐码
		 */
		secretKey: string,
		/** 工程版本号
		 */
		ver: string,
		/** 是否为开发环境
		 */
		isDev: boolean,
		/** 动态生成的日志服务连接地址
		 */
		loggerUrl: string,
		/** 动态生成的数据库服务连接地址
		 */
		dbUrl: string,
		/** 各服务单元的配置信息
		 */
		unit: IObj<IconfUnit>,
		[k: string]: any
	}

	/** 本机IP信息载荷
	 */
	export declare interface IipInfo {
		/** 智能识别的本机主IP
		 */
		Main: string,
		/** 本机IPV4信息集合
		 */
		IPv4: IObj<any>,
		/** 本机IPV6信息集合
		 */
		IPv6: IObj<any>
	}

	/** 服务端发送 HTTP 请求的参数配置
	 */
	export declare interface IsvrRequestOption {
		/** 服务端请求的远程目标地址
		 *
		 */
		uri: string,
		/** GET请求的参数载荷对象
		 * （如： { foo: 'bar some'} 最终会结合 uri 生成 uri?foo=bar%20some）
		 */
		qs?: IObj<any>,
		/** 要发送的请求 headers
		 *
		 */
		headers?: IObj<any>,
		method?: httpMethod,
		/** 是否自动转换响应数据为JSON格式
		 *	默认为：TRUE
		*/
		json?: boolean
	}

	/** 标准日志结构
	 *
	 */
	export declare interface IsvrLog extends Error {
		/** 日志ID，来源为入口请求ID或服务端实例ID
		 */
		logId?: number,
		/** 日志发射器来源
		 */
		from: string,
		/** 日志标签
		 */
		tag?: string,
		/** 异常代码
		 */
		code?: number | string,
		/** 发生时间
		 */
		datatime?: string,
		/** 日志类型
		 */
		type: MSG_TYPE,
		/** 日志级别
		 */
		level: INFO_TYPE | WARN_TYPE | ERR_TYPE
	}
}

declare module tmindSvr {
	/** 服务实例路径管理器
	 *
	 */
	export declare class PathMgr {
		/** 构造函数
		 * @param appDir 服务端实例的启动文件（JS或TS）所在的当前路径
		 */
		constructor(appDir: string)
		/** 获取工程实例所在基地址的文件夹名称
		 */
		get rootForlder(): string
		/** 获取工程实例所在基地址
		 */
		get rootPath(): string
		/** 获取服务实例所在根地址的文件夹名称
		 */
		get svrForlder(): string
		/** 获取服务实例根地址
		 */
		get svrPath(): string
		/** 获取启动文件所在的文件夹名称
		 */
		get appForlder(): string
		/** 获取启动文件所在的路径
		 */
		get appPath(): string
		/** 获取配置文件根地址
		 */
		get pathConf(): string
		/** 获取日志文件根地址
		 */
		get pathLog(): string
		/** 获取脚本文件根地址
		 */
		get pathScript(): string
		/** 获取外置定时任务脚本根地址
		 */
		get pathTask(): string
		/** 获取外置定时任务脚本根地址
		 */
		get pathRouter(): string
		/** 获取本服务实例中所需的地址构造
		 * @param pathType 地址类型
		 * @param suffix 基于服务实例根地址的其他路径后缀
		 */
		getPath(pathType: tmindSvr.pathType, ...suffix: string[]): string
		/** 判断指定路径的文件是否存在
		 *
		 * @param pathStr 要判断的文件全路径
		 * @returns
		 */
		isExist(pathStr: string): boolean
		/** 调用 nodejs:path的 parse方法
		 *
		 * @param pathStr 要解析的路径
		 * @returns
		 */
		parse(pathStr: string): ParsedPath
	}

	/** 服务端定时任务调度器
	 *
	 */
	export declare class TimeTask {
		/** 初始化构造
		 *
		 * @param currPath 服务实例的地址管理器
		 * @param conf 服务实例的配置管理器
		 * @param ident 当前类所挂载的服务实例的标识
		 */
		constructor(currPath: PathMgr, conf: tmindSvr.IconfSvr, ident: string)
		/** 预储备定时任务队列
		 *
		 * @param taskUnit 要储备的定时任务
		 */
		prepare(...taskUnit: any)
		/** 开始执行定时任务调度
		 *
		 */
		start()
		/** 停止定时任务调度器
		 *
		 */
		stop()
	}

	/** 服务端实例基类
	 */
	export declare class Isvr {
		/** 服务实例标识
		 */
		readonly ident: string;

		/** 服务实例的路径集成管理器
		 */
		readonly pathMgr: PathMgr;

		/** 服务实例的配置集成管理器
		 */
		readonly configAll: tmindSvr.IconfSvr;

		/** 服务实例配置集成管理器中，仅属于本服务的部分
		 */
		readonly config: tmindSvr.IconfUnit;

		/** 服务实例是否运行于SSL安全协议之下
		 */
		readonly onSSL: boolean;

		/** 在终端控制台实时显示日志输出
		 */
		public showLog: boolean;

		/** 初始化构造
		 *
		 * @param appDir 引用该类的 app 主程序路径（__dirname)
		 */
		constructor(appDir: string);

		/** 获取服务端是否为暂停状态
		 */
		get paused(): boolean;

		/** 为服务端实例预置定时任务
		 * @param taskUnit 定时任务集合
		 */
		setTimeTask(...taskUnit: void[] | void[][]);

		/** 创建INFO类日志
		 * @param msg 要写入日志的信息文本
		 * @param currLogType 当前日志信息的自定义类型
		 * @param reqId 触发该日志的请求ID
		 * @param tag 日志标签
		 * @param title 控制台显示时采用的标题
		 */
		setInfo(msg: string | Error, currLogType: tmindSvr.INFO_TYPE, reqId?: number, tag?: string, title?: string, msgType: MSG_TYPE = 'INFO');

		/** 创建WARN类日志
		 * @param msg 要写入日志的信息文本
		 * @param currLogType 当前日志信息的自定义类型
		 * @param reqId 触发该日志的请求ID
		 * @param tag 日志标签
		 */
		setWarn(msg: string | Error, currLogType: tmindSvr.WARN_TYPE, reqId?: number, tag?: string);

		/** 创建ERR类日志
		 * @param msg 要写入日志的信息文本
		 * @param currLogType 当前日志信息的自定义类型
		 * @param reqId 触发该日志的请求ID
		 * @param tag 日志标签
		 */
		setErr(err: string | Error, currLogType?: tmindSvr.ERR_TYPE, reqId?: number, tag?: string);

		/** 服务端发起远程 HTTP 协议请求器
		 *
		 * @param opt HTTP 请求配置对象
		 */
		async http(opt: tmindSvr.IsvrRequestOption): Promise<any>;
		/**  服务端发起远程 HTTP 协议请求器
		 * @param url 目标远程URL地址
		 * @param method 远程请求方法
		 */
		async http(url: string, method?: tmindSvr.httpMethod): Promise<any>;
		/** 服务端发起远程 HTTP 协议请求器
		 *
		 * @param url 目标远程URL地址
		 * @param opt HTTP 请求配置对象
		 */
		async http(url: string, opt?: tmindSvr.IsvrRequestOption): Promise<any>;

		/** 启动服务
		 */
		async start(): void;

		/** 停止服务
		 * @param msg 控制台消息
		 */
		stop(msg?: string): void;

		/** 暂停服务
		 * @param timeTaskAlso 同时停止本实例的定时任务
		 */
		pause(timeTaskAlso: boolean): void;

		/** 恢复服务
		 */
		resume(): void;

		/** 强制终止服务端启动
		 * @param msg 控制台提示信息
		 * @param code 终止码
		 */
		exit(msg?: string, code?: number): void;
	}

	/** 基于 KOA 的nodejs服务端
	 *
	 */
	export declare class KoaSvr extends Isvr {
		/** 初始化构造
		 *
		 * @param appDir 引用该类的 app 主程序路径（__dirname)
		 */
		constructor(appDir: string);
		get app(): KoaApp;
	}

	/** 面向 DB 互操作的服务端
	 *
	 */
	export declare class DbSvr extends Isvr {
		/** 初始化构造
		 *
		 * @param appDir 引用该类的 app 主程序路径（__dirname)
		 */
		constructor(appDir: string);
	}

	export declare class LogSvr extends Isvr {
		/** 初始化构造
		 *
		 * @param appDir 引用该类的 app 主程序路径（__dirname)
		 */
		constructor(appDir: string);
	}
}

export = tmindSvr;
export { };
