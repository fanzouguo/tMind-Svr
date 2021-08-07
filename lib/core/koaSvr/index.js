"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseSvr = require('../base/index');
const Koa = require('koa');
class KoaSvr extends BaseSvr {
    constructor(appDir) {
        super(appDir);
        this.#app = new Koa();
        this.#app.use(async (ctx, next) => {
            ctx.body = '测试';
            await next();
        });
    }
    #app;
    start() {
        this.#app.listen(super.config.port);
        super.start();
    }
}
module.exports = KoaSvr;
//# sourceMappingURL=index.js.map