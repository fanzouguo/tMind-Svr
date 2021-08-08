import type { ParsedPath } from 'path';
import type { pathType, PathMgr as TpathMgr } from '../../types';
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob-all');

const PATH_CONF = '../../.config';
const PATH_LOG = '../../.data/logs';
const PATH_SCRIPT = '../../.script';
const PATH_CERT = '../../.config/.cert';
const PATH_LICENSE = '../../.config/.license';
const PATH_ROUTER = '@handler';
const PATH_TASK = '@task';

const fmtPath = (pathStr: string) => pathStr.replace(/\\\\|\\/g, '/');

class PathMgr implements TpathMgr {
	#basePath: string;
	#appPath: string;
	/** 启动文件（JS或TS）所在的当前路径
	 *
	 * @param appDir
	 */
	constructor(appDir: string) {
		this.#basePath = fmtPath(process.cwd());
		this.#appPath = fmtPath(appDir);
	}

	/** 获取工程实例所在基地址的文件夹名称
	 *
	 */
	get rootForlder(): string {
		return path.parse(this.rootPath).base;
	}

	/** 获取工程实例所在基地址
	 *
	 */
	get rootPath(): string {
		return fmtPath(path.resolve(this.#basePath, '../..'));
	}

	/** 获取服务实例所在根地址的文件夹名称
	 *
	 */
	get svrForlder(): string {
		return path.parse(this.#basePath).base;
	}

	/** 获取服务实例根地址
	 *
	 */
	get svrPath(): string {
		return this.#basePath;
	}

	/** 获取启动文件所在的文件夹名称
	 *
	 */
	get appForlder(): string {
		return path.parse(this.#appPath).base;
	}

	/** 获取启动文件所在的路径
	 *
	 */
	get appPath(): string {
		return this.#appPath;
	}

	/** 获取配置文件根地址
	 *
	 */
	get pathConf(): string {
		return fmtPath(path.resolve(this.#basePath, PATH_CONF));
	}

	/** 获取日志文件根地址
	 *
	 */
	get pathLog(): string {
		return fmtPath(path.resolve(this.#basePath, PATH_LOG));
	}

	/** 获取脚本文件根地址
	 *
	 */
	get pathScript(): string {
		return fmtPath(path.resolve(this.#basePath, PATH_SCRIPT));
	}

	/** 获取外置定时任务脚本根地址
	 *
	 */
	get pathTask(): string {
		return fmtPath(path.resolve(this.#appPath, PATH_TASK));
	}

	/** 获取外置定时任务脚本根地址
	 *
	 */
	get pathRouter(): string {
		return fmtPath(path.resolve(this.#appPath, PATH_ROUTER));
	}

	/** 获取本服务实例中所需的地址构造
	 *
	 * @param pathType 地址类型
	 * @param suffix 基于服务实例根地址的其他路径后缀
	 */
	getPath(pathType: pathType, ...suffix: string[]): string {
		const preStr = (pathType === 'conf' && PATH_CONF) ||
		(pathType === 'logs' && PATH_LOG) ||
		(pathType === 'script' && PATH_SCRIPT) ||
		(pathType === 'cert' && PATH_CERT) ||
		(pathType === 'license' && PATH_LICENSE) ||
		(pathType === 'router' && PATH_ROUTER) ||
		(pathType === 'task' && PATH_TASK) ||
		'';

		return fmtPath(path.resolve((pathType === 'router' || pathType === 'task') ?
		this.#appPath :
		this.#basePath, preStr, suffix.join('/')));
	}

	/** 确认路径是否存在，如果不存在，则创建
	 * @param pathStr 要判断的路径字符串
	 */
	prePath(pathStr: string) {
		fs.ensure(pathStr);
	}

	/** 判断指定路径的文件是否存在
	 *
	 * @param pathStr 要判断的文件全路径
	 * @returns
	 */
	isExist(pathStr: string): boolean {
		return !!(glob.sync(pathStr).length);
	}

	/** 调用 nodejs:path的 parse方法
	 *
	 * @param pathStr 要解析的路径
	 * @returns
	 */
	parse(pathStr: string): ParsedPath {
		return path.parse(pathStr);
	}
}

module.exports = PathMgr;
