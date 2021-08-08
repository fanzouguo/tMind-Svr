import type * as koaApp from 'koa';
import type { IconfUnit, PathMgr } from '../../@types';

const Router = require('koa-router');
const glob = require('glob-all');

module.exports = async (currPath: PathMgr, conf: IconfUnit, app: koaApp) => {
	const rObj = conf.prefix ? {
		prefix: `/${conf.ident}`
	} : {};
	const router = new Router(rObj);
	const handlerFiles: string[] = glob.sync(currPath.getPath('router', '**/*.?s'));
	for (const v of handlerFiles) {
		const _hName: string = v.split('/@handler/')[1];
		const { dir: urlPath, name: methodType } = currPath.parse(_hName);
		const _strUrl = `/${urlPath}`;
		const _strMethod = methodType.toLowerCase();
		const _obj = require(v);
		const tp = typeof _obj;
		if (tp === 'function') {
			router[_strMethod](_strUrl, async (ctx2: koaApp.Context, next2: koaApp.Next) => {
				ctx2.body = _obj(ctx2);
				await next2();
			});
		} else if (tp === 'object' && _obj.func) {
			const _strParam = (Array.isArray(_obj?.param) && _obj?.param.length) ? `/:${_obj.param.join('/:')}` : '';
			router[_strMethod](`${_strUrl}${_strParam}`, async (ctx2: koaApp.Context, next2: koaApp.Next) => {
				ctx2.body = _obj.func(ctx2);
				await next2();
			});
		}
	}
	app.use(router.routes());
	app.use(router.allowedMethods());
};
