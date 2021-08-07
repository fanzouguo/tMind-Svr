"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { tDate } = require('tmind-core');
const bootTask = () => {
    return async (ctx, next) => {
        ctx.reqId = tDate().toNumber();
        if (ctx.originalUrl === '/favicon.ico') {
            ctx.res.end();
        }
        await next();
    };
};
module.exports = bootTask;
//# sourceMappingURL=bootTask.js.map