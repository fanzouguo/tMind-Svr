import type { KoaSvr as KoaSvrClass } from '../../types';
import type * as KoaApp from 'koa';
import BaseSvr from '../base/index';
const Koa =require('koa');

class KoaSvr extends BaseSvr implements KoaSvrClass {
	#app: KoaApp;
	constructor(appDir: string) {
		super(appDir);

		this.#app = new Koa();

		this.#app.use(async (ctx: KoaApp.Context, next: KoaApp.Next) => {
			ctx.body = '测试';
			await next();
		});
	}

	get app() {
		return this.#app;
	}

	start() {
		this.#app.listen(super.config.port);
		super.start();
	}
}

export default KoaSvr;
