// import tmind from '../types/index';
// // import { LOG_END, LOG_DIM } from '../enum/index';
// import { tDate } from '../package/tDate';

// interface ILog {
// 	// 日志发起者ID（可以是终端用户ID，或者用-1表示服务端自运行发起）
// 	senderID: any,
// 	// 日志详情
// 	detail: string | tmind.IObj<any> | Error,
// 	// 日志发生点
// 	logEnd: tmind.tLog.LOG_END,
// 	// 日志维度
// 	logDim: tmind.tLog.LOG_DIM,
// 	// 日志产生日期
// 	logAt: string | number,
// 	// 日志信息类型
// 	msgType: tmind.MSG_TYPE
// }

// /** 日志发生器
//  *
//  * @param senderID 日志发起者ID（可以是终端用户ID，或者用-1表示服务端自运行发起）
//  * @param msg 日志信息（字符串或Error对象，或其他JSON对象）
//  * @param lEnd 日志发生点
//  * @param lDim 日志维度
//  * @param msgType 日志信息类型
//  * @returns ILog 类型对象
//  */
// export const logger = (senderID: number, msg: string | Error, lEnd: tmind.tLog.LOG_END, lDim: tmind.tLog.LOG_DIM = tmind.tLog.LOG_DIM.runtime, msgType: tmind.MSG_TYPE = 'INFO'): ILog => {
// 	if (senderID === -1 && lEnd !== tmind.tLog.LOG_END.BIZ_END && (lDim !== tmind.tLog.LOG_DIM.runtime && lDim !== tmind.tLog.LOG_DIM.ioSync)) {
// 		return {} as never;
// 	} else {
// 		let currMsg: string = '';
// 		if (msg instanceof Error) {
// 			currMsg = msg.toString();
// 		} else if (typeof msg === 'object') {
// 			currMsg = JSON.stringify(msg);
// 		} else {
// 			currMsg = `${msg}`;
// 		}

// 		return {
// 			senderID,
// 			// 日志详情
// 			detail: currMsg,
// 			// 日志发生点
// 			logEnd: lEnd,
// 			// 日志维度
// 			logDim: tmind.tLog.LOG_DIM.runtime,
// 			// 日志产生日期
// 			logAt: tDate().format('yyyy-mm-dd hh:mi:ss.ms'),
// 			// 日志信息类型
// 			msgType
// 		};
// 	}
// };