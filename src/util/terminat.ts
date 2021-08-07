const { tEcho } = require('tmind-core');

/** 终止服务启动
 * @param msg 控制台回显信息
 * @code 终止代码：0、license校验失败，1、配置文件集成失败，2、服务端程序启动运行异常
 */
module.exports = (msg: string, title: string, code = 1) => {
	tEcho(msg || '', title || '', 'ERR');
	process.exit(code);
};
