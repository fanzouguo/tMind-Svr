import type { IsvrLog } from '../../@types';

module.exports = (reqStr: string, ...msgOrMsg: string[] | Error[] | IsvrLog[]) => {
	for (const v of msgOrMsg) {
		if (typeof msgOrMsg === 'string') {
			console.log('日志集成处理器', v); // eslint-disable-line
		} else if (msgOrMsg instanceof Error) {
			console.log('日志集成处理器', msgOrMsg.message); // eslint-disable-line
		} else {
			console.log((v as IsvrLog).msg); // eslint-disable-line
		}
	}

	/* eslint-disable no-console */
	// console.log('日志集成处理器', reqStr, msg);
	// 日志处理分为两类格式：
	// 1、koa-logger 中间件的输出格式
	// 2、系统运行时产生的格式
	// 两类格式最终需要统一起来
};
