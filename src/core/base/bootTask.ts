import type { Context, Next } from 'koa';
const { tDate } = require('tmind-core');

const bootTask = () => {
	return async (ctx: Context, next: Next) => {
		ctx.reqId = tDate().toNumber();
		// 屏蔽 favicon 请求
		if (ctx.originalUrl === '/favicon.ico') {
			ctx.res.end();
		}
		await next();
	};
};


module.exports = bootTask;
