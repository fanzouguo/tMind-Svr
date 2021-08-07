import { tEcho, tDate, smpoo } from 'tmind-core';
const SvrUtil = require('../Class/SvrUtil');

/** 服务实例启动欢迎语
 * @param svrMode SSL 类型（HTTP/HTTPS）
 * @param port 服务监听端口
 */
module.exports = (svrMode: string, port: number) => {
	const { appCopy, consoleStr } = smpoo();
	// @ts-ignore
	tEcho(consoleStr(), '', 'INFO');
	// tEcho(`${company} - ${website}`, '', 'info');
	tEcho(appCopy, '', 'INFO');
	tEcho('-----------------------------------------------------------', '', 'INFO');
	// @ts-ignore
	tEcho(`${tDate().format('YYYY-MM-DD hh:mi:sss')}\n\n`, '', 'info');
	tEcho(SvrUtil.getSvrIp().Main, '', 'INFO');
	tEcho('服务端已运行\n\n    Enjoy it!\n\n', `HTTP${svrMode}：${port}`, 'SUCC');
};
