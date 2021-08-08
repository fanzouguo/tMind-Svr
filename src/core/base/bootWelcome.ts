import { tEcho, tDate, smpoo } from 'tmind-core';
const SvrUtil = require('./SvrUtil');

/** 服务实例启动欢迎语
 * @param isSSL SSL 类型（HTTP/HTTPS）
 * @param port 服务监听端口
 */
module.exports = (isSSL: boolean, port: number, svrName?: string) => {
	const { appCopy, consoleStr } = smpoo();
	// @ts-ignore
	tEcho(consoleStr(), '', 'INFO');
	tEcho(appCopy, '', 'INFO');
	tEcho('-----------------------------------------------------------', '', 'INFO');
	// @ts-ignore
	tEcho(`${tDate().format('YYYY-MM-DD hh:mi:sss')}\n\n`, '', 'info');
	tEcho(SvrUtil.getSvrIp().Main, '', 'INFO');
	const _svrNameStr = !svrName ? '' : `[${svrName}]`;
	tEcho(`${_svrNameStr}服务端已启动......\n\n    Enjoy it!\n\n`, `HTTP${isSSL ? '/s' : ''}：${port}`, 'SUCC');
};
