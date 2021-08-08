import type { ParsedPath } from 'path';
import type { IObj, MSG_TYPE } from 'tmind-core';
import type { ERR_TYPE } from '../enum';

export declare type pathType = 'conf' | 'logs' | 'script' | 'cert' | 'license' | 'router' | 'task' | 'any';
export declare type httpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

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

/** 面向请求响应的异常信息格式化
 *
 */
export declare interface IpreErr {
	/** 面向请求响应的异常信息格式化
	 * @param err 异常的 Error 对象
	 */
	(err: Error): IResData;
	/** 面向请求响应的异常信息格式化
	 * @param errMsg 面向响应端输出的异常文本
	 */
	(errMsg: string): IResData;
	/** 面向请求响应的异常信息格式化
	 * @param err 异常的 Error 对象
	 * @param code 异常码
	 */
	(err: Error, code: number): IResData;
	/** 面向请求响应的异常信息格式化
	 * @param errMsg 面向响应端输出的异常文本
	 * @param code 异常码
	 */
	(errMsg: string, code: number): IResData;
}

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
	getPath(pathType: pathType, ...suffix: string[]): string
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
	/** 服务地址元组，格式为[正式服务地址、测试服务地址]
	 */
	addr: [string, string],
	/** 服务端口，若为 Number 类型，则正式端口和测试端口保持一致，否则形同地址元组
	 */
	port: number | [number, number],
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

/** 基于 tFrameV9平台定义的错误对象
 *
 */
export declare class Terr extends Error {
	/** 基于 tFrameV9平台定义的错误码
	 *
	 */
	public code: ERR_TYPE;
	/** 初始化构造
	 *
	 * @param msg 异常信息文本
	 */
	constructor(msg: string);
	/** 初始化构造
	 *
	 * @param err JS/TS的 Error 对象
	 */
	constructor(err: Error);
	/** 初始化构造
	 *
	 * @param msg 异常信息文本
	 * @param errCode 基于 tFrameV9平台定义的错误码
	 */
	constructor(msg: string, errCode: ERR_TYPE);
	/** 初始化构造
	 *
	 * @param err JS/TS的 Error 对象
	 * @param errCode 基于 tFrameV9平台定义的错误码
	 */
	constructor(err: Error, errCode: ERR_TYPE);
	/** 初始化构造
	 *
	 * @param msg 异常信息文本
	 * @param errCode 基于 tFrameV9平台定义的错误码
	 * @param toConsole 是否输出到控制台
	 */
	constructor(msg: string, errCode: ERR_TYPE, toConsole: boolean);
	/** 初始化构造
	 *
	 * @param err JS/TS的 Error 对象
	 * @param errCode 基于 tFrameV9平台定义的错误码
	 * @param toConsole 是否输出到控制台
	 */
	constructor(err: Error, errCode: ERR_TYPE, toConsole: boolean);
}

/** 服务端实例基类
 */
export declare class Isvr {
	/** 初始化构造
	 *
	 * @param appDir 引用该类的 app 主程序路径（__dirname)
	 * @param shareApp 共享的 app 实例
	 */
	constructor(appDir: string);
	/** 获取服务实例的路径信息集合
	 */
	get pathMgr(): PathMgr | IObj<any>;
	/** 获取服务实例配置信息集合中，关于本实例的部分
	 */
	get config(): IconfUnit | IObj<any>;
	/** 获取服务实例配置信息集合
	 */
	get configAll(): IconfSvr | IObj<any>;
	/** 输出服务端控制台回显
	 * @param msg 要显示的信息正文
	 * @param title 要显示的标题名称
	 * @param msgType 要显示的信息类型
	 */
	echo(msg: any, title?: string, msgType?: MSG_TYPE): void;
	/** 启动服务
	 */
	start(): void;
	/** 停止服务
	 * @param 控制台消息
	 */
	stop(msg?: string): void;
	/** 暂停服务
	 */
	pause(): void;
	/** 恢复服务
	 */
	resume(): void;
	/** 强制终止服务端启动
	 * @param msg 控制台提示信息
	 * @param code 终止码
	 */
	exit(msg?: string, code?: number): void;

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
}

export declare function func1(): void;
export declare function func2(): void;

export { };
