import type * as KoaApp from 'koa';
import BaseSvr from '../base/index';
// const BaseSvr = require('../base/index');
const Koa =require('koa');

class KoaSvr extends BaseSvr {
	#app: KoaApp;
	constructor(appDir: string) {
		super(appDir);

		this.#app = new Koa();

		this.#app.use(async (ctx: KoaApp.Context, next: KoaApp.Next) => {
			ctx.body = '测试';
			await next();
		});
	}

	start() {
		this.#app.listen(super.config.port);
		super.start();
	}
}

export default KoaSvr;
