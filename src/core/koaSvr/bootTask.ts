import type { Context, Next } from 'koa';
import { tDate } from 'tmind-core';

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


export default bootTask;
