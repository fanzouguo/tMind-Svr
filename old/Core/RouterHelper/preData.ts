import type { Logger as TLogger, IResData } from '../../@types';
// import { logType } from '../@types';
const HttpException = require('../Class/HttpException');
const preLog = require('./preLog');
const preErr = require('./preErr');
const logType = require('../Enum/logType');

/** 成功状态的消息返回
 *
 * @param reqId 入口请求ID
 * @param data 要返回的数据
 * @returns
 */
 const formatOk = (reqId: number, data: any, logger: TLogger, currLogType: typeof logType): IResData => {
	// preLog(reqId, `请求成功，返回${JSON.stringify(data)}`);
	// this.#logger.setInfo(`请求成功，返回${JSON.stringify(data)}`, )
	logger.setInfo(`请求成功，返回${JSON.stringify(data)}`, currLogType, 'SUCC', reqId);
	return {
		reqId,
		code: 200,
		data: data,
		msg: '',
		isOk: true
	};
};

/** 异常状态的消息返回
 *
 * @param reqId 入口请求ID
 * @param err 要返回的异常
 * @returns
 */
const formatErr = (reqId: number, err: typeof HttpException): IResData => {
	preLog(reqId, err);
	return {
		reqId,
		code: err.errCode ?? 500,
		data: {},
		msg: preErr(err, err.errCode),
		isErr: true
	};
};

module.exports = {
	formatOk,
	formatErr
};
