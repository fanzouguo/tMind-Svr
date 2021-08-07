import type { Terr as TerrClass } from '../@types';
import { ERR_TYPE } from '../enum';
import { tEcho } from 'tmind-core';

class Terr extends Error implements TerrClass {
	public code: ERR_TYPE;

	/** 基于 tFrameV9平台定义的错误码
	 *
	 */
	// public code: ERR_TYPE;
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
	constructor(a: string | Error, b?: ERR_TYPE | boolean, c?: boolean) {
		super(typeof a === 'string' ? a : (a as Error).message);
		const isBoolB = typeof b === 'boolean';
		if (b) {
			this.code = !isBoolB ? (b as ERR_TYPE) : ERR_TYPE.unkownErr;
		} else {
			this.code = ERR_TYPE.unkownErr;
		}
		if (isBoolB || c) {
			tEcho(typeof a === 'string' ? a : (a as Error).message, '异常', 'ERR');
		}
	}
}

export default Terr;
