const rq = require('request-promise');
const preLog = require('./preLog');

/** 发送服务端HTTP请求
 * @url 请求地址
 * @reqId 触发该请求的客户端请求ID
 */
module.exports = async (url: string, reqId?: number) => {
	try {
		return await rq(url);
	} catch (err) {
		preLog(reqId || -1, err);
		throw err;
	}
};