import type { Context, Next } from 'koa';

module.exports = () => {
	return async (ctx: Context, next: Next) => {
		console.log(ctx.ip); // eslint-disable-line
		console.log('权限中间件'); // eslint-disable-line
		await next();
	};
};
