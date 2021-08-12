import type { ParsedPath } from 'path';
import type { IObj, MSG_TYPE } from 'tmind-core';
import type * as Koa from 'koa';

export declare type pathType = 'conf' | 'logs' | 'script' | 'cert' | 'license' | 'router' | 'task' | 'any';

// 请求响应的返回数据格式
export declare interface IResData {
	// 原始请求 ID
	reqId: number,
	// 响应状态码
	code: number,
	// 返回数据
	data: any,
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

/** tFrameV9 服务实例基类
 */
export declare class Isvr {
	/** 调用文件的 __dirname
	 * @param appPath
	 */
	constructor(appPath: string)
	/** 获取当前实例的对应配置项
	 */
	get getConfig(): IconfUnit;
	/** 获取本服务的总体配置清单
	 */
	get getConfigAll(): IconfSvr;
	/** 获取服务实例的地址信息集合
	 */
	get pathInfo(): PathMgr;
	/** 启动服务实例
	 */
	start(): void;
	/** 暂停服务实例
	 * @param time 暂停时间，若为空，则一直暂停到手工重启为止，否则在暂停时间结束后自动重启
	 */
	pause(time?: number): void;
	/** 停止服务实例
	 */
	stop(): void;
	/** 重启服务实例
	 */
	restart(): void;

}

/** 标准日志结构
 *
 */
export declare interface IsvrLog {
	/** 日志ID，来源为入口请求ID或服务端实例ID
	 */
	logId: number,
	/** 日志描述
	 */
	msg: string,
	/** 日志栈
	 */
	stack: string,
	/** 异常代码
	 */
	code: number,
	/** 发生时间
	 */
	datatime: string,
	/** 日志类型
	 */
	type: MSG_TYPE,
	/** 日志级别
	 */
	level: number
}

/** 服务实例日志记录器
 *
 */
export declare class Logger {
	/** 初始化
	 *
	 * @param ident 日志记录器挂载实例的标识
	 * @param id 日志记录器挂载实例的当前运行时ID
	 */
	constructor(ident: string, id: number)
	/** 写入基本日志记录信息
	 *
	 * @param msg 要写入日志的信息文本
	 * @param currLogType 当前日志信息的自定义类型
	 * @param type 日志类型： info / succ
	 * @param reqId 触发该日志的请求ID
	 */
	setInfo(msg: string, currLogType: logType, type: MSG_TYPE, reqId?: number)
	/** 写入警告信息
	 *
	 * @param msg 要写入的警告信息文本
	 * @param currLogType 当前警告信息的自定义类型
	 * @param reqId 触发该警告信息的请求ID
	 */
	setWarn(msg: string, currLogType: logType, reqId: number)
	/** 写入异常日志
	 *
	 * @param err 要写入的异常 Error 对象，或异常信息文本
	 * @param currLogType 当前异常的自定义类型
	 * @param reqId 触发异常的请求ID
	 */
	setErr(err: Error | string, currLogType: logType, reqId?: number)
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

/** 服务实例路径管理器
 *
 */
export declare class  PathMgr {
	constructor()
	/** 获取工程实例所在基地址的文件夹名称
	 */
	get rootFolder(): string
	/** 获取工程实例所在基地址
	 */
	get rootPath(): string
	/** 获取服务实例所在根地址的文件夹名称
	 */
	get svrFolder(): string
	/** 获取服务实例根地址
	 */
	get svrPath(): string
	/** 获取启动文件所在的文件夹名称
	 */
	get appFolder(): string
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

/**
 *
 */
export declare class IlogJson {
	[k: string]: IsvrLog[]
}

/** 服务端定时任务调度器
 *
 */
export declare class TimeTask {
	constructor(conf: IconfSvr)
	/** 预储备定时任务队列
	 *
	 * @param immediately 储备完成后是否立即开始定时任务调度
	 * @param taskUnit 要储备的定时任务
	 */
	prepare(immediately: boolean, ...taskUnit: any)
	/** 开始执行定时任务调度
	 *
	 */
	start()
	/** 停止定时任务调度器
	 *
	 */
	stop()
}

/** DbDriver 初始化配置对象
 *
 */
export declare interface IdbOption extends IconfUnit {
	[k: string]: any;
}

/** DbDriver 的查询参数
 *
 */
export declare interface IdbQueryObj {
	/** 要查询的表名
	 */
	ident: string,
	/** 要查询的字段范围
	 */
	fieldRange?: string[],
	/** 查询条件，对象代表 or，数组代表 AND
	 *
	 */
	condition?: IObj<string | number | boolean> | IObj<string | number | boolean>[]
	order?: string[]
	limit?: number,
	joinL?: string | string[],
	joinR?: string | string[],
	union?: string | string[],
	unionAll?: string | string[]
}

export declare class DbDriver {
	init(opt: IdbOption)
	exec(string)
	backup()
}

export declare class Orm {
	constructor(opt: IdbOption)
	/** 初始化目标数据库
	 *
	 */
	private initDb()
	/** 初始化目标库的表结构
	 *
	 */
	private initTable()
	/** 初始化目标库的表中默认数据
	 *
	 */
	private initData(opt: IconfUnit)
}

export { };
